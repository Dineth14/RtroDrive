# Hardware source register

Checked2026-09-20. Link manufacturer documents rather than redistributing material without established permission. Physical measurements: none.

| ID | Source | Evidence / limit |
|---|---|---|
| WS-01 | [Waveshare family](https://docs.waveshare.com/ESP32-S3-Touch-LCD-5) |5B1024×600 vs5 800×480; board features and operating range |
| WS-02 | [Family schematic](https://files.waveshare.com/wiki/ESP32-S3-Touch-LCD-5/ESP32-S3-Touch-LCD-5-Sch.pdf) |TitleV1.2; SHA256 in pin audit; physical unit not checked |
| TI-01 | [LM74900-Q1 product](https://www.ti.com/product/LM74900-Q1) / [RevC datasheet](https://www.ti.com/lit/ds/symlink/lm74900-q1.pdf) |Controller topology and ratings; does not establish assembled product compliance |
| ST-01 | [L9637 Rev8](https://www.st.com/resource/en/datasheet/l9637.pdf) |K/L receive functions and logic supply; no L transmit driver |
| IMU-01 | [ICM-42688-P](https://www.invensense.tdk.com/en-us/products/6-axis/icm-42688-p) |Manufacturer marks Production; not a distributor stock quote or automotive qualification |
| AUD-01 | [MAX98357A](https://www.analog.com/en/products/max98357a.html) |Manufacturer marks Production; exact package and speaker integration pending |
| GNSS-01 | [LC76G module](https://www.waveshare.com/wiki/LC76G_GNSS_Module) |Requested candidate; current access failed; exact module drawing/firmware pending |
| BUY-01 | [User purchase reference](https://www.aliexpress.com/item/1005007643787643.html) |Could not open; selected SKU/revision/price not verified |

Recheck lifecycle, errata and procurement information at design freeze and every manufacturing release. Do not interpret URL tracking prices as quotations.
