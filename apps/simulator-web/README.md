# Laptop simulator

The existing React application lives here with its original layouts and artwork. Run `npm ci`, `npm run dev`, `npm test`, and `npm run build` from the repository root. The browser phone remains a simulated UX reference, not a Flutter app.

The development toolbar selects mock, recorded replay or the local telemetry bridge. Bridge connection carries the canonical shared schema; a connected socket alone never means an ECU is connected. Mock controls are disabled outside mock mode. Hardware and visual-browser validation are separate from host rendering tests.
