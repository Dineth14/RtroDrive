# Local telemetry bridge

Run `npm run bridge -- temperature-ramp` then `npm run dev`; select LOCAL BRIDGE. Available scenarios: cruise, temperature-ramp, voltage-drop, rpm-sweep, sensor-loss. All values are marked simulated; this bridge currently has **no physical CAN/serial/BLE input**.

The receiver-only WebSocket stream binds127.0.0.1:8765, accepts only the documented local Vite origins, limits peers/backlog, and exposes `/health`. It does not forward client commands to vehicles. Physical device ingestion is a later authenticated adapter. For remote deployment replace the limited development transport with an audited WebSocket server, authentication, TLS and a defined device enrollment flow.
