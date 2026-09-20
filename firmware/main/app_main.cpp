#include "esp_log.h"
#include "obd.h"

extern "C" void app_main() {
  // No GPIO, vehicle PHY or unqualified display driver is enabled by this scaffold.
  ESP_LOGI("retrodrive", "0.1.0 engineering bring-up; hardware transmission disabled");
  ESP_LOGI("retrodrive", "Protocol core ready; %u candidate CAN configurations",
           static_cast<unsigned>(retrodrive::can_candidates().size()));
}
