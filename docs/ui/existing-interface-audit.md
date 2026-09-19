# Existing interface audit

Audit date: 2026-09-20. Source inspection covers the original `src/` application. After relocation these paths are under `apps/simulator-web/src/`. The [repository architecture audit](../architecture/current-repository-audit.md) records execution evidence and functional limitations. Browser visual QA remains unexecuted because no in-app browser was available; this inventory is source-verified.

## Display, style and reusable assets

The cluster canvas is 1024 x 600 (`theme/tokens.ts`). `App.tsx` scales it within a physical-style bezel and shows independently hideable phone/developer panels. `ClusterShell.tsx` adds persistent status, warning overlays, scanlines and vignette. Palette roles are background, panel, alternate panel, primary, bright/dim primary, amber, warning amber, critical red, muted text and grid line. The five palettes are Heritage Ivory, JDM Phosphor, JDM Amber, Euro Green and Mono LCD (`theme/themes.ts`).

Tokens define spacing 4/8/12/20/32/48 px; radii 0/2/4/8 px; border widths 1/2/3 px; font sizes 12/14/18/24/32/96 px; mono/segment font fallbacks; and overlay priorities. CSS also contains local colors, dimensions and shadows, so the TypeScript token file is not yet the sole style authority. Original code-drawn vehicle silhouettes live in `vehicleProfiles/CarSilhouette.tsx`; preserve these and their source provenance rather than substitute manufacturer artwork.

Reusable widgets include seven-segment digits, digital speed, segmented RPM, boost, vertical/bar/arc gauges, fuel/temperature/voltage wrappers, warning lamps, spectrum/peak displays, compass and inclinometer. `gauges/classic/ClassicGauges.tsx` supplies analogue instruments and mechanical-style odometer. Shared dashboard chrome and `useDashboardData` reduce duplication.

## Cluster screen and control map

| Screen | Source and content | Controls / behavior |
|---|---|---|
| Ignition off / boot | `ClusterShell`, `BootSequence`, `simulator/bootController` | Space or developer ignition; B replay; profile artwork, segment/lamp/gauge tests and simulated link startup |
| Dashboard | `DashboardScreen`, `layouts/registry` | Layout/profile selected in phone settings or developer panel; warning acknowledgment overlay |
| Performance | `PerformanceScreen` | Boost or fallback metric, RPM, load, throttle, temperatures, peak/acceleration state |
| GPS / Navigation | `GpsScreen`, `navigation/ClassicNavigation` | Standalone or phone guidance buttons; heading-up breadcrumb scope or classic compass; simulated turn state |
| Vehicle health | `VehicleHealthScreen` | Six category statuses and evidence |
| Diagnostics | `DiagnosticsScreen` | DTC presentation, counts and severity |
| Trip | `TripScreen` | Derived statistics; reset-trip button |
| Media | `MediaScreen`, `media/*` | Previous/play/pause/next, seven styles, five visualizer modes, period annunciators; style switch blocked above 5 km/h |
| Terrain | `TerrainScreen` | Attitude, compass, altitude, expedition and drivetrain indicators |
| Display test | `TestModeScreen` | Gauge sweep increments, startup/warning/critical/speed/connection tones; dashboard substituted above 5 km/h |
| Warning overlay | `WarningOverlay` | Acknowledge highest-priority alert; other warnings remain in state |

Keyboard controls in `app/App.tsx`: Space starts/stops; B boot; W warning; C critical; D synthetic P0171; M media; H health; G GPS; 1-8 dashboard/performance/GPS/health/diagnostics/media/trip/terrain; T terrain; up/down changes speed ±5 km/h; Shift+up/down changes RPM ±250. Text inputs/selects ignore these shortcuts. Keyboard navigation is development tooling and cannot serve as the final touchscreen mode selector.

## All 14 dashboard layouts

