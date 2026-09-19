# RetroDrive HMI V4

The existing React/TypeScript application, Zustand stores, diagnostic rules,
scenario runner, keyboard shortcuts and phone routes are retained. The cluster
still renders at **1024 × 600** and the phone bezel remains **390 × 844**.

## Vehicle identities

`src/vehicleProfiles/profiles.ts` contains nine `VehicleVisualProfile` definitions.
Selecting a vehicle applies its cluster, palette and media defaults together;
later display/media overrides persist independently. Existing vehicle presets
remain available. The developer console and phone Vehicle settings both select
profiles. No manufacturer logos or OEM dashboard artwork are used.

| Personality | Default instruments | Audio | Artwork |
|---|---|---|---|
| JZX100 | JDM GT 93 | Graphic EQ 91 | Long sports saloon |
| AE86 | JDM Digital 86 | Cassette 86 | Angular coupe |
| Evo | JDM GT 93 | Graphic EQ 91 | Winged performance saloon |
| Subaru STI | JDM GT 93 | Graphic EQ 91 | Rally saloon with scoop |
| Classic Mini | Mini Heritage | Heritage Radio | Upright compact hatch |
| Land Cruiser | Vintage Tourer | Heritage Radio | Tall expedition 4×4 |
| Generic 1960s | Classic Roadster 60 | Heritage Radio | Open roadster |
| Generic 1980s | Euro Digital 89 | Cassette 86 | Angular coupe |
| Generic 1990s | JDM GT 93 | Graphic EQ 91 | Touring saloon |

Grand Touring 62 and CRT Electronic are additional selectable compositions.
The older Touring 96 and Classic Electronic layouts remain selectable.

## Instruments and startup

The GT flagship has a 60-segment diagonal tachometer, central segmented speed,
vacuum/boost strip, four-second peak hold with reset, six auxiliary readings,
gear, position, warning lamps and trip/clock information.

Classic gauges share SVG bezels, tick rings, damping, needles and mechanical
odometer windows. Roadster, Grand Touring, Mini and Vintage Tourer use different
arrangements. Day/night illumination changes the gauge faces and markings.
Fonts use local system fallbacks; no remote font service is required.

Boot takes 3.9 seconds: black, identification and original SVG body trace,
status progress, lamp test, instrument sweep and activation. Disabling startup
animation skips the sequence. Replay cancels the previous schedule; switching
ignition off prevents pending timers from restarting instruments.

## Navigation, audio and phone

Digital navigation retains heading-up breadcrumb projection and a large maneuver
arrow. Classic navigation uses a compass rose, trip recorder, bearing, altitude,
accuracy and parked coordinates. Phone navigation includes left/right, slight
left, U-turn, roundabout and destination. Developer controls expose position,
heading, satellite count and accuracy. The phone map includes the parked marker
even when no breadcrumb has been recorded.

The four electronic audio skins remain functional, with a fifth Heritage Radio
skin using a dial, twin VU instruments and circular transport controls. The
correlated spectrum runs at 25 Hz separately from 12.5 Hz telemetry. Critical
warnings attenuate the simulated spectrum and expose ATT status; playback is
still simulated, with no streamed music. Media style and visualizer choices
persist. Complex cluster style changes and display tests are locked at speed.

Phone Home uses the same vehicle artwork as startup, with connected/disconnected
state, period-specific typography and live readings. Classic Live uses circular
instruments; turbo Live emphasizes boost. Seven tabs include a dedicated Media
player. Existing diagnostic evidence, freeze frames, AI guidance and settings
remain available.

## Simulation corrections

- `simulator/boost.ts` uses throttle, RPM, load and a first-order lag. Idle is
  approximately −0.68 bar; cruise remains in vacuum; spool increases with RPM;
  throttle lift quickly returns to vacuum.
- MAP absolute, barometric pressure, bar and PSI are consistent conversions.
- Stationary IDLE runs the engine without starting the driving model.
- GPS fallback supplies the displayed speed, respects the selected source mode
  and marks lost position data unavailable.
- Configured overboost thresholds trigger warning/critical lamps and media ducking.
- `PARK_VEHICLE` decelerates, records the trip and stores the ignition-off location.

## Verification

Run `npm test` for behavioral checks covering profiles, vacuum/spool/lift, MAP
conversion, speed fallback, GPS loss, warnings/ducking, missing-data substitution,
parking/persistence, boot ordering/cancellation and static rendering of every
layout, profile artwork, phone home, GPS family and audio skin.

`npm run build` performs the TypeScript and production bundle checks.
`npm run dev -- --host 127.0.0.1` serves the local preview.

**Visual QA status:** browser automation was unavailable in the implementation
session. The render smoke tests verify component execution and content, not
browser geometry, screenshot appearance, animation quality, audio timing or
60 FPS. Review these in the local preview before treating the visual acceptance
criteria as signed off. Hardware/LVGL performance has not been measured.

## LVGL transfer

Car profiles use original paths, wheels and lamp strokes. Gauges use circles,
lines, labels and a rotated needle; digital graphs use discrete rectangles.
Needle damping uses elapsed-time exponential interpolation. Palette and profile
configuration are separate from telemetry. Browser-only gradients, scanlines and
minor shadows are decorative and can be replaced with flat fills on hardware.
