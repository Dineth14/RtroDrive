#include "obd.h"
#include <algorithm>

namespace retrodrive {
const std::array<CanConfig, 4>& can_candidates() {
  static const std::array<CanConfig, 4> values{{{500000, false}, {500000, true}, {250000, false}, {250000, true}}};
  return values;
}
bool allowed_read_service(uint8_t s) { return s == 0x01 || s == 0x03 || s == 0x09; }
bool response_id(uint32_t id, bool ext) { return ext ? (id & 0x1FFFFF00U) == 0x18DAF100U && id <= 0x1FFFFFFFU : id >= 0x7E8 && id <= 0x7EF; }
uint32_t physical_request_id(uint32_t id, bool ext) {
  if (!response_id(id, ext)) return 0;
  return ext ? 0x18DA00F1U | ((id & 0xFFU) << 8) : id - 8;
}
bool decode_pid(uint8_t pid, const Bytes& p, double& value) {
  const bool two = pid == 0x0C || pid == 0x10 || pid == 0x42;
  if (p.size() != (two ? 4U : 3U) || p[0] != 0x41 || p[1] != pid) return false;
  const double a = p[2], ab = two ? p[2] * 256.0 + p[3] : 0;
  switch (pid) {
    case 0x04: case 0x11: case 0x2F: value = a * 100.0 / 255.0; return true;
    case 0x05: case 0x0F: value = a - 40.0; return true;
    case 0x0B: case 0x0D: value = a; return true;
    case 0x0C: value = ab / 4.0; return true;
    case 0x10: value = ab / 100.0; return true;
    case 0x42: value = ab / 1000.0; return true;
    default: return false;
  }
}
bool decode_vin(const Bytes& p, std::string& vin) {
  if (p.size() != 20 || p[0] != 0x49 || p[1] != 0x02 || p[2] != 1) return false;
  for (std::size_t i = 3; i < p.size(); ++i) {
    const auto c = p[i];
    if (!((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z')) || c == 'I' || c == 'O' || c == 'Q') return false;
  }
  vin.assign(p.begin() + 3, p.end()); return true;
}
bool decode_dtcs(const Bytes& p, std::vector<std::string>& dtcs) {
  if (p.size() < 2 || p[0] != 0x43 || p.size() != 2U + 2U * p[1]) return false;
  std::vector<std::string> result;
  static const char* family = "PCBU";
  static const char* hex = "0123456789ABCDEF";
  for (std::size_t i = 2; i < p.size(); i += 2) {
    if (p[i] == 0 && p[i + 1] == 0) return false; // Padding is not a reported DTC.
    std::string code;
    code += family[p[i] >> 6]; code += hex[(p[i] >> 4) & 3]; code += hex[p[i] & 15];
    code += hex[p[i + 1] >> 4]; code += hex[p[i + 1] & 15]; result.push_back(code);
  }
  dtcs = result; return true;
}
bool SupportedPids::consume(const Bytes& p) {
  if (p.size() != 6 || p[0] != 0x41 || (p[1] % 32) != 0 || p[1] > 0xE0) return false;
  const auto index = p[1] / 32;
  if (index > 0 && (!known_[index - 1] || !(maps_[index - 1] & 1))) return false;
  maps_[index] = (uint32_t(p[2]) << 24) | (uint32_t(p[3]) << 16) | (uint32_t(p[4]) << 8) | p[5];
  known_[index] = true; return true;
}
bool SupportedPids::supports(uint8_t pid) const {
  if (pid == 0) return false;
  const auto index = (pid - 1) / 32, shift = 31 - ((pid - 1) % 32);
  return known_[index] && (maps_[index] & (uint32_t(1) << shift));
}
int SupportedPids::next_base() const {
  for (int i = 0; i < 8; ++i) {
    if (!known_[i]) return i * 32;
    if (!(maps_[i] & 1)) return -1;
  }
  return -1;
}
void SupportedPids::clear() { maps_.fill(0); known_.fill(false); }
int PollScheduler::next(uint64_t now, const SupportedPids& supported) {
  static const std::array<PollItem, 10> items{{{0x0C,Tier::Fast},{0x0D,Tier::Fast},{0x11,Tier::Fast},{0x0B,Tier::Medium},{0x04,Tier::Medium},{0x10,Tier::Medium},{0x05,Tier::Slow},{0x0F,Tier::Slow},{0x42,Tier::Slow},{0x2F,Tier::Slow}}};
  if (now < next_request_) return -1;
  int choice = -1;
  for (std::size_t i = 0; i < items.size(); ++i) if (supported.supports(items[i].pid) && due_[i] <= now && (choice < 0 || due_[i] < due_[choice])) choice = static_cast<int>(i);
  if (choice < 0) return -1;
  const auto tier = items[choice].tier;
  const auto period = tier == Tier::Fast ? rates_.fast_ms : tier == Tier::Medium ? rates_.medium_ms : rates_.slow_ms;
  due_[choice] = now + std::max(uint32_t(1), period);
  next_request_ = now + std::max(uint32_t(100), rates_.minimum_request_ms);
  return items[choice].pid;
}
void PollScheduler::failed(uint64_t now) { next_request_ = now + 2000; }
}
