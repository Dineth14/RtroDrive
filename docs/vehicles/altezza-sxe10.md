# Toyota Altezza variant scaffold

`verification_status: unverified`

The profile model must distinguish SXE10 / RS200 / 3S-GE from GXE10 / AS200 / 1G-FE, then model year, market, transmission and ECU identity. These names originate in the product brief; no diagnostic compatibility is inferred from them. Separate profile IDs prevent one variant's validated data from silently applying to another.

No diagnostic pin, initialization bytes, proprietary PID, conversion, supported parameter or automatic profile match is approved by this scaffold. Do not assume CAN OBD, K-Line OBD or identical diagnostics across variants. The target vehicle's factory electrical/service information and ECU response captures are required first. Where an independently verified standard OBD link exists, Generic OBD may be offered without claiming an Altezza-specific driver.

The existing period instrument/media visual direction can be reused with simulated examples labelled as simulation. Real data capability remains empty until verified. Do not drive a manufacturer-defined pin to test a guess.
