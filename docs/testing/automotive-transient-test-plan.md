# Automotive transient validation plan

Status: NOT RUN. No ISO7637 or ISO16750 compliance is claimed. Exact editions, pulse classes, severity, source impedance, coupling method and acceptance class must be agreed with a qualified test facility for the installation and harness. This document does not reproduce licensed standards or invent test pulse values.

## Prerequisites

Freeze schematic/BOM/PCB/harness revisions, rated input window, TVS placement, reverse protection, FET SOA, fuse/wire coordination, UV/OV/current thresholds and operating temperature. Record protection calculations and actual full-load input current. Review oscilloscope probe voltage/grounding limits, current-limited supply, fuse and safe fixture shutdown.

## Bench progression

1. Verify polarity/net continuity unpowered. Ramp with conservative current limit; measure raw/protected/display/5V/3V3 rails at9,10,12,13.8,14.4,16V.
2. Exercise power-off/on, brownout/recovery, cold-crank waveform agreed for target vehicle, ACC flush/cut and repeated cycles. Preserve SD record integrity and measure inrush and shutdown current.
3. Apply controlled reverse battery only in a reviewed current-limited fixture. Verify rated FET/TVS/controller stress and no downstream reverse voltage.
4. Test agreed supply interruption, negative/positive conducted pulses and suppressed/unsuppressed load-dump conditions only with rated equipment and the approved test matrix. Distinguish the LM74900 controller's rating from each FET/capacitor/display rating.
5. Repeat representative cases at minimum/maximum qualified temperature and worst load. Inspect damage, reset behavior, fault logging and recovery.

## Required record per pulse

Standard edition/clause, waveform, polarity, amplitude, duration, repetitions, interval, source impedance, operating mode, DUT serial/revision, harness, ambient, instrument calibration, raw and protected voltage/current captures, junction-temperature estimate and observed function/recovery classification. Include before/after leakage and insulation measurements where relevant.

## Release gate

Independent review must confirm tested severities match the claimed application, every supplied component is within its verified derated limits, results are repeatable and no failure is unexplained. A simulated TVS-energy estimate, a normal-voltage sweep or a datasheet badge alone cannot establish standards compliance.
