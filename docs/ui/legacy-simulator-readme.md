# RetroDrive HMI Simulator

**HMI V4:** See the [vehicle-adaptive implementation guide](../HMI-V4.md)
for the current visual profile architecture, analogue instruments, vehicle
artwork/boot sequence, navigation, five media skins, phone redesign and tests.
That guide supersedes the earlier V3 layout/boost/media descriptions below.
Run `npm test` for the V4 regression suite. Visual browser QA remains pending.

A desktop simulator for **RetroDrive**, a compact 1980s/1990s-inspired smart
auxiliary instrument cluster for enthusiast and heritage vehicles. It
reproduces the final 1024×600 in-car display pixel-for-pixel, alongside a
simulated smartphone companion app and a developer console for injecting
vehicle telemetry, faults, and diagnostic scenarios.

This is a **browser-first prototype**. It targets an ESP32-S3 + 5" IPS
display in production, but nothing here talks to real hardware — the whole
vehicle is simulated in-app so the full experience can be designed, tested,
and demoed before hardware exists.

## Project purpose

- Validate the RetroDrive HMI (cluster + mobile app) end-to-end before
  committing to embedded hardware.
- Provide a realistic, physically-relatable vehicle telemetry simulation
  (not random noise) to exercise gauges, warnings, and diagnostics.
