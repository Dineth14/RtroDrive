# Mobile application and BLE architecture

Status: proposed architecture, 2026-09-20. The existing React phone preview is the visual reference; it is not a native app or working BLE link. The canonical packet definitions belong in `shared/protocol/` and `docs/protocols/retrodrive-ble-protocol.md`; implementations must share their test vectors rather than maintain independent byte layouts.

## Flutter application

Use Flutter for Android and iOS. The project separates views/view models, repositories and platform services, consistent with the [Flutter architecture guide](https://docs.flutter.dev/app-architecture/guide). Keep dependency injection simple through constructors until actual complexity justifies a framework. Pin the Flutter SDK and dependency lockfile when a runnable project is introduced; do not claim native builds ran on an unavailable toolchain.

```text
apps/mobile/
  lib/
    app/                 application, navigation, shared theme
    models/              generated telemetry/profile/protocol models
    repositories/        device, vehicle, telemetry, diagnostics, trips, settings
    services/            BLE transport, secure storage, local files, navigation
    features/
      onboarding/ garage/ connection/ home/ live_data/ diagnostics/
      navigation/ trips/ expedition/ media/ settings/ firmware_update/ about/
    diagnostics/         DiagnosticExplanationProvider and implementations
  test/                  codec vectors, repository lifecycle, widget behavior
  integration_test/      permission, BLE, disconnect, resume and update flows
```

| Feature | Responsibility and required state |
|---|---|
| Onboarding | Explain auxiliary-display role; device pairing; explicit demo mode |
| Garage | Shared-schema manufacturer/model/generation/year/engine/transmission selection; profile verification badge; auto detect |
| Connection | Device identity; stored fingerprint attempt; safe protocol search; optional VIN; suggestion; user profile confirmation |
| Home / live data | Valid capability-based gauges; sample age/source; vehicle and device connection distinguished |
| Diagnostics | ECU DTC evidence, freeze frame if supported, local rule findings and explanation provenance |
| Navigation | Phone route provider, geometry simplification, position/maneuver transfer, degraded standalone device guidance |
| Trips / expedition | Import/export recordings, waypoint names, trail browsing, last parked location; private local storage by default |
| Media | Metadata and supported transport commands; cosmetic themes separated from actual forwarding support |
| Settings | Validated device settings with pending/accepted/rejected state; no optimistic success before acknowledgment |
| Firmware update | Model/version/signature prerequisites, progress, restart, post-update version and health/rollback result |
| About | Firmware/app/schema versions, device identity, verification and source licenses |

Views never generate telemetry or mark a device connected. A `DeviceRepository` owns a single connection session and exposes permission-denied, Bluetooth-off, scanning, pairing, negotiating, active, reconnecting and failed states. Telemetry repositories expose immutable samples plus validity and monotonic receive time. Vehicle communication can be unavailable while the phone-device BLE link remains healthy.

Android's Bluetooth permissions vary by target/platform release; implement the platform's scan/connect requirements rather than assuming location permission is sufficient. See [Android Bluetooth permissions](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions). iOS transport is an adapter around [Core Bluetooth](https://developer.apple.com/documentation/corebluetooth). Permission denial and background suspension are normal states: preserve offline data, invalidate old live readings and reconnect through the repository. Test actual OS lifecycle behavior on phones; no background reliability is promised from a simulator.

`DiagnosticExplanationProvider` accepts evidence and returns possible causes/recommended checks with a named provider and evidence provenance. Supply `LocalRuleProvider`, explicit `MockAIProvider`, and an optional cloud implementation. Cloud upload requires deliberate user consent to the selected data; VIN/location are excluded unless needed and authorized. Keep keys in secure device storage or an authenticated backend. Local device warnings, vehicle communication and DTC acquisition never depend on this provider.

## BLE service and message responsibilities

Use standard Device Information where appropriate and one vendor RetroDrive service with characteristics for negotiation/control, fast telemetry, reliable events and bulk data. Logical message families cover vehicle connection, telemetry, diagnostics, navigation, trip, settings, media and firmware update. Separate logical families without creating unnecessary independent GATT services. Assign project-owned UUIDs in the canonical protocol manifest; no claim that these are Bluetooth SIG-assigned values.

| Family | Direction | Delivery policy |
|---|---|---|
| Hello/capability negotiation | Both | Reliable request/reply; explicit schema/protocol/device version |
| Vehicle connection/profile | Device to phone; profile selection phone to device | Evidence-bearing events, deliberate profile confirmation |
| Fast telemetry | Device to phone | Notifications; latest sample wins; no retransmission backlog |
| Diagnostics/warnings | Device to phone | Snapshot and change events; acknowledgment/retry where loss matters |
| Navigation state | Phone to device | Bounded latest-state update with route revision and expiry |
| Route geometry/road names | Phone to device | Slow reliable revisioned transfer; atomic commit after complete validation |
| Trip/log transfer | Device to phone | Offset/hash, resume and explicit completion |
| Settings/media commands | Phone to device, acknowledgment back | Transaction ID; validated values; idempotent retries |
| Firmware update | Negotiation both; image by selected transport | Signed image, version policy, bounded transfer, rollback and recovery |

## Envelope, session and fragmentation requirements

The versioned binary envelope must define byte order, magic or framing discriminator, version, message ID, flags, payload length, sequence, device/session identifier, timestamp and integrity field. Define every integer width, scale/unit, enum, maximum length and reserved-bit policy in machine-readable definitions. Fast telemetry should use fixed-width integers and a validity/source bitmap or tagged validity fields. JSON is suitable for offline schema files and a development bridge, not the fast BLE wire format.

CRC is for accidental corruption across application reassembly/storage/bridges and is not authentication. If used, specify the exact polynomial, initial value, reflection and final XOR with known vectors. BLE encryption/authentication must protect authorized operations independently of CRC.

Negotiation chooses a compatible major/minor version, supported families, maximum logical size, permitted rates, effective characteristic payload capacity and integrity method. Reject incompatible major versions explicitly. Ignore only documented unknown optional fields; reject unknown control operations. Negotiation itself must work at the minimum supported MTU.

The [Bluetooth ATT specification](https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-54/out/en/host/attribute-protocol--att-.html) defines attribute operation limits. Design for a 23-byte ATT MTU, where common notification/write values have 20 bytes available, as well as larger negotiated values. Never assume a requested MTU was accepted or that Android and iOS expose identical controls.

For messages larger than the effective value capacity, specify a fragment wrapper containing transfer identity, fragment offset/index and total length/count. Reassembly is keyed by peer, session and transfer; validate total size before allocation, reject inconsistent overlaps and invalid offsets, accept duplicate fragments idempotently, expire incomplete transfers and bound concurrent transfers. Proposed initial limits to measure: 4 KiB logical control/geometry message, two concurrent reassemblies, two-second inactivity expiry. Larger route/log/image transfers use bounded chunk streams, never an unbounded buffer.

A fresh session is established at each authenticated connection/device restart. Sequences wrap according to documented modular ordering; old-session frames never update current state. Device timestamps are monotonic boot-relative values with an explicit mapping to UTC when known; sample age grows after receipt even if updates stop. Do not subtract an unrelated phone clock from device uptime.

Reliable transactions use request IDs, timeout, bounded retries and cached acknowledgment results. Fast telemetry instead drops superseded queued samples. Fragment loss in a telemetry message discards that sample and exposes sequence loss counters; it must not block warnings or newer data. After reconnect, request capabilities, current warning/DTC state and a fresh telemetry snapshot rather than replaying an old outbound command queue.

## Bandwidth and scheduling budget

Proposed planning example, not measured throughput: an 18-byte common overhead plus a 48-byte fast payload at 10 Hz is 660 bytes/s before ATT/link overhead. An 80-byte navigation state at 2 Hz adds 160 bytes/s; 1 KiB geometry every five seconds adds approximately 205 bytes/s. Fragment headers, retransmission, notifications, connection intervals and coexistence increase actual traffic. Measure at both minimum and negotiated MTUs and while Wi-Fi/display/SD are active. Reduce subscribed channels/rates before allowing unbounded latency.

Prioritize connection/errors and warnings, then control acknowledgment, then fast telemetry/navigation, then geometry/logs/update chunks. Reserve bounded queue capacity for local warnings. Requesting 10 Hz phone updates does not authorize 10 Hz polling of every ECU PID; device adaptive polling has its own bus-load budget and supported-PID constraints.

## Security and safety boundaries

Require authenticated encrypted pairing/bonding for private data and device-changing commands, with physical device confirmation for initial enrollment and a documented local bond-reset procedure. Do not advertise VIN or recent position in discovery metadata. The transport session ID prevents stale-session mixups; it is not a secret or an authorization token. Define denial-of-service limits for connect/retry/reassembly and validate before expensive allocation.

The phone cannot submit raw ECU bytes, remapping, actuator, immobilizer, airbag or ABS commands. Revision A normal operation is read-only. OBD Service 04 is omitted until a separate deliberate stationary service-mode design is implemented. Setting a phone-side “stationary” boolean cannot unlock a restricted operation. Power/OTA state checks are enforced on the device, signatures are verified before activation, and a failed new image must recover through the selected ESP-IDF partition/boot policy.

## Validation

Share golden byte vectors among C/C++, Dart, TypeScript and Python. Test truncated/oversized packets, unknown versions/flags, invalid enum values, CRC errors, minimum-MTU fragmentation, reordering/duplicates/missing fragments, sequence rollover, restart and old-session rejection, stale samples, rejected/duplicate commands, permissions and bonding failures, and interrupted update/log transfers. Finally run on-device BLE range/loss and concurrent-load measurements before promoting the BLE link to bench verified.
