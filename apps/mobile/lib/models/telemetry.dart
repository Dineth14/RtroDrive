class TelemetrySample {
  final num? value;
  final bool valid;
  final String source;
  final int ageMs;
  final String unit;
  const TelemetrySample(this.value, this.valid, this.source, this.ageMs, this.unit);
  factory TelemetrySample.fromJson(Map<String, dynamic> json) {
    final value = json['value'];
    final valid = json['valid'];
    final source = json['source'];
    final age = json['ageMs'];
    final unit = json['unit'];
    if (valid is! bool || age is! int || age < 0 || unit is! String ||
        !['obd', 'gnss', 'imu', 'external', 'derived', 'simulated'].contains(source) ||
        (valid ? value is! num || !value.isFinite : value != null)) {
      throw const FormatException('Invalid telemetry sample');
    }
    return TelemetrySample(value as num?, valid, source as String, age, unit);
  }
  bool fresh(int elapsedMs) => valid && elapsedMs >= 0 && ageMs + elapsedMs <= 3000;
}

class TelemetrySnapshot {
  final String profile;
  final Map<String, TelemetrySample> channels;
  TelemetrySnapshot(this.profile, this.channels);
  factory TelemetrySnapshot.fromJson(Map<String, dynamic> json) {
    if (json['schemaVersion'] != 1 || json['type'] != 'telemetry' ||
        json['vehicleProfile'] is! String || json['channels'] is! Map<String, dynamic>) {
      throw const FormatException('Unsupported telemetry snapshot');
    }
    final channels = (json['channels'] as Map<String, dynamic>).map((name, value) =>
        MapEntry(name, TelemetrySample.fromJson(value as Map<String, dynamic>)));
    return TelemetrySnapshot(json['vehicleProfile'] as String, Map.unmodifiable(channels));
  }
}
