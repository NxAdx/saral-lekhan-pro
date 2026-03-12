# AGENT-CAPABILITIES-REGISTRY

This registry tracks practical capabilities and hard constraints for AI agents working on **Saral Lekhan Plus**.

## 1) Automation and Platform Tooling
- **GitHub Actions**: primary CI/CD for production Android builds (AAB/APK).
- **ADB**: device diagnostics and log capture.
  - Path: `C:\Program Files (x86)\Minimal ADB and Fastboot\adb.exe`
- **Sentry**: runtime crash and error telemetry.
- **Firebase/Google Services**: OAuth + Drive integration validated in CI via secret and fingerprint checks.

## 2) Build Baseline (Current)
- Java: **17** in CI (local Java 20 can break legacy Gradle script parsing).
- Gradle: **8.0.1**
- Android Gradle Plugin: **7.4.2**
- compileSdk/targetSdk: **34**
- React Native: **0.72.10**
- Expo SDK: **49**

## 3) UX Runtime Kill Switch Capability
- Runtime UX flags are supported through:
  - `src/store/runtimeUxFlagsStore.ts`
  - `runtime-flags.json`
  - `expo.extra.runtimeFlagsUrl` in `app.json`
- Current remotely switchable keys:
  - `spark_loading_modal_v1`
  - `spark_loading_animation_v1`
- Operational behavior:
  1. defaults load immediately (safe baseline).
  2. cached flags are applied if present.
  3. remote flags are fetched and applied when available.
  4. app returns to legacy Spark inline loading UX by setting `spark_loading_modal_v1=false`.

## 4) Critical Native Constraints
- **Single branded splash strategy**:
  1. native launch splash must be the only branded splash.
  2. JS pre-ready state must stay plain (non-branded gap fill only).
- **Android splash implementation baseline**:
  1. `Theme.App.SplashScreen` must inherit `Theme.SplashScreen`.
  2. `postSplashScreenTheme` must point to `@style/AppTheme`.
  3. `MainActivity` must call `SplashScreenManager.registerOnActivity(this)` and must not force `setTheme(...)` on launch.
  4. `android/app/build.gradle` must keep `implementation("androidx.core:core-splashscreen:1.0.1")` (or compatible) to provide splash attrs during resource linking.
- **FlashList compatibility**:
  - keep `@shopify/flash-list` at `1.8.3` or newer verified-compatible 1.x.
  - `1.4.3` causes CI Kotlin failure in `:shopify_flash-list:compileReleaseKotlin`.

## 5) Product Consistency Constraints
- Startup/system background and icon branding should remain aligned to `#d9d7d2`.
- Always synchronize release version values across:
  - `app.json`
  - `package.json`
  - `android/app/build.gradle` (`versionName`, `versionCode`)

## 6) Documentation Discipline
- `docs/` is intentionally version-controlled for handover continuity.
- For release-facing changes, update at minimum:
  1. `docs/ERRORS-LOGS.md`
  2. `docs/TECHNICAL_ENV_GUIDE.md`
  3. latest cycle handover doc (`docs/PRODUCTION_HANDOVER_YYYY-MM-DD.md`)
  4. latest cycle manifest (`docs/CHANGE_MANIFEST_YYYY-MM-DD.md`)
  5. rollback runbook when UX/runtime-control behavior changes (`docs/UX-ANIMATION-ROLLBACK-RUNBOOK.md`)
