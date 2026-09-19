# Vehicle connector and protected expansion

The classification below is the user-specified Rev-A harness requirement. It is not a verified model-specific connector drawing. Before harness assembly, acquire the chosen connector manufacturer's mating-face numbering and target vehicle wiring documentation.

| J1962 position | Rev-A role | Default state |
|---|---|---|
| 1 | OEM expansion | Protected access; route open |
| 2 | J1850 provision | PHY DNP; route open |
| 3 | OEM expansion | Protected access; route open |
| 4 | Chassis/power return | Ground entry |
| 5 | Signal reference | Deliberate entry net-tie to ground |
| 6 | CAN-H | Protected CAN path |
| 7 | K-Line | Protected L9637 path |
| 8 | OEM expansion | Protected access; route open |
| 9 | OEM expansion | Protected access; route open |
| 10 | J1850 provision | PHY DNP; route open |
| 11 | OEM expansion | Protected access; route open |
| 12 | OEM expansion | Protected access; route open |
| 13 | OEM expansion | Protected access; route open |
| 14 | CAN-L | Protected CAN path |
| 15 | Legacy L/OEM provision | Active driver DNP; route open |
| 16 | Battery | Fuse/protection only |

Each expansion signal receives a raw-labeled test point, appropriately voltage-rated ESD footprint, series protection, protected test point, normally open link and future interface header position. Values remain unpopulated where the intended electrical layer is unknown. A low-voltage ESD clamp chosen without vehicle evidence could itself disturb the bus; the word protected is a circuit requirement, not a claim about a finished PCB.

Do not route any OEM pin straight to an MCU. Use individually documented adapter harnesses and mutually exclusive links instead of an electronic matrix in Rev-A. Assembly records must name populated link options and applicable vehicle wiring source. SSM, MUT and J1850 have no functional PHY claim in this revision. Expansion labels must state voltage domain, pin number and route-open state.
