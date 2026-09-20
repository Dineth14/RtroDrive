#pragma once
#include <cstdint>
#include <cstddef>

namespace retrodrive {
enum class MiniState { Disabled, Low, High, Waiting, ConnectedResearchOnly, Failed };
enum class MiniAction { None, DriveLow, ReleaseHigh, Configure10400AndSendStart, Stop };
class MiniMems2jProtocol {
 public:
  MiniAction begin(uint64_t now_ms, bool research_enabled, bool echo_expected);
  MiniAction tick(uint64_t now_ms);
  bool receive(uint8_t byte, uint64_t now_ms);
  MiniState state() const { return state_; }
  static const uint8_t request[5];
 private:
  MiniState state_ = MiniState::Disabled;
  uint64_t deadline_ = 0;
  bool echo_ = false;
  std::size_t echo_index_ = 0, response_index_ = 0;
};
}
