# Waveshare pin audit

Audit date: 2026-09-20. Status: **schematic audited; physical unit NEEDS VERIFICATION**. No hardware was connected or measured.

## Exact target and evidence

The brief's 1024 x 600 touch target corresponds to **ESP32-S3-Touch-LCD-5B, SKU 28151**. The similarly named Touch-LCD-5, SKU 28117, is 800 x 480. The manufacturer uses one [family documentation page](https://docs.waveshare.com/ESP32-S3-Touch-LCD-5) and [resource page](https://docs.waveshare.com/ESP32-S3-Touch-LCD-5/Resources-And-Documents) for both. The [linked schematic](https://files.waveshare.com/wiki/ESP32-S3-Touch-LCD-5/ESP32-S3-Touch-LCD-5-Sch.pdf) is titled **ESP32-S3-Touch-LCD-5 V1.2**: PDF page 1 is the circuit, pages 2-3 contain PCB artwork. Page 1 was rendered and visually inspected, including the pin matrix, terminal, expander, CAN and power circuits. Download SHA-256: `d5b0dd67ddf93fc2ac045043db9f65cbba12652f8ee20bd1fd719fe300ae8cb6`.

This is the exact family schematic supplied by the manufacturer for the target, not evidence that an unspecified physical board matches V1.2. Before flashing a hardware-driving build, record label, SKU, PCB revision, LCD identifier and connector orientation, then compare to this audit. Do not substitute a 5-inch board from another family.

## Allocation result

The complete machine-readable table is [hardware/pinmap.csv](../../hardware/pinmap.csv). It records existing function, external availability, direction, electrical domain, straps, sharing, proposed purpose and selection reason.

| Resource | Source allocation | RetroDrive decision |
|---|---|---|
| RGB565 | 0,1,2,10,14,17,18,21,38,39,40,41,42,45,47,48 | Retain panel data |
| LCD control | 3 VSYNC; 5 DE; 7 PCLK; 46 HSYNC | Retain panel timing |
| Touch IRQ / RTC IRQ | 4 / 6 | Retain |
| I2C | 8 SDA; 9 SCL | Shared external control link |
| microSD | 11 MOSI; 12 SCK; 13 MISO; EXIO4 CS | Retain logging |
| CAN | 15 TX; 16 RX | Onboard transceiver only |
| USB | 19 D-; 20 D+ | Retain service port |
| RS485 | 43 RX; 44 TX | Reserved; terminals are differential, not UART |
| CH422G | EXIO0/5 inputs; EXIO1 touch reset; EXIO2 backlight; EXIO3 LCD reset; OD0/1 outputs | Keep vendor ownership |

GPIO35-37 are unavailable with N16R8 octal PSRAM; 26-34 are memory/internal resources, not expansion. GPIO22-25 do not exist on this SoC. Strapping pins are 0,3,45,46: do not add external loading that changes sampled levels. See [Espressif module datasheet](https://documentation.espressif.com/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf), sections 3-4. Native GPIO is 3.3 V logic, never vehicle voltage.

The terminal's I2C uses an onboard level shifter and selectable `I2C_VCC`; set and verify **3.3 V** before connecting the daughterboard. It shares touch, RTC and CH422G. Enumerate all bus addresses and transaction behavior before assigning a bridge address; CH422G is not a single-address ordinary register device. Confirm effective parallel pull-ups and rise times with the actual harness.

## Pin bottleneck and proposed resolution

There is no verified unused native UART pair plus three I2S outputs accessible on the stock terminal while preserving screen, SD, USB and CAN. CH422G cannot generate timed UART or I2S. GPIO-matrix flexibility does not create physical spare pins. Do not connect L9637 to RS485 A/B or repurpose panel/PSRAM lines.

Proposed Rev-A: a local daughterboard companion controller reached over the external I2C link. It owns timed K-Line UART and initialization, I2S warning generation, ACC notification and shutdown control. GNSS may use its UART if shared-bus validation rejects direct I2C. MCU selection, package pin allocation and mailbox address are **TBD**; this is an architectural decision, not a finished circuit. The ESP32 still owns warning decisions and requests locally generated tones without needing a phone. A timed UART bridge plus independent tone device is an alternative, but must demonstrate 5-baud/fast-init behavior and standalone warning playback.

## Bench gates

1. Confirm the physical 5B/V1.2 identity and manufacturer 1024 x 600 timing; use USB power only.
2. Prove display, touch, SD and USB work together before adding an I2C device.
3. Check both boards unpowered for backfeed paths. Separate power domains require fail-safe bus isolation.
4. Disable the onboard CAN termination switch; measure the isolated device before bus connection.
5. Verify CAN RX/TX pin mapping with a current-limited bench/USB-CAN fixture.
6. Measure shared-I2C address behavior, capacitance and latency under screen + SD load.

Manufacturer operating range is **0 to 65 C** for the assembled display; an automotive-rated protection IC does not change that board limit. The enclosure/thermal design and target ambient qualification remain release blockers.
