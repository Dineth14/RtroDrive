# Flutter companion foundation

Pinned SDK: **3.35.7**, from the [official release](https://github.com/flutter/flutter/releases/tag/3.35.7). This is an editable Flutter foundation: simulated shared-schema snapshot, shared profile catalog, nullable/aged sample model and optional local/mock explanation providers. **No BLE plugin, device link, routing, OTA, native permissions or full screen set is implemented.** The React phone retains the complete UX reference.

Generate the platform scaffolding with the pinned SDK, then prepare the canonical development assets:

```sh
# From repository root
node scripts/prepare-mobile.mjs
cd apps/mobile
flutter create --platforms=android,ios --project-name retrodrive_mobile --org dev.retrodrive .
flutter pub get
flutter test
flutter build apk --debug
```

Platform-generation must preserve checked-in lib/pubspec/tests; review generated diffs. Delete the default counter widget test if generated (`test/widget_test.dart`); the maintained test is `test/telemetry_test.dart`. Commit platform files and resolved lockfile only after a successful SDK run. The initial environment has no Flutter SDK, so local native build/test status is **NOT RUN**. CI defines the same generated-scaffold workflow. iOS packaging/signing requires macOS and a deliberately selected bundle identity/team.

Live transport must validate against the complete canonical JSON/BLE contract, including units/ranges/session bounds. The current Dart sample parser is only the foundation for fixture display, not the final untrusted transport validator. No connection button fabricates success.
