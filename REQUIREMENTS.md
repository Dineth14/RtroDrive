# RetroDrive requirements and acceptance gates

Source of truth: [complete supplied production brief](docs/reference/production-brief.txt). The table preserves all 54 sections; the full normative details remain in that source. `Implemented` requires an artifact and a passing test; `vehicle_verified` requires actual vehicle evidence. A design proposal does not satisfy a physical acceptance test.

| ID / brief section | Required outcome | Acceptance / evidence | Initial status |
|---|---|---|---|
| RD-01 Product | Auxiliary multi-protocol expandable vehicle interface; no universal compatibility claim | Profile verification status and support matrix | Architecture |
| RD-02 Display | Exact 1024×600 Waveshare board; no invented pins | Schematic-referenced pinmap, board identity, USB boot | Audit; hardware pending |
| RD-03 Architecture | Functional vehicle-interface daughterboard | Reviewed power/PHY/sensor/control schematic | Proposed |
| RD-04 Harness | All16 J1962 pins; protected configurable OEM paths | Netlist/continuity; no direct OEM-to-MCU drive | Proposed |
| RD-05 Power | Protected12V supply using analyzed LM74900-Q1 topology | UV/OV/current/FET/TVS/thermal calculations and bench data | Calculations/proposal |
| RD-06 Ignition | Optional ACC, bounded flush, load cut, manual bench option | Power-cycle and measured shutdown-current tests | Pending |
| RD-07 CAN | Onboard PHY, ESD, optional disabled termination | USB-CAN capture, termination resistance review | Proposed |
| RD-08 K-Line | L9637D, explicit level compatibility, no fictitious L-Line TX | Logic-level/init/echo/timeout bench captures | Proposed |
| RD-09 Mini |1998 MPi MEMS2J read-only source-backed interface | Init/ID/live/fault/log fixtures and eventual vehicle traces | Unverified; no invented PIDs |
| RD-10 Generic OBD |4 CAN modes, services01/03/09, capability chain, adaptive polling | Simulator/host/bench/vehicle tests | Planned |
| RD-11 Discovery | Stored fingerprint, validated reconnect, safe fallback, VIN nonfatal | FailedVIN/multiECU/reconnect tests | Architecture |
| RD-12 Profiles | Data-driven identity/capabilities/source metadata | Schema validation and explicit unknown values | Planned |
| RD-13 Altezza | Distinguish SXE10/3S-GE and GXE10/1G-FE/year/transmission | No finalized undocumented pins/messages | Unverified scaffold planned |
| RD-14 Future PHY | Protected J1850/OEM provisions; no fake software support | Default DNP links and unavailable capabilities | Proposed |
| RD-15 GNSS |LC76G fix/trails/parking/waypoints/return bearing | Satellite loss/reacquisition and SD trail tests | Simulator only |
| RD-16 IMU | Current lifecycle part, filtered calibrated pitch/roll | Stationary/zero/drift/vibration tests | Simulator only |
| RD-17 Audio | Independent warning audio and priority/ducking | Phone-free tone and fault tests | WebAudio only |
| RD-18 PCB |4 layers, supplier stackup, zones, grounds, accessible TPs | Reviewed layout and zero unexplained ERC/DRC findings | Not laid out |
| RD-19 Sheets |12 named hierarchical KiCad sheets with notes | Editable source and connectivity review | Architecture only |
| RD-20 BOM |Prototype/production candidates, qualification/lifecycle/quotes | Sourced rows, unknown prices TBD | Initial candidates |
| RD-21 UI reuse | Audit/run/preserve; apps/simulator-web;4 TelemetrySource types | Baseline and transport regression tests | Audited |
| RD-22 Telemetry |Shared validity/age/source schema; zero ≠ missing | Cross-language valid/invalid fixtures | Planned |
| RD-23 Embedded UI | LVGL1024×600, seven modes, capability-based gauges | Actual display/touch/frame-time tests | Not ported |
| RD-24 Performance | Preserve period performance hierarchy | Screenshot review and missing-channel checks | Existing web design |
| RD-25 Analogue | Original round instruments and filtered needles | Rendering and damping checks | Existing web design |
| RD-26 Expedition | Trails/waypoints/camp/return/zero/trip controls | Functional actions and persistence | Partial simulator |
| RD-27 Navigation |Phone routing, compact vectors, fast/slow updates | Route geometry bounds and offline fallback | Partial simulator |
| RD-28 Mobile |Flutter Android/iOS, garage, device/settings/navigation screens | App build and device integration | Browser mockup only |
| RD-29 BLE |Versioned binary frames, lengths/sequences/bandwidth | Packet definitions, malformed/fragment/loss tests | Draft architecture |
| RD-30 OTA |Signed update/version checks/rollback/recovery; no secrets | Authenticity/recovery device tests | Pending |
| RD-31 Diagnostics |Local validity-aware warnings, inference vs DTC labels | Threshold/trend/disconnect tests | Simulator rules only |
| RD-32 AI |LocalRuleProvider/MockAIProvider; optional cloud | Offline operation and deterministic explanations | Mock assistant exists |
| RD-33 Media |Original period head-unit styles; warning audio independent | Theme/transport/ducking tests | Simulated playback |
| RD-34 Boot |Original artwork, checks/sweep/link/dashboard | Reboot/cancel/connection visual tests | Web sequence exists |
| RD-35 Logging |BufferedSD CSV, optional binary, removal/full/power loss | Recovery and export tests | Pending |
| RD-36 Test tools |CAN/replay/fault/GPS/IMU simulator and PC bridge | Deterministic fixtures; vcan where available | In-browser engine only |
| RD-37 Firmware |Pinned ESP-IDF, bounded tasks/queues/timeouts/watchdog | Host/IDF build, stack/latency measurements | Proposed |
| RD-38 Quality |Modular testable state machines; tested conversions | Static checks and pure protocol tests | Partial web coverage |
| RD-39 Repository |Coherent hardware/firmware/apps/shared/tools/tests/docs | Clean-machine build and no generated tracked files | Migration planned |
| RD-40 Enclosure |Verified mechanical fit, CAD/STEP/STL/drawing/assembly | Actual fit/strain/mount/thermal evidence | Dimensions not frozen |
| RD-41 Manufacturing |Tagged Gerber/drill/BOM/placement/PDF/STEP release | Release checklist and reproducible tool versions | Blocked by design validation |
| RD-42 Calculations |Power/current/thermal/signal/sense/audio estimates | Assumptions vs simulated vs measured labeled | Initial worksheets |
| RD-43 Tests |Requirement traceability across all subsystems | Recorded pass/fail with setup and artifacts | Matrix created |
| RD-44 Bring-up |15 ordered bench-to-vehicle phases | Phase evidence before dependent connections | Phase1 software baseline |
| RD-45 Safety |Read-only services and bus-load limits | Negative service tests, bus utilization captures | Policy established |
| RD-46 Git |Feature branches, logical commits, no secrets/build outputs | Review staged paths and semantic versions | Feature branch created |
| RD-47 CI |Web/Python/schema/firmware/Flutter/KiCad as available | Executed workflow outputs, no false green physical tests | Planned |
| RD-48 Docs |Build/bench/architecture/vehicle guides | Links and clean-machine rehearsal | In progress |
| RD-49 Cost |1/10/100/1000 unit model, sourced date/currency/qty | Supplier quotations, explicit TBDs | Candidate table |
| RD-50 EE356 |Decisions, worst case/noise/SI/assembly/reliability/cost | Decision log + calculation/test/release evidence | Decision log created |
| RD-51 V1 done |All physical/software exit criteria satisfied | Full verification report | NOT COMPLETE |
| RD-52 Audit first |Tree/UI run/mocks/hardware/pins/overview/requirements/roadmap first | First-deliverable package before major code | In progress |
| RD-53 Evidence |No invented specs/protocols/pins/prices/dimensions/results | Primary sources and explicit uncertainty | Mandatory throughout |
| RD-54 First delivery |A–N audit/design/plan then dependency-ordered code | docs/architecture/first-deliverable.md | In progress |

## V1 exit checklist

- [ ] Existing simulator refactored and functional, including browser QA.
- [ ] Waveshare boots reliably; embedded dashboard frame rate measured and acceptable.
- [ ] Custom schematic passes ERC; PCB passes DRC; reviewed BOM and manufacturing generation work.
- [ ] Protected12V bench supply, ACC shutdown and battery drain measured.
- [ ] CAN bench and Generic OBD real-vehicle operation verified; PID discovery and DTC reading pass.
- [ ] GNSS, IMU, SD logging and independent warning audio pass hardware tests.
- [ ] BLE phone link and live Flutter telemetry work on actual hardware.
- [ ] MEMS2J has source-backed testable read-only transport; available target vehicle tested.
- [ ] Enclosure prototype fits; assembly and thermal inspection pass.
- [ ] Verification report, costed BOM and clean-machine instructions complete.
