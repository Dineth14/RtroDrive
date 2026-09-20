#include "mini_mems2j_profile.h"
namespace retrodrive {
// Do not borrow MEMS1.6 / ROSCO fault commands for MEMS2J.
std::size_t mini_verified_fault_count() { return 0; }
}
