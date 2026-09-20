# Hardware release checklist

- [ ] Reviewed editable KiCad schematic with required00–11 hierarchy and source notes.
- [ ] Exact symbols/footprints/MPNs, harness pin-view and power calculations reviewed.
- [ ] Supplier4-layer stackup, outline/hole dimensions and enclosure fit verified.
- [ ] ERC/DRC executed with tool version; no unexplained errors or blanket waivers.
- [ ] Current/thermal/transient/ACC/CAN/K-Line bench evidence approved.
- [ ] BOM, DNP settings, placement rotations and assembly polarity cross-checked.
- [ ] Tagged `hardware-vX.Y.Z` source revision; release manifest includes hashes/tool versions.
- [ ] Generated Gerbers, drills, IPC netlist if applicable, BOM, pick-and-place, assembly drawings, schematicPDF, PCBPDF, STEP, fab notes and revision history.
- [ ] Independent visual inspection of actual generated outputs and fabricator preview.
- [ ] No file labeled production-ready unless the full gate passed.

No automated workflow may generate a seemingly successful empty manufacturing package from missing designs. CI must fail closed on absent sources or unresolved release approval.