- Keep the visual language portable to LVGL/embedded graphics later — see
  [LVGL porting notes](#future-lvgl-porting-notes).

## Install & run

Requires Node.js 18+.

```bash
npm install
npm run dev       # start the dev server (Vite) — http://localhost:5173
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build locally
```

No backend, no environment variables, no external API keys are required.

## Architecture

```
src/
  app/            App.tsx — page layout, bezel, phone/dev-panel toggles,
                  keyboard shortcuts, engine bootstrap
  cluster/        The 1024x600 in-car display. ClusterShell.tsx is the
                  screen router; each *Screen.tsx is one full-screen view.
    layouts/      The 5 selectable dashboard layouts (JDM Digital 86, Euro
                  Digital 89, JDM GT 93, Touring 96, Classic Electronic) +
                  the registry that maps a ClusterLayoutId to a component,
                  plus shared chrome (odo/trip/clock row, GPS mini indicator,
                  media ticker) used across all of them
    widgets/      Small reusable display primitives (seven-segment digits,
                  bar/vertical/arc gauges, boost gauge, RPM bar, warning
                  lamp strip, spectrum visualizer)
  mobile/         The simulated phone companion app (PhoneShell.tsx routes
                  between tabs/screens; mobile.css / MobileControls.tsx hold
                  shared styling and form controls)
  simulator/      Everything that is NOT UI: the telemetry physics model
                  (incl. turbo/boost + GPS breadcrumb), the rule-based
                  fault/health engine, the DTC rule engine + simulated AI
                  layer, the scripted fault scenarios, and the developer
                  control panel that drives all of it
  state/          Zustand stores: vehicleStore (telemetry/warnings/DTCs/
                  trips/GPS/nav), settingsStore (persisted user
                  preferences), mediaStore (playback + spectrum state)
  audio/          Web Audio API chime/alarm synthesis (no recorded samples)
  theme/          Design tokens + the four cluster color themes
  types/          Shared TypeScript types for telemetry, diagnostics,
                  media, vehicle profiles, and scenarios
  utils/          auxSlots.ts — the source-aware auxiliary gauge resolver
```

State flows one way: `telemetryEngine` ticks at ~12.5 Hz and writes into
`vehicleStore`; once a second it hands off to `faultEngine`, which derives
warnings, vehicle-health status, and runs the DTC rule engine. UI components
only ever *read* from the stores and call store actions — they never touch
the simulation loop directly (except the developer panel, which calls
`telemetryEngine.setOverride()` to pin values for testing).

## The simulation engine

`simulator/telemetryEngine.ts` models a driving vehicle, not independent
random numbers:

- Speed and RPM are coupled (RPM follows a simple speed→RPM curve, plus an
  idle floor and a cranking ramp).
- Throttle and engine load are derived from the rate of change of speed and
  from RPM.
- Coolant temperature has thermal inertia — it warms toward an equilibrium
  temperature that rises with engine load, rather than jumping to a value.
- Battery voltage reflects ignition/cranking/running state (idle ~12.4–12.8V,
  cranking dips to ~10V, running settles to ~13.6–14.4V).
- Fuel trims hover near 0% with small noise, until a fault scenario (lean
  mixture, vacuum leak) drives them up.
- GPS speed tracks OBD speed plus small noise, only while a GPS fix is
  simulated; while it is, a breadcrumb point is recorded into
  `vehicleStore.gpsBreadcrumb` every ~2s for the GPS screens' route trail.
- **Boost** (`boostKpa`/`boostBar`/`boostPsi`) is derived from one MAP model,
  not faked separately: `boostKpa = mapAbsoluteKpa − barometricPressureKpa`,
  so the same number is naturally negative (vacuum) at idle/light throttle
  and positive (boost) under load on a turbocharged profile. A `boostSpool`
  state variable (0–1) approaches a throttle/RPM-derived target with a
  rate that scales with RPM — that's the turbo lag: slow spool-up low in
  the rev range, fast up top, and a quick drop back to vacuum on lift-off.
  Naturally-aspirated vehicles never spool (`vehicle.isTurbocharged` gates
  it), so their boost channel reports unavailable and gauges fall back
  automatically (see "source-aware gauges" below).

Any channel can be pinned to a manual value from the developer panel
(`setOverride('speedKph', 120)`); scenarios in `simulator/scenarios.ts` are
just timed keyframe sequences that call the same override mechanism, so
manual control and scripted faults share one code path.

Every second, `faultEngine.ts`:
1. Compares live telemetry against the configurable warning thresholds
   (`settingsStore.warnings`) and reconciles the active warning list.
2. Runs `evaluateDiagnosticRules()` (see below) and stores any newly
   triggered DTCs.
3. Recomputes the six Vehicle Health categories from DTCs + trends.

## How to add a telemetry PID

1. Add the field to `TelemetrySnapshot` in `types/telemetry.ts` (it must be
   a `TelemetryChannel<T>` — `{ value, available, source }`).
2. Add its initial value to `INITIAL_TELEMETRY` in `state/vehicleStore.ts`.
3. Compute it each tick in `simulator/telemetryEngine.ts`'s `tick()`
   function and assign it into `next`.
4. If it should be manually overridable from the developer panel, add it to
   the `OverridableChannel` union in `telemetryEngine.ts` and add a slider
   in `simulator/DeveloperPanel.tsx`.
5. Surface it wherever it's useful: a gauge on `cluster/DashboardScreen.tsx`,
   a card in `mobile/LiveDataScreen.tsx`, etc.

## How to add a DTC rule

DTCs live in `simulator/diagnosticEngine.ts`.

1. Add the code's static metadata (description, possible systems,
   recommended checks) to `DTC_LIBRARY`.
2. Add detection logic to `evaluateDiagnosticRules()` — keep it a pure
   function over `(telemetry, engineRunning)` plus small hysteresis counters
   in `ruleState`, mirroring how a real embedded rule engine would work.
   Call `createDtc(code, telemetry, evidence, severity, confidence)` when
   the rule fires and push the result into the return array.
3. Add a generator function to `ANALYSIS_GENERATORS` so the simulated AI
   assistant (`diagnosticAssistant.analyze()`) has code-specific guidance;
   otherwise it falls back to a generic template.
