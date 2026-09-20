# RetroDrive first engineering deliverable (A–N)

Prepared2026-09-20 before major new implementation. Maturity: working browser UX prototype, proposed electrical design, unverified vehicle support. This package authorizes the next dependency-ordered software slice; it does not certify hardware or declare V1 complete.

## A. Current repository audit

[Detailed audit](current-repository-audit.md), [UI inventory](../ui/existing-interface-audit.md) and [executed baseline](../testing/baseline-report.md).

Initial tree (generated/vendor contents omitted):

```text
RtroDrive/
  .git/  .claude/
  docs/HMI-V4.md
  src/
    app/ audio/ cluster/{gauges,layouts,media,navigation,widgets}/
    mobile/ simulator/ state/ theme/ types/ utils/ vehicleProfiles/
  scripts/test-v4.mjs
  tests/v4.test.tsx
  index.html  package.json  package-lock.json
  tsconfig{,.app,.node}.json  vite.config.ts
  README.md
  node_modules/  dist/  *.tsbuildinfo  (incorrectly tracked outputs)
```

React18 + TypeScript + Vite + Zustand;1024×600 cluster plus simulated phone and developer panel. Vite production build passes, local HTTP returns200. Initial test aborts because13 visual profiles exist but assertion expects9. Browser interaction is untested because no browser is available. No existing ESP-IDF project, real BLE, PCB or actual vehicle protocol integration was present.

## B. Proposed final repository tree

```text
retrodrive/
  README.md REQUIREMENTS.md ROADMAP.md CHANGELOG.md CONTRIBUTING.md SECURITY.md
  docs/{architecture,hardware,protocols,vehicles,ui,manufacturing,testing,safety,reference}/
  hardware/
    pinmap.csv
    kicad/retrodrive-interface/  bom/  datasheets/  calculations/  manufacturing/  3d/
  firmware/
    main/ components/{vehicle_link,generic_obd,kline,vehicle_profiles,gnss,imu,
                      diagnostics,navigation,storage,ble,ui,audio,power}/ test/
  apps/
    simulator-web/{src,tests,index.html,vite.config.ts}/
    mobile/{lib,test,android,ios}/
  shared/{schemas,themes,vehicle-profiles,protocol}/
  tools/{vehicle-simulator,telemetry-bridge,log-analyzer,manufacturing}/
  enclosure/{cad,drawings,prototypes}/
  tests/{unit,integration,hil,recordings}/
  scripts/
  .github/{workflows,ISSUE_TEMPLATE}/
```

This is the target tree; missing artifacts remain missing until actually implemented. Manufacturing and CAD directories will not be populated with empty or fabricated release files. A repository license still needs owner selection; do not imply rights to third-party material.

## C. Existing UI reuse plan

[Full plan](../ui/ui-reuse-plan.md). Move the existing application intact into `apps/simulator-web`; retain root run commands. Preserve original SVG vehicle artwork, gauges, boot behavior, layouts, palette tokens and phone screen design. Replace engine bootstrap coupling with `TelemetrySource`: mock, recorded, WebSocket and device bridge. New adapters validate canonical packets, clear absent/stale channels and keep synthetic sources labeled. Flutter and LVGL reproduce the established visual hierarchy with native primitives; React code itself is not a direct LVGL port.

## D. Hardware block diagram

See the [system diagram](system-overview.md). All16 harness pins land on a protected vehicle-interface PCB. Battery feeds fused/reverse/surge/UV-OV/current/EMI protection before Waveshare supply. CAN goes to the onboard PHY. K-Line uses L9637 plus explicit logic adaptation. OEM lines reach only protected configurable expansion. Separate ACC controls bounded shutdown; sensors, warning audio, logging and BLE are subordinate to local vehicle/diagnostic logic.

## E. Rev-A schematic architecture

[Sheet-by-sheet architecture](../hardware/rev-a-schematic-architecture.md), including `00_top` through `11_testpoints`. This is a complete intended sheet/net/function decomposition, not an ERC-passing schematic. Final power component values, spare-I/O solution, supplier stackup and connector mechanical definitions are release blockers. Proposed sheet set covers connector/grounds, power, CAN, K-Line, OEM expansion, ACC, GNSS, IMU, warning audio, Waveshare interconnect and testpoints.

## F. GPIO allocation

Authoritative [pin audit](../hardware/waveshare-pin-audit.md) and [CSV](../../hardware/pinmap.csv) use the manufacturer's family schematic. Existing functions must remain reserved. CAN uses onboard transceiver; external I2C is the intended expansion interface. No free UART/I2S pin allocation is invented: K-Line/GNSS/audio need an audited companion-I/O solution or a documented board change. User supplied [AliExpress listing](https://www.aliexpress.com/item/1005007643787643.html); listing access failed, so selected variant/revision is unresolved. Target remains1024×600, corresponding to the manufacturer's5B family variant.

