# Vehicle support matrix

RetroDrive is a **multi-protocol expandable vehicle interface**. This matrix records intended scope, not universal compatibility. Audit date: 2026-09-20. All rows are `unverified`; no physical bench or vehicle test evidence exists in this audit.

| Profile | Exact target / variant boundary | Intended interface | Current software scope | Release blocker |
| --- | --- | --- | --- | --- |
| `generic_can` | Vehicles independently confirmed to implement ISO 15765-4 OBD | Standard J1962 CAN 6/14, audited onboard transceiver | Read-only PID discovery, conversion, DTC/VIN design; host tests next | CAN bench and target-vehicle evidence |
| `mini_mems2j` | 1998 Rover Mini MPi, exact MEMS2J ID still to record | K-Line via L9637 and verified harness | Source-qualified fast-init research plan; no verified parameters | Hardware, captured read-only transactions, conversions and Mini test |
| `altezza_sxe10` | SXE10 / RS200 / 3S-GE; year and MT/AT explicit | NEEDS VERIFICATION | Data/profile scaffold only | Factory wiring and protocol sources for target variant |
| `altezza_gxe10` | GXE10 / AS200 / 1G-FE; year and MT/AT explicit | NEEDS VERIFICATION | Separate variant boundary; not interchangeable with SXE10 | Same; no inherited SXE10 pins/commands |
| `subaru_gc8` | GC8 year/market/ECU unspecified | Future SSM through qualified PHY | Scaffold only | Exact connector, levels and protocol |
| `mitsubishi_mut` | Model/year/ECU unspecified | Future MUT through qualified PHY | Scaffold only | Exact connector, levels and protocol |
| `defender_td5` | Defender Td5 year/ECU unspecified | NEEDS VERIFICATION | Scaffold only | Variant-specific wiring and read-only protocol |
| future Pajero / Land Cruiser | Model/year/engine unspecified | NEEDS VERIFICATION | Roadmap only | Target selection and sources |
| J1850 | No target vehicle selected | Pins 2/10 protected expansion, PHY DNP | No software support | Populated/qualified PHY and implementation |

`unverified` includes host-tested code and simulated data. `bench_verified` requires a reproducible physical report scoped to hardware/profile versions. `vehicle_verified` requires an actual named vehicle report. A single vehicle does not validate an entire model range. Use separate `implementation_status` and test reports to describe software maturity; do not misuse vehicle verification status as a development progress label.

