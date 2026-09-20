#pragma once
#include <array>
#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

namespace retrodrive {
using Bytes = std::vector<uint8_t>;
struct CanConfig { uint32_t bitrate; bool extended; };
const std::array<CanConfig, 4>& can_candidates();
bool allowed_read_service(uint8_t service);
bool decode_pid(uint8_t pid, const Bytes& pdu, double& value);
bool decode_vin(const Bytes& pdu, std::string& vin);
bool decode_dtcs(const Bytes& pdu, std::vector<std::string>& dtcs);
bool response_id(uint32_t id, bool extended);
uint32_t physical_request_id(uint32_t response, bool extended);

class SupportedPids {
 public:
  bool consume(const Bytes& pdu);
  bool supports(uint8_t pid) const;
  int next_base() const;
  void clear();
 private:
  std::array<uint32_t, 8> maps_{};
  std::array<bool, 8> known_{};
};

enum class Tier { Fast, Medium, Slow };
struct PollItem { uint8_t pid; Tier tier; };
struct PollRates { uint32_t fast_ms = 200, medium_ms = 500, slow_ms = 2000, minimum_request_ms = 100; };
class PollScheduler {
 public:
  explicit PollScheduler(PollRates rates = {}): rates_(rates) {}
  int next(uint64_t now_ms, const SupportedPids& supported);
  void failed(uint64_t now_ms);
 private:
  PollRates rates_;
  std::array<uint64_t, 10> due_{};
  uint64_t next_request_ = 0;
};
}
