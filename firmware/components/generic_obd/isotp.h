#pragma once
#include "obd.h"

namespace retrodrive {
struct CanFrame { uint32_t id; bool extended; Bytes data; };
enum class ReceiveResult { Ignored, InProgress, FlowControlRequired, Complete, Error };
class IsoTpReceiver {
 public:
  IsoTpReceiver(uint32_t response, bool extended, std::size_t capacity = 256): id_(response), extended_(extended), capacity_(capacity) {}
  ReceiveResult feed(const CanFrame& frame, uint64_t now_ms);
  bool expire(uint64_t now_ms);
  CanFrame flow_control() const;
  const Bytes& payload() const { return buffer_; }
 private:
  ReceiveResult error();
  uint32_t id_; bool extended_; std::size_t capacity_, expected_ = 0;
  uint8_t sequence_ = 1;
  uint64_t deadline_ = 0;
  bool active_ = false;
  Bytes buffer_;
};
}