## G. Initial BOM

[Initial BOM](../../hardware/bom/retrodrive-bom.csv), [cost model](../../hardware/bom/cost-model.csv), [source register](../../hardware/datasheets/source-register.md). Candidate core: Waveshare5B, LM74900-Q1 protection controller with reviewed external FET/TVS/fuse network, ST L9637D with logic translation, LC76G-family GNSS, current-production IMU, independent warning-audio path, protected harness connectors and testpoints. Prototype and production intent must be distinguished. Unknown prices, package/lifecycle/qualification claims and unselected support parts stay TBD/NEEDS VERIFICATION.

## H. Vehicle support matrix

[Detailed matrix](../vehicles/support-matrix.md). Generic CAN is first functional target;1998 Mini MPi/MEMS2J is priority K-Line target. Altezza SXE10/RS200/3S-GE and GXE10/AS200/1G-FE are distinct scaffolds. Subaru GC8, Mitsubishi MUT, Defender and other expedition profiles remain future frameworks. Every profile is `unverified`; visual presets do not establish protocol support. Mini exposes no undocumented PIDs.

## I. Firmware architecture

[Detailed design](firmware.md). Pinned ESP-IDF project with platform-independent C++ protocol core. VehicleLinkManager coordinates fingerprint, detector, GenericOBD, VIN, profile, telemetry and diagnostic managers. Bounded queues and event/timer-driven state machines replace blocking vehicle delays. Separate low-priority storage/BLE/UI work; collect stack, watchdog, frame and bus utilization evidence. Hardware transmit defaults off until board/harness qualification.

## J. Mobile architecture

[Mobile design](mobile-and-ble.md). Flutter Android-first, cross-platform domain/data/presentation separation. Shared profile schema and source-aware samples; garage, onboarding, connection, live data, diagnostics, routing, trips, expedition, media, settings/update/about. Retain browser phone as design reference. Optional explanation provider cannot control warnings or vehicle communication.

## K. BLE message architecture

[Protocol draft](../protocols/retrodrive-ble-protocol.md) and [machine definition](../../shared/protocol/ble-v1.json). Versioned binary envelope with session/sequence/length/time and bounded fragmentation; scaled compact telemetry entries with validity and source; negotiated subscription rates. Slow geometry/control transfers are distinct from fast telemetry. Authenticated, bonded sessions; allowlisted settings/navigation commands; no raw ECU write tunnel. MTU23 behavior and loss/reconnect must be tested on devices before claiming throughput.

## L. Eight-week plan

[Roadmap](../../ROADMAP.md) covers audit, USB display, CAN simulator, power/K-Line review, current-limited tests, vehicle connection, sensors/storage/BLE, PCB/enclosure and release verification. Physical gates follow the brief's ordered15-phase bring-up.

## M. Main technical risks

| Risk | Consequence | Resolution / evidence |
|---|---|---|
| Exact board variant/revision and spare GPIO shortage | Wrong display configuration; impossible direct UART/I2S wiring | Identify actual5B revision; audit schematic; companion-I/O decision |
| Development display environmental limits | Insufficient parked-car temperature margin | Manufacturer limits and measured environmental qualification; reconsider production module if needed |
| Surge/cold-crank/current/thermal unknowns | Damage, resets or overheating | Worst-case component selection plus real transient/thermal tests |
| OBD always-on supply | Battery depletion | ACC load removal and measured drain; manual disconnect for demo |
| Proprietary MEMS2J/Altezza ambiguity | Incorrect commands or misleading telemetry | Provenance-required definitions; source-backed captures; hide unsupported fields |
| Bus scheduling/multipleECUs/ISO-TP loss | Interference or corrupt data | Rate limits, per-responder state, malformed/timeout tests and captures |
| Synthetic data mistaken for vehicle measurements | False diagnostics | Provenance, freshness, capability-driven UI and explicit simulator source |
| BLE bandwidth and platform permissions | Stale display or broken reconnect | Compact packets, bounded queues, session reset, actual Android/iOS tests |
| SD power-loss and enclosure dimensions | Lost logs or unbuildable mechanics | Recovery testing; manufacturer drawings and actual fit before CAD freeze |
| Toolchain/physical access missing | Unverified target artifacts | CI builds where possible; do not claim local Flutter/IDF/KiCad or hardware success |

## N. First10 Git issues

[Ready-to-file issues](first-ten-issues.md), each with dependencies and acceptance criteria. Begin with the baseline, exact board audit, shared schemas and preserved simulator source boundary; then safe protocol core/simulator, USB display, power/K-Line and Flutter integration.

## Next execution boundary

The next coding slice implements testable software foundations and records observed results. Remaining V1 hardware/manufacturing/vehicle work remains explicit in [requirements](../../REQUIREMENTS.md) and [verification matrix](../testing/verification-matrix.md). No hardware release, compatibility certification or measured result is implied by this delivery.