4. If the fault should be reachable from the developer panel directly (not
   just discovered live), add a scenario in `simulator/scenarios.ts` that
   drives the relevant telemetry channels (or calls `createDtc` directly
   from a keyframe's `onReach` for a "stored code" style scenario).

DTC phrasing is intentionally hedged ("pattern consistent with...",
"possible causes include...") — never a definitive mechanical diagnosis.
Keep new rules and AI copy consistent with that tone.

## How to create a new theme

1. Add the theme's name to the `ThemeName` union in `types/vehicle.ts`.
2. Add its 11-color palette to `CLUSTER_THEMES` in `theme/themes.ts`
   (`background`, `panel`, `panelAlt`, `primary`, `primaryBright`,
   `primaryDim`, `amber`, `warningAmber`, `criticalRed`, `mutedText`,
   `gridLine`).
3. Add it to the theme picker list in `mobile/DisplaySettingsScreen.tsx`.

Themes apply purely via CSS custom properties (`--cl-*`) set on the cluster
root element in `ClusterShell.tsx` — no component needs to know which theme
is active.

## How to add a cluster layout

The main dashboard is not one screen — `cluster/DashboardScreen.tsx` is a
two-line router that looks up `settingsStore.display.clusterLayout` in
`cluster/layouts/registry.ts` and renders whichever layout component is
selected. To add a sixth layout:

1. Create `cluster/layouts/YourLayout.tsx`. Pull data with the
   `useDashboardData()` hook (telemetry, vehicle profile, thresholds,
   connections, media) and compose it from the shared widgets
   (`RpmBar`, `ArcTachometer`, `BoostGauge`, `RetroGauge`,
   `VerticalBarGauge`, `DigitalSpeed`, `WarningLampStrip`) plus the shared
   chrome in `cluster/layouts/DashboardChrome.tsx`
   (`OdoTripClockRow`, `GpsMiniIndicator`, `MediaTicker`).
2. Add its id to `ClusterLayoutId` in `types/vehicle.ts`.
3. Register it in `CLUSTER_LAYOUTS` and `CLUSTER_LAYOUT_LABELS` in
   `cluster/layouts/registry.ts`.
4. It's automatically selectable from `mobile/DisplaySettingsScreen.tsx`
   (which reads the same registry) and from `DEFAULT_LAYOUT_FOR_VEHICLE`
   in `types/vehicle.ts` if you want a specific vehicle preset to default
   to it.

## Source-aware auxiliary gauges

`utils/auxSlots.ts` — `resolveAuxSlot(preferredKey, telemetry, vehicle)` —
is the one place that decides what an "aux" gauge slot actually shows. A
layout never renders "OIL -- bar" as a dead placeholder: if the preferred
channel is unavailable (or is `BOOST` on a naturally-aspirated vehicle),
it substitutes the next most useful available channel (oil temp → engine
load → battery, in that priority order). `settingsStore.display.auxSlots`
holds the driver's 4 preferred channels for layouts that expose a
configurable aux row.

## GPS, breadcrumb trail, and navigation

`cluster/GpsScreen.tsx` is a vector CRT-nav-style display, not a map: it
projects `vehicleStore.gpsBreadcrumb` (lat/lon samples) into local meters
relative to the vehicle's current position, rotates the whole scene so the
vehicle triangle always points "up" (heading-up, like an early automotive
nav unit), and auto-scales to fit the trail. It has two modes:

- **STANDALONE** — the breadcrumb scope only, plus heading/speed/satellite/
  accuracy readouts. This is all a bare GNSS receiver can actually provide.
- **PHONE_ASSISTED** — overlays a big turn-by-turn banner
  (`vehicleStore.navInstruction`, a `{ kind, distanceM, ... }` record) on
  top of the scope, simulating a phone providing routing since the GNSS
  module alone has no road data. Drive it manually from the developer
  panel's "Navigation Simulation" buttons, or run the `NAVIGATION_TURN`
  scenario for a scripted straight → turn → roundabout → destination
  sequence.

When ignition goes from any non-OFF state to OFF, `vehicleStore.setIgnition`
snapshots the current GPS position into `parkedLocation` (persisted to
localStorage) — the mobile Home screen surfaces it as "PARKED Xh Ym ago"
with a link into the phone's GPS/Map tab.

## How to replace the simulated AI with a real API

The entire simulated-AI surface is the single function
`diagnosticAssistant.analyze(dtc: DtcRecord): AiAnalysisResult` in
`simulator/diagnosticEngine.ts`. To wire up a real model:

1. Make `analyze` async and call your API (send the DTC, its evidence,
   freeze frame, and recent telemetry trend as the prompt/context).
2. Update the one call site,
   `mobile/DiagnosticDetailScreen.tsx`'s `runAnalysis()`, to `await` it
   (it already treats the call as if it might take time — there's a loading
   state).
3. Keep the `AiAnalysisResult` shape (`summary`, `evidence`,
   `possibleCauses`, `recommendedOrder`, `severity`, `whatNotToDo`,
   `disclaimer`) so no UI changes are required, or extend it deliberately.

## Screen structure

**Cluster** (`src/cluster/`): Boot, Main Dashboard (5 selectable layouts —
see below), Performance (boost/RPM/throttle/load with peak-hold + a
simulation-only 0–100 km/h timer), GPS/Navigation (standalone breadcrumb
scope or phone-assisted turn banner), Vehicle Health, Diagnostics, Trip,
Media (4 selectable head-unit styles), Warning Overlay (blocking + banner
forms), Status Bar (persistent, minimal), Display/System Test.

**Mobile** (`src/mobile/`): Home (incl. "parked Xh Ym ago"), Live Data,
GPS/Map, Diagnostics (list), Diagnostic Detail (evidence + freeze frame +
checklist + AI guidance), Trips (list), Trip Detail (offline route
placeholder), and a Settings hub fanning out to Vehicle (incl. turbo/boost
config) / Display (layout, primary color, theme, night mode) / Sound /
Warnings / Connectivity / Media / About.

## Keyboard shortcuts (development)

| Key | Action |
|---|---|
| `Space` | Start/stop the engine (turns ignition on + boots if needed) |
| `B` | Replay the startup/boot sequence |
| `W` | Inject a test WARNING |
| `C` | Inject a test CRITICAL alert |
| `D` | Inject a sample DTC (P0171) |
| `M` | Jump cluster to Media screen |
| `H` | Jump cluster to Vehicle Health screen |
| `G` | Jump cluster to GPS screen |
| `1`…`7` | Dashboard / Performance / GPS / Health / Diagnostics / Media / Trip |
| `↑` / `↓` | Increase / decrease speed override (±5 km/h) |
| `Shift + ↑` / `Shift + ↓` | Increase / decrease RPM override (±250) |

Shortcuts are ignored while focus is inside a text input (e.g. the vehicle
nickname field on the phone).

## Scenario system

`simulator/scenarios.ts` defines each of the 14 required scenarios as a
list of timed keyframes (`{ atMs, values, onReach }`). Running a scenario:

1. Clears any existing manual overrides.
2. Forces ignition ON / engine RUNNING.
3. Runs an interpolation loop (via `requestAnimationFrame`) that blends
   `values` between keyframes and calls `setOverride()` each frame.
4. Fires each keyframe's `onReach` callback once, when crossed — used for
   one-shot effects like registering a stored DTC or pushing a critical
   warning.
5. On completion, either releases its overrides back to the ambient
   auto-drive simulation (`releaseOverridesAtEnd: true` — cruise/traffic/
   accel scenarios) or leaves the fault pinned until the user intervenes
   (failure scenarios — alternator, overheat, lean mixture, disconnects).

Live-telemetry-driven DTCs (lean mixture, low voltage, sensor dropout) are
*not* hardcoded into the scenarios — they emerge from `faultEngine`
watching the same telemetry the scenario is manipulating, exactly as they
would from a real fault. The same applies to boost: `TURBO_PULL` never
touches the boost channel directly, it just drives speed/RPM hard — boost
rise is 100% the engine's own turbo-lag model responding to the resulting
throttle demand. `OVERBOOST` is the one scenario that *does* drive
`boostBar` directly, simulating a wastegate-type fault rather than normal
driving. `MUSIC_WARNING` doesn't touch audio ducking code either — it just
starts playback and ramps coolant into CRITICAL, and the existing
`faultEngine` → `duckMedia()` path (already wired for every critical alert)
handles the ducking and restore.

## Future ESP32/LVGL porting notes

The cluster UI deliberately avoids anything that doesn't map to embedded
graphics primitives:

- **Seven-segment digits** (`widgets/SevenSegment.tsx`) are built from 7
  SVG polygons per digit — trivially reproducible as an LVGL custom widget
  or a pre-rendered segment font.
- **All gauges are bar graphs** (`widgets/RetroGauge.tsx` and its
  `TemperatureGauge`/`FuelGauge`/`VoltageGauge` wrappers), not circular
  dials — matching period-correct digital dashboards *and* mapping directly
  onto `lv_bar`/`lv_led` style widgets.
- **The RPM bar**, **boost gauge**, and **vertical bar gauges** are all rows
  of discrete segments with per-segment solid color, not gradient fills —
  reproducible as a segmented `lv_bar` or a row of `lv_led` indicators. The
  boost gauge's only twist is a center-zero reference (vacuum left,
  boost right of a fixed midpoint), which is just an `lv_bar` with a custom
  draw callback for the zero tick on real hardware.
