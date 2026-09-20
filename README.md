# RetroDrive

RetroDrive is a vehicle-adaptive auxiliary instrument, diagnostics and expedition display with a **multi-protocol expandable vehicle interface**. The existing1024×600 browser interface is preserved as the visual reference for the embedded display and phone app.

**Current maturity: tested software foundation and sourced design proposal. V1 is not complete. No vehicle is verified, and no fabrication-ready hardware is released.** Read the [A–N engineering deliverable](docs/architecture/first-deliverable.md), [requirements](REQUIREMENTS.md), [roadmap](ROADMAP.md), and [actual verification report](docs/testing/verification-report.md).

## Run the laptop interface

Node22.13.1 is the tested runtime. From the repository root:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`. On Windows PowerShell use `npm.cmd` if execution policy blocks `npm.ps1`. Press Space to boot the mock vehicle; original gauges, themes, phone preview and developer controls remain available. Root commands still work after relocation into `apps/simulator-web`.

To receive canonical synthetic telemetry from a separate process:

```sh
npm run bridge -- temperature-ramp
```

Select **LOCAL BRIDGE** in the web toolbar. The bridge is loopback-only and simulated; it has no vehicle input. Incoming data uses a validity-aware capability view while legacy layouts remain the mock visual reference. Choose a JSONL recording using the adjacent file input for timed replay. Unsupported, invalid and stale measurements are hidden.

## Checks

```sh
npm test
npm run lint
npm run build
npm run test:schemas
npm run test:firmware
python -m unittest discover -s tests/unit -p 'test_*.py' -v
python -m pip install -r requirements-dev.txt
python scripts/validate_json_schemas.py
```

Host firmware tests require `g++` with C++14. Override `CXX` for another compatible compiler. On this Windows machine Python3.11 is available through `py -3.11`; its Store launcher requires execution outside the sandbox. See [verification evidence](docs/testing/verification-report.md) for executed checks and missing toolchains.

## Firmware and mobile

- [Firmware](firmware/README.md): ESP-IDF **v5.5.5** safe scaffold and portable OBD/ISO-TP/MEMS2J research core. Activate IDF, `cd firmware`, `idf.py set-target esp32s3`, `idf.py build`. No GPIO, vehicle transmission, LVGL, BLE, sensors, SD or OTA integration is enabled by the scaffold.
- [Flutter](apps/mobile/README.md): SDK **3.35.7**, shared profile catalog and simulated snapshot preview. Generate platform shells using the documented command, run tests, then build Android. Actual BLE and full companion screen set remain to implement. The browser phone retains the richer UX reference.
- [Vehicle simulator](tools/vehicle-simulator/README.md): deterministic telemetry/fault scenes and a synthetic OBD ECU; Linux vcan adapter supports single-frame replies. Offline VIN segmentation is tested.

## Hardware and vehicle status

The required resolution maps to manufacturer **ESP32-S3-Touch-LCD-5B**; the purchase listing could not be inspected. Confirm physical SKU/revision. [Pin audit](docs/hardware/waveshare-pin-audit.md) found no verified spare external UART/I2S path for all proposed devices; companion-I/O selection remains open. [System architecture](docs/architecture/system-overview.md), [Rev-A sheets](docs/hardware/rev-a-schematic-architecture.md), [initial BOM](hardware/bom/retrodrive-bom.csv), [calculations](hardware/calculations/rev-a-calculations.md) and [manufacturing gates](docs/manufacturing/release-checklist.md) document the design boundaries.

| Target | Software/evidence | Status |
|---|---|---|
| Generic CAN OBD-II | Host-tested decoders, capabilities, polling, receive-side ISO-TP; synthetic ECU | unverified |
|1998 Rover Mini MPi / MEMS2J | Gated reference init/echo/timeout; no qualified live PID or fault table | unverified |
| Altezza SXE10 RS200 / GXE10 AS200 | Separate identity scaffolds; no finalized proprietary pins/messages | unverified |
| Subaru GC8 / Mitsubishi MUT / Defender / Pajero / Land Cruiser | Future profile definitions only | unverified |

No universal compatibility, transient compliance, shutdown-current, thermal, enclosure-fit or real-display-performance claim is made. Prices remain TBD without quotations. The hardware release workflow fails closed; no Gerbers/STEP/STL are fabricated from assumed dimensions.

## Bench development

Follow [ordered bring-up](ROADMAP.md), [test matrix](docs/testing/verification-matrix.md), [transient plan](docs/testing/automotive-transient-test-plan.md), and [assembly procedure](docs/manufacturing/assembly.md). Begin USB-only display, then CAN bench, then current-limited protection tests before vehicle power. Normal operation is read-only; no ECU programming, calibration, actuator commands or Service04 are exposed.

The owner still needs to select a distribution license; [LICENSE](LICENSE) records that no new grant is implied. Original prototype instructions are archived in [legacy simulator notes](docs/ui/legacy-simulator-readme.md); their root paths and feature counts are historical.
