# Hardware-in-loop evidence

No HIL run has occurred. Use the requirement-to-test matrix and ordered bench phases. A report must record DUT/display/PCB/harness revisions, vehicle ECU identity where applicable, firmware commit, operator/date, current limit, instrument calibration, conditions/acceptance limits, actual values, captures, failures and reviewer. Keep VIN/location redacted in public reports.

CAN fixtures must exercise11/29-bit ×250/500k, timeout/reconnect/malformed/multiple responders, supported-only polling and absent VIN. K-Line fixtures must qualify electrical levels and waveform timing before the gated startup code is enabled. Power, ACC, logging, GNSS, IMU, audio, BLE, thermal and enclosure tests remain required. Do not change profile verification status based solely on host mocks.
