# Verification report — production foundation

Date: 2026-09-20. Scope: repository/software foundation after the audit. This is not the V1 completion or vehicle verification report.

| Check | Actual outcome |
|---|---|
| Preserved UI regression | PASS: 12 checks across 13 personalities, all registered cluster layouts and seven media styles; stale count/media expectations repaired |
| TypeScript | PASS: app project type-check |
| Web production build | PASS: Vite builds relocated application |
| Node contract/bridge/BLE tests | PASS: nine test cases including loopback handshake/origin restrictions, zero/null, malformed metadata, sequence wrap, CRC, minimum-MTU reassembly and stale session rejection |
| Source adapter tests | PASS: recording validation/order/session, replay cancellation, stale-channel hiding and measured zero rendering |
| C++ host protocol tests | PASS: MinGW GCC6.3.0, C++14, Wall/Wextra/Werror/pedantic; OBD conversion/capability/polling, CAN addressing, ISO-TP, VIN/DTC, Mini initialization and discovery/fingerprint/fallback/ECU-isolation/VIN-timeout vectors |
| Relocated dev-server HTTP smoke | PASS: entry page, application and source modules served by a freshly started Vite process |
| Local documentation links | PASS: Markdown file targets exist |
| Python ECU simulator | PASS: Python3.11.9, six tests; synthetic OBD responses/bitmaps/segmentation and physical-interface refusal |
| JSON Schema | PASS: Draft2020-12 schema validation with installed jsonschema4.26.0; telemetry fixture and nine profile files valid. CI pins4.25.1 separately |
| Browser visual/touch/audio QA | NOT RUN: browser runtime discovered no available browser |
| ESP-IDF target build/flash | NOT RUN locally: ESP-IDF toolchain unavailable; pinned CI job defined but not executed in this session |
| Flutter build/tests | NOT RUN locally: SDK unavailable; source/model tests and pinned CI build defined; native platform shells require generation |
| Linux vcan | NOT RUN on this Windows host; offline simulator tests passed; vcan adapter currently single-frame only |
| Hardware/ERC/DRC/thermal/transient/enclosure | NOT RUN; no completed KiCad circuit/layout or measured mechanical design exists |
| Real vehicle/BLE/GNSS/IMU/SD | NOT RUN; all vehicle profiles remain unverified |

## Implemented boundary

The existing UI is retained under `apps/simulator-web`; mock uses the original engine behind a source interface. Canonical replay/bridge data uses a separate capability view because older layouts still assume complete simulated data. It hides unavailable/stale values and never exposes mock connection/actuator controls on external sources. Full sparse-data adaptation of every historical layout is still open.

The portable firmware core includes a host-tested VehicleLinkManager that requires adapter bus qualification, validates cached links, searches four candidates, isolates the selected responder, chains capabilities and tolerates absent VIN. It has no ESP32 hardware adapter or persisted fingerprint storage; it does not identify an exact vehicle. MEMS2J startup is a reference-based research state machine disabled by default. Mini ECU identification, live data and fault commands remain unqualified and absent. BLE codecs are tested but are not a paired device transport. Flutter shows a static simulated fixture/catalog only; its parser must be completed against the full untrusted-wire schema before real transport integration.

Hardware documentation is an architecture proposal. Companion MCU selection, exact purchased display revision, actual load/inrush, FET/TVS/regulator/passive values, connector footprints, stackup and mechanical dimensions remain unresolved. The BOM is not costed or assembly-complete. Manufacturing workflow intentionally rejects release; no passing ERC/DRC or fabrication assets are claimed.

## Outstanding completion gates

1. Confirm actual display SKU/revision; freeze companion-I/O and supply topology with full worst-case calculations.
2. Install/pin/run IDF and Flutter clean-machine builds; implement actual display, vehicle, sensor, storage, audio, BLE and shutdown adapters.
3. Review/capture KiCad circuitry, then layout with supplier stackup and verified mechanics; execute ERC/DRC and fabrication-output QA.
4. Perform ordered current-limited power/CAN/K-Line bench tests, then real vehicle validation with raw captures.
5. Complete full mobile/embedded modes, signed OTA recovery and all V1 acceptance tests; manufacture and fit enclosure prototype; obtain actual supplier quotes.

No physical acceptance checkbox is closed by the software results above.