- **The arc tachometer** (Euro Digital 89 layout) draws straight radial
  `<line>` segments at fixed angles, not a curved gradient arc — this maps
  directly onto `lv_scale`/`lv_meter`'s tick-and-needle primitives, which
  natively support exactly this "ticks around an arc" layout.
- Glow effects use CSS `text-shadow`/`drop-shadow`, which have no LVGL
  equivalent — treat these purely as a "nice to have" on the web prototype;
  on hardware, a duplicated dim-colored label offset by 1-2px behind the lit
  label approximates the same effect cheaply.
- No SVG animation, no 3D transforms, no filters beyond simple drop-shadow.
- `theme/tokens.ts` documents the cluster's fixed 1024×600 coordinate
  system and every spacing/radius/font-size/glow token as plain numbers —
  port this file first when starting an LVGL build; it's the single source
  of truth for the whole visual system.
- `theme/themes.ts` holds each theme's 11 flat colors — on embedded, these
  become `lv_color_t` constants swapped via a theme-select rather than CSS
  custom properties.

## Notes on scope

This prototype favors a convincing, coherent simulation over exhaustive
coverage of every field in the spec (e.g. Live Data shows a curated set of
PIDs rather than all of them, per the "don't show everything by default"
guidance). Extending coverage should follow the same patterns documented
above rather than introducing new ad hoc mechanisms.

