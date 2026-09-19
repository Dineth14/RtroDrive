# 1998 Rover Mini MPi

`profile_id: mini_mems2j` · `verification_status: unverified`

The user's target is a 1998 Rover Mini MPi with MEMS 2J. Confirm ECU label/part number, market, hardware/software ID and vehicle diagnostic connector before constructing its harness. The [MEMS2J research plan](../protocols/mems2j.md) documents the original implementation source and its limitations. Do not substitute MEMS1.6/ROSCO support.

Required first outcomes are a recorded read-only connection, identification, supported live values and fault reading. RPM, coolant, intake temperature and throttle are priorities; MAP, speed and lambda remain conditional on evidence. The current verified parameter list is empty. A UI may preview the Mini theme with explicitly simulated data, but it must not advertise a working Mini link.

The validation report must include ECU ID, profile version, harness revision, signal levels, echo behavior, traces, parameter comparisons, reconnect behavior and power arrangement. Raw recordings must remove personal identifiers such as VIN before public release. Bench/vehicle status changes require links to these reports.

