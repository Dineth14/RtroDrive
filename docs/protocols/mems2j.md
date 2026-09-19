# Mini MEMS 2J: source-qualified research boundary

**UNVERIFIED VEHICLE PROFILE.** No ECU, harness or vehicle has been tested by this repository. The intended priority target is the user's 1998 Rover Mini MPi. Its exact ECU part number, software identity and diagnostic harness must be recorded before support is enabled.

## What the accessible evidence establishes

James Portman publishes original implementation research for MEMS 2J: K-Line, 10400 baud 8N1, byte echo, KWP-style communication and a fast-init pulse of 25 ms low followed by 25 ms high. He publishes the special connection request `81 13 F7 81 0C` and expected response `03 C1 D5 8F 28`. This is an independent researcher's implementation reference, **not Rover factory documentation or RetroDrive verification**. [Original MEMS2J communication notes](https://rovermems.com/mems-2j/index.html).

The page also mentions slow initialization but does not provide enough timing/address detail here to safely implement it. Its normal-packet checksum prose is insufficient for assuming every header variant; the startup packet is expressly special. Do not extrapolate an ECU-identification, live-data, DTC or keepalive command from a generic KWP service name. Capture and document actual read-only transactions before adding those commands.

[Portman's documentation repository](https://github.com/james-portman/rover-mems-documentation) provides a second entry point into the same research; it is not independent validation. [librosco](https://github.com/colinbourassa/librosco) explicitly targets ROSCO-speaking units such as MEMS1.6. Its byte commands must not be copied into a MEMS2J profile. Publicly hosted standards PDFs are not treated as proof of redistribution rights; this repository links to references instead of repackaging them.

## Initial implementation contract

The first implementation is a deterministic, host-testable fast-init state machine with **transmission disabled by default**. It accepts an explicit research enable flag only after the harness and line driver are qualified. Time-driven actions describe the low/high interval, UART configuration and the documented startup request; the hardware adapter alone carries them out. No delays or loops block the communication worker.

States: `disabled → idle → fast_init_low → fast_init_high → send_start → wait_response → connected_research_only`, or `failed` on timeout/malformed response/echo mismatch. A configured echo mode may consume only bytes matching the outstanding transmitted sequence; it cannot blindly discard a fixed number of received bytes. Echo-disabled mode accepts the response directly. On failure, stop and require an explicit retry; do not continuously initialize the ECU. Interbyte/response timeouts and pre-init idle time begin as labelled bench assumptions pending traces.

`connected_research_only` means the published startup bytes were recognized. It does **not** mean live diagnostics, identified Mini hardware, supported PIDs or a vehicle-verified connection. No service command follows until independently specified. The required profile files reserve live-data and fault tables with zero entries rather than invented conversions.

## Data promotion checklist

For each nonstandard parameter record source URL/document revision, exact ECU/hardware/software identity, request and raw response bytes, byte order, conversion equation, units, observed range, trace/test fixture, verification status and last verified vehicle. Confirm conversion against a trusted measurement/tool across more than one operating point. Keep RPM, coolant, IAT, throttle, MAP, speed and lambda hidden until their individual definitions are verified. Logging can store research raw traces without pretending they are measured engineering values.

Connection, ECU identification, live data and fault reading remain separate milestones. No programming, calibration-write, immobilizer or actuator command belongs in the normal profile.

## Bench and vehicle procedure

1. Confirm the 1998 vehicle/ECU and diagnostic connector against its exact wiring documentation. The user brief identifies K-Line; connector appearance is not sufficient proof of pin routing.
2. Qualify the L9637 line driver and explicit 3.3-V logic interface using a current-limited bench setup. Confirm UART polarity, receive echo and idle level at the test points.
3. Use a logic analyzer and known compatible read-only diagnostic tool to record a connection and known values. Record supply voltage, timing and byte echo separately from ECU responses.
4. Replay captures into host tests and a separate ECU/line simulator, including no echo, partial echo, wrong response, stalled line and timeout.
5. Enable only the documented startup transaction on the bench. Compare waveforms and response to the capture. Do not infer drive permissions from a passing pure software test.
6. After an actual bench report, promote only tested functionality to `bench_verified`; after the intended vehicle report promote that profile/version to `vehicle_verified`.

