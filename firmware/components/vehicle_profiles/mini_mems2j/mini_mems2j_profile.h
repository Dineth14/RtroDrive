#pragma once
#include <cstddef>
namespace retrodrive {
struct MiniProfile { const char* id; const char* verification_status; bool live_data_enabled; };
const MiniProfile& mini_profile();
std::size_t mini_verified_pid_count();
std::size_t mini_verified_fault_count();
}
