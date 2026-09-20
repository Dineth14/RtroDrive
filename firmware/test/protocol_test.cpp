#include "obd.h"
#include "isotp.h"
#include "mini_mems2j_protocol.h"
#include "mini_mems2j_profile.h"
#include <cassert>
#include <cmath>
#include <iostream>
using namespace retrodrive;
int main() {
  double value = 99;
  assert(decode_pid(0x0C, {0x41,0x0C,0x1F,0x40}, value) && value == 2000);
  assert(decode_pid(0x05, {0x41,0x05,0}, value) && value == -40);
  assert(decode_pid(0x11, {0x41,0x11,255}, value) && value == 100);
  assert(decode_pid(0x42, {0x41,0x42,0x37,0x78}, value) && std::abs(value - 14.2) < 0.001);
  assert(!decode_pid(0x0C, {0x41,0x0C,1}, value));
  assert(!decode_pid(0x0C, {0x42,0x0C,1,2}, value));
  assert(!decode_pid(0xAA, {0x41,0xAA,1}, value));
  assert(allowed_read_service(1) && allowed_read_service(3) && allowed_read_service(9));
  assert(!allowed_read_service(4) && !allowed_read_service(0x2E));
  SupportedPids pids;
  assert(pids.next_base() == 0 && !pids.supports(0x0C));
  assert(!pids.consume({0x41,0x20,0,0,0,0}));
  assert(pids.consume({0x41,0,0,0x18,0,1})); // RPM, speed, next bitmap
  assert(pids.supports(0x0C) && pids.supports(0x0D) && !pids.supports(0x05));
  assert(pids.next_base() == 0x20);
  assert(pids.consume({0x41,0x20,0,0,0,0}) && pids.next_base() == -1);
  PollScheduler scheduler;
  assert(scheduler.next(0,pids) == 0x0C && scheduler.next(10,pids) == -1);
  assert(scheduler.next(100,pids) == 0x0D); scheduler.failed(101); assert(scheduler.next(500,pids) == -1);
  pids.clear(); assert(pids.next_base() == 0 && !pids.supports(0x0C));
  assert(can_candidates().size() == 4);
  assert(physical_request_id(0x7E8,false) == 0x7E0);
  assert(physical_request_id(0x18DAF110,true) == 0x18DA10F1);
  assert(!response_id(0x18DA10F1,true));
  IsoTpReceiver iso(0x7E8,false);
  assert(iso.feed({0x7E9,false,{0x03,0x41,0x05,80}},0) == ReceiveResult::Ignored);
  assert(iso.feed({0x7E8,false,{0x03,0x41,0x05,80}},0) == ReceiveResult::Complete);
  assert(iso.payload() == Bytes({0x41,0x05,80}));
  const Bytes vinbytes{'W','V','W','Z','Z','Z','1','J','Z','X','W','0','0','0','0','0','1'};
  Bytes vinpdu{0x49,0x02,0x01}; vinpdu.insert(vinpdu.end(),vinbytes.begin(),vinbytes.end());
  Bytes first{0x10,20}; first.insert(first.end(),vinpdu.begin(),vinpdu.begin()+6);
  assert(iso.feed({0x7E8,false,first},10) == ReceiveResult::FlowControlRequired);
  assert(iso.flow_control().id == 0x7E0 && iso.flow_control().data[0] == 0x30);
  Bytes second{0x21}; second.insert(second.end(),vinpdu.begin()+6,vinpdu.begin()+13);
  Bytes third{0x22}; third.insert(third.end(),vinpdu.begin()+13,vinpdu.end());
  assert(iso.feed({0x7E8,false,second},20) == ReceiveResult::InProgress);
  assert(iso.feed({0x7E8,false,third},30) == ReceiveResult::Complete);
  std::string vin; assert(decode_vin(iso.payload(),vin) && vin.size() == 17);
  vinpdu[3] = 'I'; assert(!decode_vin(vinpdu,vin));
  assert(iso.feed({0x7E8,false,first},50) == ReceiveResult::FlowControlRequired);
  assert(iso.feed({0x7E8,false,third},60) == ReceiveResult::Error);
  assert(iso.feed({0x7E8,false,first},100) == ReceiveResult::FlowControlRequired);
  assert(iso.expire(1100));
  IsoTpReceiver small(0x7E8,false,10); assert(small.feed({0x7E8,false,first},0) == ReceiveResult::Error);
  std::vector<std::string> dtcs;
  assert(decode_dtcs({0x43,2,0x01,0x71,0xC1,0x23},dtcs) && dtcs[0] == "P0171" && dtcs[1] == "U0123");
  assert(!decode_dtcs({0x43,2,1,0x71},dtcs)); assert(decode_dtcs({0x43,0},dtcs) && dtcs.empty());
  MiniMems2jProtocol mini;
  assert(mini.begin(0,false,true) == MiniAction::None && mini.state() == MiniState::Disabled);
  for (const bool echo : {false,true}) {
    assert(mini.begin(0,true,echo) == MiniAction::DriveLow);
    assert(mini.tick(24) == MiniAction::None); assert(mini.tick(25) == MiniAction::ReleaseHigh);
    assert(mini.tick(50) == MiniAction::Configure10400AndSendStart);
    if(echo) for(const auto b : MiniMems2jProtocol::request) assert(mini.receive(b,60));
    for(const auto b : {0x03,0xC1,0xD5,0x8F,0x28}) assert(mini.receive(static_cast<uint8_t>(b),70));
    assert(mini.state() == MiniState::ConnectedResearchOnly);
  }
  mini.begin(0,true,true); mini.tick(25); mini.tick(50); assert(!mini.receive(0,60) && mini.state() == MiniState::Failed);
  mini.begin(0,true,false); mini.tick(25); mini.tick(50); assert(mini.tick(1050) == MiniAction::Stop);
  mini.begin(0,true,false); assert(mini.tick(100) == MiniAction::Stop);
  assert(!mini_profile().live_data_enabled && mini_verified_pid_count() == 0 && mini_verified_fault_count() == 0);
  std::cout << "PASS OBD conversions/capabilities/polling, addressing, ISO-TP, VIN/DTC, gated Mini init/echo/timeouts\n";
}
