# RetroDrive HMI Simulator

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
    widgets/      Small reusable display primitives (seven-segment digits,
                  bar gauges, RPM bar, warning lamps, spectrum visualizer)
  mobile/         The simulated phone companion app (PhoneShell.tsx routes
                  between tabs/screens; mobile.css / MobileControls.tsx hold
                  shared styling and form controls)
  simulator/      Everything that is NOT UI: the telemetry physics model,
                  the rule-based fault/health engine, the DTC rule engine +
                  simulated AI layer, the scripted fault scenarios, and the
                  developer control panel that drives all of it
  state/          Zustand stores: vehicleStore (telemetry/warnings/DTCs/
                  trips), settingsStore (persisted user preferences),
                  mediaStore (playback state)
  audio/          Web Audio API chime/alarm synthesis (no recorded samples)
  theme/          Design tokens + the four cluster color themes
  types/          Shared TypeScript types for telemetry, diagnostics,
                  media, vehicle profiles, and scenarios
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
  simulated.

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

**Cluster** (`src/cluster/`): Boot, Main Dashboard, Vehicle Health,
Diagnostics, Trip, Media, Warning Overlay (blocking + banner forms),
Status Bar (persistent, minimal), Display/System Test.

**Mobile** (`src/mobile/`): Home, Live Data, Diagnostics (list),
Diagnostic Detail (evidence + freeze frame + checklist + AI guidance),
Trips (list), Trip Detail (offline route placeholder), and a Settings hub
fanning out to Vehicle / Display / Sound / Warnings / Connectivity / Media /
About.

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
| `1` / `2` / `3` / `4` | Dashboard / Diagnostics / Trip / Media |
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
would from a real fault.

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
- **The RPM bar** is a row of discrete segments with per-segment solid
  color, not a gradient fill — reproducible as a segmented `lv_bar` or a
  row of `lv_led` indicators.
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
