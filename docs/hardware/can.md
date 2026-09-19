# CAN electrical interface

Reuse the Waveshare V1.2 onboard TJA1051T/3/1J; its VIO is 3.3 V and its supply is 5 V. ESP32 GPIO15 is TX and GPIO16 is RX. The transceiver already has onboard CAN ESD protection and switchable termination. [Schematic](https://files.waveshare.com/wiki/ESP32-S3-Touch-LCD-5/ESP32-S3-Touch-LCD-5-Sch.pdf), [NXP datasheet](https://www.nxp.com/docs/en/data-sheet/TJA1051.pdf).

Bring J1962 pins6/14 through daughterboard CAN-rated protection placed at the harness entry to the display's CAN-H/CAN-L terminals. Reserve a common-mode choke/bypass footprint; choose values only after capacitance, common-mode and EMC review. A second transceiver is unnecessary for Rev-A.

Both the daughterboard optional 120-ohm branch and the display's onboard termination must be **disabled for vehicle use**. Check the unpowered standalone device and inspect actual switch position before connecting. For an isolated bench bus, arrange exactly two end terminations across the entire test harness; do not blindly populate all available resistors.

Use a paired route with a continuous reference and short stubs. Controlled-impedance dimensions await the chosen fabricator stackup. First testing uses USB/display power and USB-CAN only. Begin listen-only, confirm bitrate/identifier format, then permit bounded read-only diagnostic requests. Physical CAN capability alone does not verify OBD or a vehicle profile.
