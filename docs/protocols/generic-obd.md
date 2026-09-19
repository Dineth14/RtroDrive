# Generic CAN OBD-II

Status: implementation target; `verification_status: unverified`. Host tests are software evidence and do not promote a profile to `bench_verified`.

## Sources and scope

Normative release review must use the licensed applicable editions of ISO 15765-4, ISO 15765-2 and SAE J1979/J1979-DA. This repository audit does not claim standards conformance. Accessible primary implementation references are the [ELM Electronics ELM327 datasheet](https://www.elmelectronics.com/wp-content/uploads/2016/07/ELM327DS.pdf), the [Linux ISO-TP implementation documentation](https://docs.kernel.org/networking/iso15765-2.html), and the [python-OBD author's command table](https://python-obd.readthedocs.io/en/latest/Command%20Tables/) and [decoder source](https://github.com/brendan-w/python-OBD/blob/master/obd/decoders.py). These are references, not vendored dependencies; no GPL implementation is copied into the firmware.

CAN candidates are 11-bit/500 kbit/s, 29-bit/500 kbit/s, 11-bit/250 kbit/s and 29-bit/250 kbit/s. The onboard Waveshare transceiver is reused after its pin audit. Vehicle installation has no added 120-ohm termination; bench termination is optional and disabled by default.

## Safe discovery

Start the CAN controller in listen-only mode. Match observed traffic to a bitrate before actively sending. A quiet bus does not establish its bitrate; active probing is bounded and must be qualified on a bench before enabling vehicle use. Never scan arbitrary arbitration IDs or OEM pin routes. Reconfigure only with the controller stopped; one candidate at a time. Bus-off or error growth suspends active requests.

The 11-bit functional diagnostic request ID is `0x7DF`; responders occupy `0x7E8..0x7EF`, with physical request IDs eight less. For standard 29-bit OBD normal-fixed addressing, use functional `0x18DB33F1`, response `0x18DAF1xx` and corresponding physical request `0x18DAxxF1`. Do not confuse 29-bit CAN identifiers with ISO-TP extended addressing, which adds an address byte in the payload. ELM's datasheet gives CAN addressing examples; final wire conformance remains an HIL test.

Discover Service 01 PID `00`. Require a complete, correctly addressed `41 00 A B C D` response before linking. Interpret the four bitmap bytes as big-endian: bit 31 describes PID base+1; bit 0 describes base+32. Request the next support block only when bit 0 is set. Bound progression through `E0`; do not wrap to `00`. Preserve responder-specific maps and clear them when changing vehicle/session.

## ISO-TP and response integrity

Classical CAN uses eight data bytes. Single Frame length is at most seven diagnostic bytes. Multi-frame responses have First Frame length, Flow Control and sequenced Consecutive Frames. Isolate reassembly by responder and addressing mode. Validate total length, sequence including wrap, timeout and receive capacity. Never splice responders together. Send Flow Control to that ECU's physical request ID, respect block size, and reject reserved separation-time encodings. Single-frame functional requests may produce several independent replies. [Linux ISO-TP](https://docs.kernel.org/networking/iso15765-2.html).

Only complete PDUs reach service decoders. Reject wrong service/PID, unexpected lengths and stale session data. Padding is a transport concern and cannot become a sensor value. Report negative responses and timeouts explicitly. A malformed packet must not replace the previous valid sample with zero.

## Initial data set

All PIDs are conditional on support discovery. `A` and `B` are unsigned response data bytes after the service and PID.

| Service/PID | Signal | Conversion | Unit | Proposed configurable tier |
| --- | --- | --- | --- | --- |
| 01/04 | Calculated engine load | `100*A/255` | % | Medium |
| 01/05 | Coolant | `A-40` | °C | Slow |
| 01/0B | MAP | `A` | kPa absolute | Medium |
| 01/0C | RPM | `(256*A+B)/4` | rpm | Fast |
| 01/0D | Vehicle speed | `A` | km/h | Fast |
| 01/0F | Intake air temperature | `A-40` | °C | Slow |
| 01/10 | MAF | `(256*A+B)/100` | g/s | Medium |
| 01/11 | Throttle position | `100*A/255` | % | Fast |
| 01/2F | Fuel level | `100*A/255` | % | Slow |
| 01/42 | Control-module voltage | `(256*A+B)/1000` | V | Slow |

The command mapping and conversions are cross-checked against the upstream python-OBD command/decoder tables. Module-reported voltage is not a calibrated measurement at RetroDrive's battery connector. Never label it as such.

Start bench policy at a **total** 10 requests/s, at most one in flight to an ECU, with fast/medium/slow desired periods of 200/500/2000 ms. These are RetroDrive test defaults, not protocol mandates or measured safe limits. Rate-limit all requests, including discovery/retries, and use a conservative bus-time budget that counts response frames and flow control. Timeouts reduce polling rate; an absent ECU cannot trigger a retry storm. Measure bus load and tune for each validated installation.

Service 03 is read-only stored-DTC retrieval. Decode two-byte codes with P/C/B/U family bits; retain responder identity and unknown manufacturer descriptions. For CAN, validate the Service 03 DTC-count field against the payload before extracting pairs. An empty set is a successful response, distinct from no response. Service 09 PID 02 VIN is optional; validate a complete transport message, item count and 17-character VIN before using it in the fingerprint. A failed or unsupported VIN does not block Generic OBD.

Service 04 is deliberately absent. No write, raw-service forwarding, programming or actuator API is included.

## Required evidence before support claims

Host vectors cover conversion boundaries, bitmap continuation, unsupported PID refusal, malformed lengths, incorrect services/PIDs, ISO-TP sequence/timeout/capacity, multiple responders, VIN failure and DTC count. USB-CAN bench evidence must cover both identifier widths and both bitrates, power cycles, bus loss and reconnect. A vehicle report must record model/year/engine/ECU identity, harness, power arrangement, traces, expected readings, duration and observed bus impact. Simulation success alone is not vehicle compatibility.

