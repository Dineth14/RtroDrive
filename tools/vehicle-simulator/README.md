# Vehicle simulation

The deterministic JS scene generator emits the canonical telemetry contract through the local bridge. The existing browser mock retains its richer interactive scenarios. `obd_simulator.py` separately models read-only CAN OBD ECU responses; it is a protocol fixture, not evidence of vehicle compatibility. Optional Linux vcan support is added only with explicit interface selection; never attach a fault simulator to a vehicle bus.