| Registry ID | Implementation | Visual family |
|---|---|---|
| `CLASSIC_ROADSTER_60` | `layouts/ClassicLayouts.tsx` | Classic analogue |
| `GRAND_TOURING_62` | `layouts/ClassicLayouts.tsx` | Classic analogue |
| `MINI_HERITAGE` | `layouts/ClassicLayouts.tsx` | Classic analogue |
| `VINTAGE_TOURER` | `layouts/ClassicLayouts.tsx` | Classic analogue |
| `EXPEDITION_60` | `layouts/ClassicLayouts.tsx` | Classic expedition |
| `CRT_ELECTRONIC` | `layouts/CrtElectronic.tsx` | Electronic |
| `JDM_DIGITAL_86` | `layouts/JdmDigital86.tsx` | Electronic |
| `EURO_DIGITAL_89` | `layouts/EuroDigital89.tsx` | Electronic |
| `JDM_GT_93` | `layouts/JdmGt93.tsx` | Performance |
| `TOURING_96` | `layouts/Touring96.tsx` | Touring |
| `CLASSIC_ELECTRONIC` | `layouts/ClassicElectronic.tsx` | Electronic |
| `UTILITY_80` | `layouts/Utility80.tsx` | Expedition |
| `RALLY_RAID_90` | `layouts/RallyRaid90.tsx` | Expedition |
| `TOURING_95` | `layouts/Touring95.tsx` | Expedition |

The 13 visual profiles select cluster/media/navigation/boot/artwork/palette defaults, plus era, gauge and density choices (`vehicleProfiles/profiles.ts`). They are not vehicle protocol profiles. Media styles are Cassette 86, EQ Deck 89, DSP Receiver 92, CD Tuner 95, MD Dot Matrix 98, Heritage Radio and Expedition Receiver (`types/media.ts`).

## All 17 phone routes

| Route | Main controls and current effect |
|---|---|
| Home | Vehicle summary, DTC detail, parked-location GPS link, expedition entry |
| Live data | Telemetry readings/trends from same browser store |
| GPS / Map | Synthetic GNSS and route presentation |
| Diagnostics list | Open active/stored DTC detail |
| Diagnostic detail | Evidence, simulated freeze frame, local checklist toggles, timed mock AI explanation |
| Trips list | Open persisted or generated trip summary |
| Trip detail | Statistics and route placeholder |
| Media | Previous/play/pause/next plus media settings |
| Expedition | Mark waypoint; start/end trail; unimplemented return/trip; incomplete zero action labeled compass |
| Settings home | Links to settings routes |
| Vehicle | Nickname, preset, turbo flag, boost units and thresholds; informational vehicle fields |
| Display | 14 layouts; palettes/primary colors; manual/automatic brightness and simulated ambient light; night mode; speed source; ticker/startup toggles |
| Sound | Enable/volume/startup/connection/media ducking/speed-chime controls |
| Warnings | Coolant, voltage and low-fuel threshold sliders |
| Connectivity | Reconnect OBD/GPS/phone mutates mock flags; hardware status listing |
| Media settings | Mock Bluetooth-audio flag, style and visualizer selection |
| About | Prototype information |

`PhoneShell.tsx` owns navigation state, selection/back targets and seven bottom tabs. Vehicle/warning settings show a distraction message above 5 km/h but are not fully locked. Onboarding, structured garage selection, genuine device pairing and firmware update are absent.

## Developer control map

`simulator/DeveloperPanel.tsx` owns profile/era/layout selectors; ambient/night illumination; ignition OFF/ACC/ON/START; engine OFF/IDLE/RUNNING; startup/test/terrain navigation; turbo flag; MAP/barometric and telemetry overrides; override release; GNSS state/location/heading/satellites/accuracy; standalone/phone navigation and maneuvers; expedition start/end/waypoints; pitch/roll/altitude overrides; simulated 2H/4H/4L/differential locks/winch; media transport; phone/OBD link flags; subsystem state toggles; and scenario launch buttons.

Those drivetrain and winch controls change display simulation only. They must never acquire physical vehicle-control semantics when hardware is integrated. Development controls must be source-scoped and absent from production driving UI.

## Acceptance captures to make when browser access is available

Capture all 14 layouts at a fixed frame size and deterministic telemetry; the seven media styles; each phone route; day/night and bright/dim illumination; boot/cancel boot; warning/critical acknowledgment; no OBD/no GNSS/no phone; unavailable preferred gauge with supported fallback; NA vehicle without boost; stationary-only display test; and an invalid/stale-data overlay. Record viewport, profile, scenario, seed, time and source alongside images. Cross-check against LVGL screenshots on the physical display rather than accepting desktop rendering as embedded evidence.
