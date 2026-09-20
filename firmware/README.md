# Firmware foundation

ESP-IDF **v5.5.5**, ESP32-S3. This is a build scaffold plus a host-tested protocol library, **not a display firmware release**. `app_main` logs status and configures no GPIO, bus, display, OTA update endpoint or secrets. LVGL8.4.0 is the planned UI baseline; it is not linked until the audited board driver is integrated. No device firmware was flashed here.

With that exact ESP-IDF environment activated:

```sh
cd firmware
idf.py set-target esp32s3
idf.py build
```

From the repository root, `npm run test:firmware` compiles independent C++14 tests with `g++`. Override the compiler via `CXX` if necessary. Implemented: standard PID conversion, chained capability bitmaps, bounded receive-side ISO-TP, VIN/DTC decoders, supported-only scheduler and gated MEMS2J research initialization. The caller must serialize requests per ECU and apply a global budget including discovery and flow control; the scheduler alone is not a measured bus-load controller.

`VehicleLinkManager` is a host-tested coordinator for cached-link validation, four CAN candidates, per-responder capability discovery and nonfatal VIN failure. Every candidate requires explicit adapter qualification before a read request. It selects the first validated responder, never merges another ECU's capabilities, and cannot confirm an exact model from generic evidence.

Missing target integrations: TWAI driver/passive qualification/global bus-time accounting/fingerprint persistence, LVGL, GNSS/IMU, SD, BLE, warning audio, ACC control and signed OTA. See architecture and roadmap. Do not attach an unqualified board/harness to a vehicle based on host test success.
