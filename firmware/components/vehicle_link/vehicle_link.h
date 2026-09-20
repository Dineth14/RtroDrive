#pragma once
#include "obd.h"

namespace retrodrive {
enum class LinkState { Idle, AwaitingQualification, Discovering, ReadingVin, Ready, Failed };
enum class LinkActionKind { None, QualifyBus, ReadSupported, ReadVin };
struct LinkAction { LinkActionKind kind; CanConfig config; uint32_t responder; uint8_t pid; };
struct Fingerprint { bool present = false; CanConfig config{500000,false}; uint32_t responder = 0; };

// Portable coordinator. The adapter must qualify each bus in listen-only mode
// and must implement an installation-wide request/response bus-time budget.
class VehicleLinkManager {
 public:
  LinkAction begin(uint64_t now_ms, Fingerprint stored = {});
  LinkAction qualified(uint64_t now_ms, bool safe_to_probe);
  LinkAction response(uint32_t responder, bool extended, const Bytes& pdu, uint64_t now_ms);
  LinkAction tick(uint64_t now_ms);
  LinkState state() const { return state_; }
  const SupportedPids& supported() const { return supported_; }
  const std::string& vin() const { return vin_; }
  uint32_t selected_responder() const { return selected_; }
  bool confirm_profile(const std::string& id, bool user_confirmed);
  const std::string& profile() const { return profile_; }
 private:
  LinkAction advance(uint64_t now_ms);
  LinkAction none() const { return {LinkActionKind::None,config_,selected_,0}; }
  LinkState state_ = LinkState::Idle;
  CanConfig config_{500000,false};
  Fingerprint stored_{};
  bool trying_stored_ = false;
  std::size_t candidate_ = 0;
  uint32_t selected_ = 0;
  uint64_t deadline_ = 0, earliest_ = 0;
  int requested_base_ = 0;
  SupportedPids supported_;
  std::string vin_, profile_ = "generic_can";
};
}
