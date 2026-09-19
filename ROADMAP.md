# RetroDrive implementation roadmap

The sequence below is a dependency plan, not a promise of physical validation in this coding session. Procurement and access to actual vehicles determine dates. No vehicle is verified yet.

| Week | Work and dependencies | Exit evidence |
|---|---|---|
| 1 | Run and audit existing UI; preserve design; pin exact Waveshare revision; establish schema, source adapters, read-only protocol tests and repository hygiene | Baseline report, first deliverable, host tests, board-source audit |
| 2 | USB-only Waveshare display bring-up; LVGL screens from existing tokens; stack/PSRAM/frame timing instrumentation; CAN bench using USB-CAN | Real display boot/frame measurements; four CAN configuration bench captures |
| 3 | Generic OBD capability discovery, bounded ISO-TP, multiple-ECU handling, VIN/DTC reads, fingerprint reconnect; simulator and bridge | Malformed-frame/timeout/reconnect tests, unsupported PID never polled |
| 4 | Finalize power/ACC, K-Line translation, grounding and PCB schematics; obtain supplier stackup; review ERC and calculations | Reviewed schematic, worst-case analysis, current-limited power prototype data |
| 5 | Power bench sweep and ACC shutdown; separately powered CAN + ground vehicle test; source-qualified Mini initialization/echo bench tests | Measured drain/thermal records; vehicle logs; no fabricated Mini data |
| 6 | GNSS/IMU calibration, buffered SD logging/failure recovery, warning audio; Flutter BLE pairing/live data/navigation vectors | Bench sensor/SD/audio tests; app reconnect/packet-loss reports |
| 7 | PCB layout, DRC, assembly/test fixtures, protected supply vehicle integration after bench approval; Mini vehicle test if available | Tagged hardware candidate, reviewed manufacturing outputs, vehicle matrix updates |
| 8 | HIL/regression/thermal runs, enclosure fit from verified dimensions, costed quotes, clean-machine builds and documentation | Verification report and explicit V1 checklist; unresolved items remain open |

## Mandatory physical order

1. Run existing laptop simulator and document its screens.
2. Bring up Waveshare over USB and run the display.
3. Test CAN with USB-CAN, without vehicle power.
4. Exercise Generic CAN OBD simulation.
5. Build and validate protected power with a current-limited supply.
6. Attach only CAN + ground to a suitable vehicle with separate device power as required.
7. Enable vehicle power only after protection tests.
8. Build L9637 K-Line interface and verify logic levels.
9. Bench-test K-Line init, echo, timeout and reconnect.
10. Test the 1998 Mini MPi/MEMS2J against source-qualified requests.
11. Integrate GNSS/IMU, then BLE app.
12. Fabricate reviewed PCB; complete HIL and vehicle validation.
13. Freeze enclosure after actual fit, mounting, strain and thermal checks.

## First implementation slice

After the first-deliverable audit: keep the laptop UI working, separate its data sources, add versioned telemetry and vehicle profile contracts, implement safe host-testable diagnostic primitives, and establish CI. Hardware outputs, Flutter hardware connectivity, LVGL performance and physical validation are subsequent gates; empty files do not satisfy them.
