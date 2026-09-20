#include "mini_mems2j_protocol.h"
namespace retrodrive {
// Reference-qualified research bytes only: https://rovermems.com/mems-2j/index.html
const uint8_t MiniMems2jProtocol::request[5] = {0x81, 0x13, 0xF7, 0x81, 0x0C};
MiniAction MiniMems2jProtocol::begin(uint64_t now, bool enabled, bool echo) {
  state_ = enabled ? MiniState::Low : MiniState::Disabled;
  echo_ = echo; echo_index_ = 0; response_index_ = 0; deadline_ = now + 25;
  return enabled ? MiniAction::DriveLow : MiniAction::None;
}
MiniAction MiniMems2jProtocol::tick(uint64_t now) {
  if (state_ == MiniState::Low || state_ == MiniState::High) {
    if (now < deadline_) return MiniAction::None;
    // 10-ms scheduling tolerance is a bench assumption, not a verified ECU requirement.
    if (now > deadline_ + 10) { state_ = MiniState::Failed; return MiniAction::Stop; }
    if (state_ == MiniState::Low) { state_ = MiniState::High; deadline_ = now + 25; return MiniAction::ReleaseHigh; }
    state_ = MiniState::Waiting; deadline_ = now + 1000; return MiniAction::Configure10400AndSendStart;
  }
  if (state_ == MiniState::Waiting && now >= deadline_) { state_ = MiniState::Failed; return MiniAction::Stop; }
  return MiniAction::None;
}
bool MiniMems2jProtocol::receive(uint8_t byte, uint64_t now) {
  if (state_ != MiniState::Waiting) return false;
  if (now >= deadline_) { state_ = MiniState::Failed; return false; }
  if (echo_ && echo_index_ < 5) {
    if (byte != request[echo_index_++]) { state_ = MiniState::Failed; return false; }
    return true;
  }
  static const uint8_t response[5] = {0x03, 0xC1, 0xD5, 0x8F, 0x28};
  if (byte != response[response_index_++]) { state_ = MiniState::Failed; return false; }
  if (response_index_ == 5) state_ = MiniState::ConnectedResearchOnly;
  return true;
}
}
