# Engineering decision log

Each decision carries evidence and a validation gate. `CALCULATED`, `SIMULATED`, `MEASURED` and `NEEDS VERIFICATION` are separate categories.

| ID | Requirement | Alternatives | Selected direction / reason | Evidence | Validation |
|---|---|---|---|---|---|
| ADR-001 | Preserve design prototype | Rewrite / incremental extraction | Keep React layouts and stores; add transport boundary | Existing working Vite build and rich profile/layout library | Existing rendering regression tests and browser QA |
| ADR-002 | Shared validity semantics | Sentinel zero / nullable typed samples | Versioned schema with validity, age, provenance and units | Existing availability-only channels cannot distinguish stale device samples | Cross-language fixtures; reconnect invalidation tests |
| ADR-003 | No invented GPIO | Guess unused pins / audit revision | Pin exact board and use only schematic-supported routes | Manufacturer schematic audit; UART/I2S contention | Continuity and logic-level bench checks |
| ADR-004 | Read-only diagnostics | Full diagnostic service passthrough / allowlisted reads | Services 01, 03, 09 only initially; no 04 | Brief §10/45; minimizes unsupported write surface | Negative service tests; bus capture |
| ADR-005 | Multi-protocol expansion | Electronic switch matrix / configurable links | Protected OEM pins with DNP links for Rev A | Brief §4/14 | Harness continuity and accidental-drive tests |
| ADR-006 | No fabricated Mini support | Borrow MEMS1.6 PIDs / source-qualified scaffold | MEMS2J init/transport isolated; no undocumented exposed parameters | Protocol source register | Echo/timeout fixtures, real ECU trace correlation |
| ADR-007 | Cold crank and surge | Unqualified TVS-only supply / protected supply | LM74900-Q1 candidate plus rated external components; final topology pending analysis | TI datasheet and calculation worksheet | Controlled bench/transient/thermal testing |
| ADR-008 | Battery drain | Always-on OBD / ACC cut / manual demo | ACC sense plus shutdown control; OBD-only manual bench option | OBD pin16 may remain live | Actual off-current and repeated power-cycle measurements |
| ADR-009 | Hardware manufacturing evidence | Placeholder CAD / validated design release | Architecture first; no fabrication files until review/ERC/DRC | No KiCad/hardware measurement toolchain present in initial environment | Release checklist and tagged hardware approval |
| ADR-010 | Mobile and BLE | Web mockup / Flutter | Flutter target with compact binary telemetry; browser phone retained as UX reference | Brief §28/29 | Android/iOS build, actual pairing and packet-loss tests |

Decisions involving actual module revision, companion I/O, TVS/FET selection, current budget and enclosure dimensions remain provisional until their evidence gates close.
