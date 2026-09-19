# First ten Git issues to execute

These are ready-to-file local issue drafts, not claims that remote issues have been created.

| # | Title | Dependencies | Acceptance criteria |
|---|---|---|---|
| 1 | `docs(audit): establish prototype baseline and requirements` | None | Tree, controls/screens, mock inventory, build/test results, all 54 brief sections tracked |
| 2 | `feat(hw): freeze Waveshare revision and pin allocation` | 1 | Exact schematic hash/revision; each used pin mapped; shared/strap/voltage constraints reviewed |
| 3 | `feat(schema): version telemetry and vehicle profile contracts` | 1 | Valid/invalid/unsupported fixtures; provenance and age; nonstandard parameter source metadata required |
| 4 | `refactor(ui): preserve simulator under source adapters` | 3 | Mock/replay/WebSocket/bridge sources; device data never overwritten by mock engine; original layouts pass |
| 5 | `test(can): add deterministic OBD simulator and trace replay` | 3 | Four CAN modes modeled; malformed, negative, multi-ECU and timeout fixtures; optional SocketCAN adapter |
| 6 | `feat(obd): implement safe discovery and capability polling` | 5 | PID00 continuation; bounded ISO-TP; services01/03/09; no unsupported polls; VIN failure nonfatal |
| 7 | `feat(fw): USB-only ESP-IDF display bring-up` | 2,3 | Pinned dependencies, 1024×600 verified on actual board, watchdog/stack/frame measurements |
| 8 | `feat(hw): review protected power and ACC architecture` | 2 | Worst-case LM74900-Q1/FET/TVS/fuse/sense analysis, current-limited tests, measured shutdown drain |
| 9 | `feat(mini): qualify MEMS2J initialization and read-only transport` | 2,5,8 | Datasheet-level translation; timed init and echo tests; documented source-backed commands only |
| 10 | `feat(app): implement Flutter pairing and live telemetry` | 3,7 | Shared profiles, binary BLE reassembly/session handling, unavailable channels hidden, reconnect tests |

Hardware issues require test evidence before closing. Software test success does not close electrical or vehicle validation issues.
