#include "vehicle_link.h"
namespace retrodrive {
LinkAction VehicleLinkManager::begin(uint64_t now, Fingerprint stored) {
  stored_ = stored; candidate_ = 0; trying_stored_ = stored.present;
  if (trying_stored_ && ((!response_id(stored.responder,stored.config.extended)) || (stored.config.bitrate != 250000 && stored.config.bitrate != 500000))) trying_stored_ = false;
  config_ = trying_stored_ ? stored.config : can_candidates()[candidate_++];
  selected_ = 0; supported_.clear(); vin_.clear(); profile_ = "generic_can";
  state_ = LinkState::AwaitingQualification; deadline_ = now + 2000;
  return {LinkActionKind::QualifyBus,config_,0,0};
}
LinkAction VehicleLinkManager::qualified(uint64_t now, bool safe) {
  if (state_ != LinkState::AwaitingQualification) return none();
  if (!safe || now >= deadline_) return advance(now);
  state_ = LinkState::Discovering; requested_base_ = 0; deadline_ = now + 1000; earliest_ = now + 100;
  return {LinkActionKind::ReadSupported,config_,trying_stored_?stored_.responder:0,0};
}
LinkAction VehicleLinkManager::advance(uint64_t now) {
  trying_stored_ = false; selected_ = 0; supported_.clear(); vin_.clear();
  if (candidate_ >= can_candidates().size()) {state_ = LinkState::Failed;return none();}
  config_ = can_candidates()[candidate_++]; state_ = LinkState::AwaitingQualification; deadline_ = now + 2000;
  return {LinkActionKind::QualifyBus,config_,0,0};
}
LinkAction VehicleLinkManager::response(uint32_t responder, bool extended, const Bytes& pdu, uint64_t now) {
  if (extended != config_.extended || !response_id(responder,extended) || now >= deadline_) return none();
  if (trying_stored_ && responder != stored_.responder) return none();
  if (selected_ && responder != selected_) return none(); // Never merge ECU capability maps.
  if (state_ == LinkState::Discovering) {
    if (pdu.size() != 6 || pdu[0] != 0x41 || pdu[1] != requested_base_ || !supported_.consume(pdu)) return none();
    selected_ = responder;
    requested_base_ = supported_.next_base();
    // Sending the next request is deferred to tick, preserving the global minimum gap.
    if (requested_base_ < 0) state_ = LinkState::ReadingVin;
    deadline_ = 0;
  } else if (state_ == LinkState::ReadingVin && deadline_ != 0) {
    std::string value;
    if (decode_vin(pdu,value)) vin_ = value;
    else if (!(pdu.size() == 3 && pdu[0] == 0x7F && pdu[1] == 0x09)) return none();
    state_ = LinkState::Ready; // VIN is optional, including negative response.
  }
  return none();
}
LinkAction VehicleLinkManager::tick(uint64_t now) {
  if (state_ == LinkState::Ready || state_ == LinkState::Failed || state_ == LinkState::Idle) return none();
  if (deadline_ == 0 && now >= earliest_) {
    deadline_ = now + 1000; earliest_ = now + 100;
    if (state_ == LinkState::ReadingVin) return {LinkActionKind::ReadVin,config_,selected_,2};
    if (state_ == LinkState::Discovering) return {LinkActionKind::ReadSupported,config_,selected_,static_cast<uint8_t>(requested_base_)};
  }
  if (deadline_ != 0 && now >= deadline_) {
    if (state_ == LinkState::ReadingVin) {state_ = LinkState::Ready;return none();}
    // Retain a validated generic link if a later capability block times out.
    if (state_ == LinkState::Discovering && selected_ != 0) {state_ = LinkState::Ready;return none();}
    return advance(now);
  }
  return none();
}
bool VehicleLinkManager::confirm_profile(const std::string& id, bool confirmed) {
  // No exact model identity is established by this generic implementation.
  if (state_ != LinkState::Ready || !confirmed || id != "generic_can") return false;
  profile_ = id; return true;
}
}
