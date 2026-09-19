# Requirement-to-test traceability

Hardware rows below are **NOT RUN**. Record operator, DUT serial/revision, instrument IDs/calibration, firmware hash, harness, raw capture paths and pass limits for each run. A software simulation cannot promote a profile to bench_verified or vehicle_verified.

| Test ID | Requirements | Procedure / fault cases | Acceptance and evidence |
|---|---|---|---|
| SW-01 |21,24,25,33,34 | Web build, all profiles/layouts render, source changes, boot cancellation | Build/test logs and browser screenshots |
| SW-02 |12,22,29 | Missing/zero/null/stale/invalid samples; schema versions; packet bounds | Reject malformed messages; preserve real zero; unsupported absent |
| PWR-01 |5,42 | Current-limited supply at9,10,12,13.8,14.4,16V; full backlight/radio/logging | All rails within component limits; measured voltage/current/temperature |
| PWR-02 |5,43 | Controlled reverse polarity, brownout, repeated cycles, surge test plan | Protection operates; no damage; documented recovery |
| PWR-03 |6,35 | ACCoff during buffered log, stuck firmware, OBD-only manual off | Bounded flush/cut and measured shutdown current; no invented drain target |
| CAN-01 |7,10 | USB-CAN11/29bit ×250/500k; termination audit | Valid request/response capture in all4 modes; no extra vehicle termination |
| CAN-02 |10,11,45 | Loss/reconnect, malformed DLC/ISO-TP/sequence/timeout; multi-ECU | No crash or merged responders; bounded retries; bus-load budget met |
| OBD-01 |10 | PID00 and continuation bitmaps; unsupported PID request | Only advertised supported PIDs scheduled; proper conversions |
| OBD-02 |10,11,31 | Service03 DTC,09VIN; negative/missing VIN; wrong response service | Correct parsing; VIN failure keeps generic operation; writes rejected |
| KL-01 |8,9 | Scope10400baud8N1; fast/5baud init where qualified; echo/drop/timeout | Logic levels and timing match references; no unsupported routine sent |
| MINI-01 |9,12 | Actual1998MPi/MEMS2J ID/live/fault captures | Source-qualified decoded fields correlate with vehicle; status only then promoted |
| GNSS-01 |15,27 | Cold/warm start, satellite loss/reacquire, stationary heading, trip | Validity/age correct; efficient recoverable trail records |
| IMU-01 |16 | Flat calibration, known pitch/roll, drift, vibration, zero | Documented error/filter response; caution marks informational |
| BLE-01 |28,29 | Pair/reconnect/range, MTU23, fragments, duplicates, loss, new session | Bounds/timeouts; stale sessions rejected; authenticated settings writes |
| UI-01 |23-27,34 | Actual display boot/touch/themes/missing data/overlay/night | Correct1024×600 output, measuredFPS and legibility; no unsupported zeros |
| SD-01 |35 | SD absent/full/removed, power loss mid-record | Bounded RAM, errors surfaced, parseable recovered log prefix |
| AUD-01 |17,31 | Critical warnings with phone disconnected, simultaneous media | Independent warning output and priority handling |
| OTA-01 |30 | Invalid signature/version, interrupted transfer, failed boot | Rejected bad images and confirmed rollback/recovery |
| THERM-01 |5,18,40 | Extended full-backlight WiFi/BLE/logging in specified ambient | Measured component margins and enclosure surface temperatures |
| MECH-01 |40 | Prototype fit, service access, cable strain, mount rigidity | Verified dimensions/photos; no connector strain; antenna/speaker clearance |
| MFG-01 |18-20,41 | ERC/DRC, BOM/placement/netlist review and assembly inspection | No unexplained violations; reproducible tagged fabrication package |

Unit/host checks are reported separately in `verification-report.md` after implementation. Actual numeric physical acceptance limits must be frozen from sourced component ratings and measured loads before testing; do not substitute assumed figures.
