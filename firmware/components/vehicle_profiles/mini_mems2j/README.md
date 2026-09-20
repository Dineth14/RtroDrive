# MEMS2J research transport

UNVERIFIED VEHICLE PROFILE. Implements only the published fast-init waveform events and exact startup exchange from [Portman's original notes](https://rovermems.com/mems-2j/index.html). Disabled unless explicitly enabled by a qualified research adapter; the ESP-IDF scaffold does not call it. UART10400/8N1; the adapter must release the line even after `Stop` and must not block timing.

Host tests cover gated startup, pulse ordering, no echo/echo, mismatch and timeout. Timing tolerances/response timeout are stated bench assumptions. A matched response means `ConnectedResearchOnly`, not verified vehicle support. No ECU-ID/live-data/fault/keepalive command is sent; PID and fault tables intentionally contain zero verified entries. Follow [source qualification](../../../../docs/protocols/mems2j.md) before adding read-only services. No writes, programming or actuator functions exist.
