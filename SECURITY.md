# Security and vehicle data

Do not commit Wi-Fi credentials, signing material, API keys, private VIN/location logs or bond secrets. Use synthetic fixtures in public tests. Share suspected security issues privately with the repository owner; do not attach keys or identifiable vehicle trails to public issues.

The current bridge is a loopback-only development simulator with no vehicle command forwarding. It is not a secure remote device server. Production BLE needs authenticated enrollment, bounded packets and device-enforced permissions. Firmware OTA requires signed images, recovery and tested version policy before exposure. The current firmware scaffold implements no OTA endpoint or irreversible provisioning.

ECU writing, programming and actuator operations are absent. Treat imported logs and telemetry as untrusted; validate length, schema, units, range, freshness and session before use.
