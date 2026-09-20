# Rev-A calculation worksheet

**Preliminary / NOT measured / NOT a released circuit.** No SPICE run or electrical test has occurred. Component selections marked TBD must not be assembled as a production design. [Sources](../datasheets/source-register.md).

| Topic | Calculation / method | Required inputs and unresolved result |
|---|---|---|
| Power | Pin = Pdisplay + P5V/eta5 + P3V3/eta3 + protection losses | Actual display backlight/radio/SD peak draw unknown; budget not frozen |
| Fuse/wire | Iinput,max = Pin,max / Vin,min; coordinate fuse time-current/I²t with inrush, wire ampacity and fault interruption | Cable length/gauge/ambient/inrush required; no fuse value assigned |
| LM74900 UV/OV | Vtrip = Vref × (1 + Rtop/Rbottom), including reference tolerance, hysteresis, divider tolerance and leakage per datasheet exact pin | Candidate operating envelope9–16V; thresholds must preserve7V minimum display operation and margin to36V maximum; resistor values not frozen |
| Current breaker | Isense,trip = Vthreshold / Rsense; Pshunt = Irms² × Rsense; Kelvin routing | Select threshold pin network from RevC; current and short-circuit target unknown |
| MOSFETs | Pcond = Irms² × (Rds1,hot + Rds2,hot); add switching/inrush energy ∫Vds×Id dt | Need MPN, hotRds, SOA, clamp maximum and pulse duration; do not use absolute maximum as continuous design limit |
| Gate network | Ig ≈ Cgate × dVgate/dt; startup load current includes Cout×dVout/dt | Gate charge/Miller plateau and controller source/sink curves require selected FET |
| TVS | E = ∫Vclamp(t) × I(t) dt; check repetitive pulses and temperature derating | Agreed source pulse and impedance plus exact TVS curves missing; no joule or compliance claim |
| Input capacitors | C ≥ I×dt/dV for hold-up; ESR step ΔV = I×ESR | Example ASSUMPTION:1A for10ms with1V sag needs10000uF ideal; this is not a selected capacitor or cold-crank solution |
| EMI filter | f0 = 1/(2π√LC); evaluate damping and negative input impedance of downstream converters | Need measured input spectrum, actual source impedance and regulator model; avoid undamped filter |
| Trace current | Compute from selected copper thickness/width/layer/ambient/temp-rise using appropriate fabrication model | No width or current claim without real stackup and thermal validation |
| CAN routing | Determine pair geometry from supplier dielectric/copper/reference stackup; minimize branches | No fabricated impedance; retain L2 continuous GND |
| K-Line pull-up | Idominant ≈ (Vpullup−VOL)/R; Presistor ≈ (Vpullup−VOL)²/R | Example ASSUMPTION:16V/510ohm gives31.4mA and0.502W atVOL≈0; not a selected pull-up; account for ECU pull-ups and duty cycle |
| ACC divider | Vnode = VACC×Rbottom/(Rtop+Rbottom); Ptop = I²Rtop; account for transient clamps and ADC leakage | Threshold/hysteresis and supervisor part missing; require reset-safe sense and reverse protection |
| Audio | Irms = sqrt(Pout/Rload), Vrms = sqrt(Pout×Rload), Pin = Pout/eta | At an assumed1W/4ohm target:0.5Arms and2Vrms. Efficiency and peak acoustic demand unmeasured; bridge output never grounded |
| Thermal | Tj ≈ Tamb + Ploss×theta_effective, with board/enclosure boundary conditions | Datasheet thetaJA is not enclosure measurement; measure local FET/regulator/display temperatures |
| Shutdown drain | Sum leakage/dividers/controller/regulators/bias/LEDs/backfeed across modes | Measure at harness battery lead; no numerical product standby specification |

Release inputs: measured maximum power and startup current, exact board revision, chosen FET/TVS/regulators, supplier stackup, harness dimensions, target transient class and ambient envelope. Recalculate worst cases including tolerances before schematic capture is frozen; record calculations, simulations and measurements in separate columns.
