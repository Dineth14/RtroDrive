# Shared contracts

`telemetry.mjs` is a pure validator/helper shared by the browser, bridge and tests. `schemas/telemetry-v1.json` is generated from its contract plus the BLE channel manifest; run `node scripts/generate-contracts.mjs` after an intentional versioned change and `npm run test:schemas` to detect drift. WebSocket/replay sends full snapshots, max64KiB per JSON message. Sequence is unsigned32 with modular ordering; a new source connection clears the old session.

Every channel has nullable value, validity, provenance, unit and sample age. Missing means unsupported; invalid means known but unavailable; zero remains valid. `timestampMs` is producer monotonic session time, not a phone wall clock. Receiver freshness is sample age plus elapsed local monotonic time since receipt. Vehicle communication status is distinct from transport connectivity. Schema1's implemented channels are enumerated in the manifest; richer IMU vectors/diagnostic events require separate versioned messages before hardware integration.

`vehicle-profiles` contains diagnostic capability definitions. These are separate from historical visual presets. All supplied definitions are unverified; host tests do not promote that status. No proprietary decoded parameters are exposed without their required source/trace metadata.
