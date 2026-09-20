import 'package:flutter_test/flutter_test.dart';
import 'package:retrodrive_mobile/models/telemetry.dart';
import 'package:retrodrive_mobile/diagnostics/explanation_provider.dart';

void main() {
  test('valid zero is distinct from unavailable and expires', () {
    final sample = TelemetrySample.fromJson({'value': 0, 'valid': true, 'source': 'obd', 'ageMs': 0, 'unit': 'rpm'});
    expect(sample.value, 0); expect(sample.fresh(0), true); expect(sample.fresh(3001), false);
    final missing = TelemetrySample.fromJson({'value': null, 'valid': false, 'source': 'obd', 'ageMs': 0, 'unit': 'rpm'});
    expect(missing.fresh(0), false);
    expect(() => TelemetrySample.fromJson({'value': 0, 'valid': false, 'source': 'obd', 'ageMs': 0, 'unit': 'rpm'}), throwsFormatException);
  });
  test('optional mock explanations disclose provenance', () async {
    final result = await MockAIProvider().explain(TelemetrySnapshot('generic_can', {}));
    expect(result.provider, 'MockAIProvider'); expect(result.text, contains('Simulated'));
  });
}
