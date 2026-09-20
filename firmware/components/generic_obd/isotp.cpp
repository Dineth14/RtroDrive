#include "isotp.h"
#include <algorithm>
namespace retrodrive {
ReceiveResult IsoTpReceiver::error() { active_ = false; buffer_.clear(); expected_ = 0; return ReceiveResult::Error; }
bool IsoTpReceiver::expire(uint64_t now) { if (active_ && now >= deadline_) { error(); return true; } return false; }
CanFrame IsoTpReceiver::flow_control() const { return {physical_request_id(id_, extended_), extended_, {0x30, 0, 10, 0, 0, 0, 0, 0}}; }
ReceiveResult IsoTpReceiver::feed(const CanFrame& f, uint64_t now) {
  if (f.id != id_ || f.extended != extended_) return ReceiveResult::Ignored;
  if (!response_id(id_, extended_) || f.data.empty() || f.data.size() > 8) return error();
  if (expire(now)) return ReceiveResult::Error;
  const auto type = f.data[0] >> 4;
  if (type == 0) {
    const std::size_t count = f.data[0] & 15;
    if (count == 0 || count > 7 || count + 1 > f.data.size() || count > capacity_) return error();
    buffer_.assign(f.data.begin() + 1, f.data.begin() + 1 + count); active_ = false;
    return ReceiveResult::Complete;
  }
  if (type == 1) {
    if (f.data.size() != 8) return error();
    expected_ = ((f.data[0] & 15) << 8) | f.data[1];
    if (expected_ <= 7 || expected_ > capacity_) return error();
    buffer_.assign(f.data.begin() + 2, f.data.end()); sequence_ = 1; active_ = true; deadline_ = now + 1000;
    return ReceiveResult::FlowControlRequired;
  }
  if (type == 2) {
    if (!active_ || (f.data[0] & 15) != sequence_) return error();
    const auto remaining = expected_ - buffer_.size();
    const auto count = std::min(std::size_t(7), remaining);
    if (f.data.size() < count + 1) return error();
    buffer_.insert(buffer_.end(), f.data.begin() + 1, f.data.begin() + 1 + count);
    sequence_ = (sequence_ + 1) & 15; deadline_ = now + 1000;
    if (buffer_.size() == expected_) { active_ = false; return ReceiveResult::Complete; }
    return ReceiveResult::InProgress;
  }
  return error();
}
}
