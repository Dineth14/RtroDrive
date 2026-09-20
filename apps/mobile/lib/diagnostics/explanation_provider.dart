import '../models/telemetry.dart';

class DiagnosticExplanation {
  final String provider;
  final String text;
  const DiagnosticExplanation(this.provider, this.text);
}

abstract interface class DiagnosticExplanationProvider {
  Future<DiagnosticExplanation> explain(TelemetrySnapshot snapshot);
}

class LocalRuleProvider implements DiagnosticExplanationProvider {
  @override
  Future<DiagnosticExplanation> explain(TelemetrySnapshot snapshot) async {
    final coolant = snapshot.channels['coolantC'];
    if (coolant != null && coolant.fresh(0) && coolant.value! > 110) {
      return const DiagnosticExplanation('LocalRuleProvider',
          'The supplied coolant sample exceeds the demonstration threshold. '
          'This is a rule-based observation, not a confirmed mechanical diagnosis.');
    }
    return const DiagnosticExplanation('LocalRuleProvider',
        'No explanation is available from this limited snapshot. Absence of a finding does not establish vehicle health.');
  }
}

class MockAIProvider implements DiagnosticExplanationProvider {
  @override
  Future<DiagnosticExplanation> explain(TelemetrySnapshot snapshot) async =>
      const DiagnosticExplanation('MockAIProvider', 'Simulated explanation only. No AI service or vehicle was contacted.');
}