A few deliberate simplifications from the turbo/GPS/media revision, so
they read as intentional rather than missed:

- `GPS_SIGNAL_LOSS` (new naming) and the original `GPS_LOSS` scenario do
  the same thing — dropping the GPS connection. Both ids exist because the
  spec named them separately across two revisions; there was no reason to
  build two different failure behaviours for the same fault.
- The cassette's `METAL`/`NR`/`AMS`/`RPT` toggles, the CD's `RPT`/`EQ`/`RDM`
  toggles, and the MiniDisc DSP mode cycle are period-correct decoration —
  clickable, stateful, but they don't change playback behavior. Nothing in
  the brief asked them to do more than look right.
- "Primary color" in Display Settings (Phosphor Green / Amber / Ice Green)
  reuses the existing `JDM_PHOSPHOR` / `JDM_AMBER` / `EURO_GREEN` themes
  rather than being a second, independent color system — the brief
  explicitly asks for a closed palette, not arbitrary RGB, and the themes
  already are that palette.
- The developer panel's GPS section can drive heading directly and toggle
  FIX/SEARCHING/LOST; satellite count and accuracy stay auto-simulated
  (small randomized values while fixed) rather than being exposed as
  separate sliders, since they're not load-bearing for anything else in
  the app.
- The 0–100 km/h timer on the Performance screen is explicitly labeled a
  simulation timer — it measures real wall-clock time against the
  simulated speed signal, which is only as realistic as the underlying
  accel model, not a physically-accurate 0–100 figure for any real car.
