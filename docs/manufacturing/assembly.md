# Rev-A assembly and bring-up plan

Status: NOT RELEASED. No PCB, Gerbers, placement files, enclosure dimensions or assembly instructions for a finished unit are implied.

1. Freeze reviewed schematic/BOM/PCB revisions and fit drawings. Match incoming display SKU/revision to the pin audit.
2. Verify every orderable MPN, footprint/pin1, polarity, voltage rating and DNP option. Vehicle build omits daughterboard termination and disables onboard termination.
3. Inspect soldering, shorts and rail resistance unpowered. Leave OEM/J1850/L transmit links open. Confirm separate ground entry/net-tie strategy.
4. Bring up protection and regulated rails from a current-limited bench supply with display disconnected. Record UV/OV/fault/ACC behavior and temperatures.
5. Attach display over USB-only test configuration as documented; inspect backfeed before combining supplies. Verify I2C voltage and pin orientation.
6. Execute CAN, K-Line, sensors/audio/SD and shutdown test gates. Only then use approved harness and ordered vehicle test phases.
7. Fit the measured enclosure prototype, provide cable strain relief, check speaker/antenna/USB clearance and mounting rigidity.
8. Record serial, hardware revision, component deviations, firmware hash, fixture/instrument IDs and test results. Quarantine failures; never mark untested units passed.
