# K-Line electrical interface

Selected PHY: ST L9637D family; current orderable E-L9637D is listed active by [ST](https://www.st.com/en/automotive-analog-and-power/l9637.html). Use the [L9637 datasheet Rev 8](https://www.st.com/resource/en/datasheet/l9637.pdf), especially Tables2/5 and Figure4.

| Pin | Function | Proposed connection |
|---|---|---|
| 1 RX | K receiver logic output | Companion UART RX |
| 2 LO | L comparator logic output | Test pad / optional input |
| 3 VCC | Logic supply | 3.3 V |
| 4 TX | K transmitter logic input | Companion UART TX with recessive reset state |
| 5 GND | Reference | PCB ground |
| 6 K | Battery-domain bidirectional line | Protected OBD7 link |
| 7 VS | Battery-domain supply | Protected suitable supply |
| 8 LI | L comparator input | Defined inactive condition or protected receive-only option |

VCC supports 3-7 V, with full-range behavior guaranteed by design and production electrical testing at 5 V. At 3.3 V supply TX-high must reach at least 2.5 V; check the selected companion's guaranteed VOH at load. RX pulls up internally toward VCC, so using 3.3 V avoids a 5 V RX-to-ESP32 interface. Verify cold/hot margins and power sequencing. Any 5 V alternative must add explicit translation.

LI/LO do **not** drive L-Line. OBD15 remains protected expansion with active transmit DNP. K pull-up, bus capacitance, added protection and dominant-current dissipation must be coordinated; see the [loading calculation](../../hardware/calculations/rev-a-calculations.md). K and its connector may remain powered when the board is off, requiring off-state tests.

Stock Waveshare exposes no suitable spare UART on its terminal. The proposed companion owns 10400-baud timing, low-speed initialization waveforms, echo classification and timeouts. Do not emulate K UART with an I2C GPIO expander. This hardware design does not validate any Mini ECU initialization or payload; those remain source- and bench-gated.
