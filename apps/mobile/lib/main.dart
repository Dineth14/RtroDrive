import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'models/telemetry.dart';

void main() => runApp(const RetroDriveApp());

class RetroDriveApp extends StatelessWidget {
  const RetroDriveApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
      title: 'RetroDrive',
      theme: ThemeData.dark().copyWith(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff9fcc91), brightness: Brightness.dark),
        scaffoldBackgroundColor: const Color(0xff0b120e),
      ),
      home: const CompanionHome());
}

class CompanionHome extends StatefulWidget {
  const CompanionHome({super.key});
  @override
  State<CompanionHome> createState() => _CompanionHomeState();
}

class _CompanionHomeState extends State<CompanionHome> {
  late final Future<(TelemetrySnapshot, List<dynamic>)> data = _load();
  int page = 0;
  Future<(TelemetrySnapshot, List<dynamic>)> _load() async {
    final telemetry = jsonDecode(await rootBundle.loadString('assets/demo-telemetry.json')) as Map<String, dynamic>;
    final profiles = jsonDecode(await rootBundle.loadString('assets/profiles.json')) as List<dynamic>;
    return (TelemetrySnapshot.fromJson(telemetry), profiles);
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('RETRODRIVE')),
    body: FutureBuilder<(TelemetrySnapshot, List<dynamic>)>(future: data, builder: (context, result) {
      if (result.hasError) return const Center(child: Text('Unable to load development fixtures'));
      if (!result.hasData) return const Center(child: CircularProgressIndicator());
      final (snapshot, profiles) = result.data!;
      if (page == 1) return ListView(children: [
        const ListTile(title: Text('VEHICLE GARAGE'), subtitle: Text('Profile catalog · hardware compatibility unverified')),
        for (final profile in profiles) ListTile(title: Text('${profile['manufacturer']} ${profile['model']}'), subtitle: Text('${profile['engine'] ?? 'Engine to confirm'} · ${profile['verification_status']}')),
      ]);
      return ListView(padding: const EdgeInsets.all(16), children: [
        const Text('SIMULATED SNAPSHOT', style: TextStyle(letterSpacing: 2, color: Color(0xffffce80))),
        const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Text('Development preview. No BLE device is connected.')),
        for (final entry in snapshot.channels.entries.where((entry) => entry.value.fresh(0)))
          Card(child: ListTile(title: Text(entry.key), subtitle: Text(entry.value.source), trailing: Text('${entry.value.value!.toStringAsFixed(1)} ${entry.value.unit}'))),
      ]);
    }),
    bottomNavigationBar: NavigationBar(selectedIndex: page, onDestinationSelected: (value) => setState(() => page = value), destinations: const [
      NavigationDestination(icon: Icon(Icons.speed), label: 'Preview'),
      NavigationDestination(icon: Icon(Icons.directions_car), label: 'Garage'),
    ]),
  );
}
