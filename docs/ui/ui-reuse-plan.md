# Reuse the existing RetroDrive interface

Status: proposed implementation architecture, 2026-09-20. The current browser UI remains the visual and behavioral reference. [Audit](existing-interface-audit.md) inventories its screens and controls.

## Migration sequence

1. Preserve the original application in `apps/simulator-web/`, including CSS, original artwork, test harness and assets. Root npm commands should forward to the workspace so existing setup habits continue to work. Remove generated files from version control; do not delete a developer's installed dependencies as part of that cleanup.
2. Introduce a `TelemetrySource` lifecycle and a contract adapter at the application boundary. Keep existing widgets and stores operational while mapping shared values to their current presentation names. Avoid a simultaneous layout rewrite and transport rewrite.
3. Provide `MockTelemetrySource`, `RecordedTelemetrySource`, `WebSocketTelemetrySource` and `DeviceBridgeTelemetrySource`. Exactly one is active. Stop timers, queued callbacks, subscriptions and scenario ownership before switching. Mark stale all fields from the departed source.
4. Validate schema, finite numbers, units, protocol/session/sequence and field validity before publishing a snapshot. Never fill absent measurements with valid-looking zeros. Preserve measured zero and retain invalid last-known data only as explicitly stale history.
5. Replace source-specific UI commands with a capability-checked command interface. Reconnect becomes a request followed by measured state transition. Mock injection, ignition synthesis and simulated drivetrain controls remain development capabilities.
6. Export palettes, spacing, gauge geometry and visual-profile IDs into `shared/themes/`; export diagnostic profiles into `shared/vehicle-profiles/`. Add explicit mappings where the current IDs differ. CSS, LVGL and Flutter consume generated platform representations from these shared assets.
7. Implement one representative LVGL layout from each required family: JDM GT 93, Mini Heritage, Expedition 60. Establish performance and memory measurements before porting the remaining themes. Flutter reuses hierarchy and assets with native phone sizing and navigation.

## Source boundaries

| Source | Input | Responsibility |
|---|---|---|
| Mock | Existing telemetry/boost/expedition models and scenarios | Controlled simulation clock; honest `simulated` provenance; no hardware side effects |
| Recorded | Validated timestamped canonical frames | Ordered playback/pause/seek/rate; explicit end-of-recording and gap handling |
| WebSocket | Canonical frames from local simulator or bridge | Schema validation, disconnect/stale behavior, bounded queue and reconnection policy |
| Device bridge | Trusted local bridge for a physically connected device | Same validated frames with device/profile/session evidence; no arbitrary ECU write passthrough |

Mock mode remains immediately useful without hardware. Recorded/bridge sources should not be called hardware verified merely because their adapters compile. Keep synthetic media animation separate from vehicle telemetry and label demonstration metadata where it could be mistaken for a real phone connection.

## Porting map

| Existing reference | Embedded LVGL | Flutter |
|---|---|---|
| Fixed cluster canvas / palette tokens | 1024 x 600 scene, styles and bounded refresh | Theme extension and responsive layouts |
| Seven-segment polygons | Predefined segment geometry or licensed font | CustomPainter or original vector geometry |
| Segmented bars / warning lamps | Small fixed set of objects/custom drawing | Reusable stat/gauge widgets |
| Classic needles / damping | Delta-time low-pass interpolation in UI model | Animation driven by the same damping parameters |
| Odometer and original silhouettes | Pre-rendered bounded assets or simple paths | Original asset/SVG or CustomPainter |
| Breadcrumb vector scope | Logical 320 x 188 offscreen canvas, limited vertices | Phone route map plus device preview |
| Warning overlay | Highest priority UI layer; local audio request | Device-origin warning status and detail |
| CSS glow, filters and scanlines | Optional low-cost approximations after profiling | Preserve subtle effect where readability remains clear |
| Browser phone screens | Not embedded views | Native routes with the audited content hierarchy |

One RGB565 full-screen buffer is 1,228,800 bytes (1024 x 600 x 2); two require 2,457,600 bytes before LVGL heap, assets, networking and protocol queues. These are calculations, not measured usage. Confirm the exact board display stack, DMA/PSRAM restrictions, redraw cost and touch driver before selecting buffer strategy. No acceptable frame rate is claimed until hardware measurement.

## Presentation rules

Production top-level modes are Dashboard, Diagnostics, Navigation, Expedition, Media, Vehicle and Settings. Performance/health/trip become subordinate views without losing their current information. Use a touch mode selector; keep desktop keyboard shortcuts in the simulator.

Gauge eligibility follows the intersection of profile capabilities, detected support and valid samples. For unsupported fields, remove the widget or choose an available useful replacement through a shared resolver. For transient loss, show a brief unavailable state then fall back where honest. Stale measurements must not remain animated as live data. Do not replace lost speed with a measured-looking zero, or infer stationarity from unavailable speed.

Measured, calculated, rule-based inference, possible cause and confirmed ECU DTC have distinct presentation labels. Sensor absence does not establish a fault code. Generated scenarios keep a visible simulator context. Local warnings operate with no phone or cloud. Warning acknowledgment does not repair/clear an ECU fault.

Boost appears only for a verified turbo/external-sensor capability and valid MAP/barometric data. Pitch/roll remain informational with configured markers; no universal safety-angle claim. Return-to-start uses recorded trail/bearing information and does not promise a safe route. Do not create a waypoint from invalid or stale coordinates.

## Verification gates

First verify schema/source lifecycle tests and existing HMI regressions. Next capture deterministic visual references for each family and missing-data state. Then verify real touch targets, sunlight/night readability, steady-state and peak heap, redraw latency, warning preemption, screen-change latency and CPU/stack headroom on the actual board. Test phone permission denial, loss/reconnect, device reboot, stale samples and multi-screen navigation separately from the laptop preview.
