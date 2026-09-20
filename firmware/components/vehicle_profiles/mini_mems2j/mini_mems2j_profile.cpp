#include "mini_mems2j_profile.h"
namespace retrodrive {
const MiniProfile& mini_profile() {
  static const MiniProfile profile{"mini_mems2j", "unverified", false};
  return profile;
}
}
