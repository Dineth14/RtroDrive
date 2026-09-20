# Contributing

Use feature branches and small logical commits. Preserve the existing UI design direction. Run `npm test`, `npm run lint`, `npm run build`, `npm run test:schemas`, `npm run test:firmware`, and Python tests for affected software. Record missing tools or unexecuted physical tests honestly. No generated dependencies/build outputs, private keys or credentials belong in Git.

Every new proprietary parameter needs source, raw request/reply description, equation, units, observed range and last verified vehicle. Keep status unverified until actual bench/vehicle evidence exists. Normal vehicle operations remain read-only. Review GPIO against the exact schematic; do not infer pinout from a product-family name.

See `REQUIREMENTS.md`, engineering decision log and first-ten-issues. A software pass cannot close a hardware validation item. Hardware tags are gated and do not bypass ERC/DRC/output inspection. The repository owner has not selected a distribution license; do not infer a new license grant from these contributions.
