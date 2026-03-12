# AGENT-CAPABILITIES-REGISTRY

This registry tracks practical capabilities and hard constraints for AI agents working on **Saral Lekhan Plus**.

## 1) Automation and Platform Tooling
- **GitHub Actions**: Primary CI/CD for production Android builds (AAB/APK).
- **ADB (Android Debug Bridge)**: Device diagnostics and log capture.
  - Path: `C:\Program Files (x86)\Minimal ADB and Fastboot\adb.exe`
- **Sentry**: Runtime error and crash telemetry for production apps.
- **Firebase/Google Services**: OAuth + Drive backup integration validated in CI via secrets checks.

## 2) Build Baseline (Current)
- Java: **17** (CI source of truth)
- Gradle: **8.0.1**
- Android Gradle Plugin: **7.4.2**
- compileSdk/targetSdk: **34**
- React Native: **0.72.10**
- Expo SDK: **49**

## 3) Critical Native Constraints
- **Single branded splash strategy**:
  1. Native splash lifecycle is controlled in `src/app/_layout.tsx`.
  2. Do not add a second branded JS splash screen while app initializes.
- **Android 12+ splash config safety**:
  - In `android/app/src/main/res/values-v31/styles.xml`, do not use `postSplashScreenTheme` for current stack.
- **FlashList CI compatibility**:
  - Keep `@shopify/flash-list` at `1.8.3` or newer verified-compatible 1.x.
  - `1.4.3` causes CI Kotlin failure in `:shopify_flash-list:compileReleaseKotlin` (`dispatchDraw` signature mismatch).

## 4) Product Consistency Constraints
- Startup/system background and icon branding should remain aligned to `#d9d7d2`.
- Always synchronize release version values across:
  - `app.json`
  - `package.json`
  - `android/app/build.gradle` (`versionName`, `versionCode`)

## 5) Documentation Discipline
- `docs/` is intentionally version-controlled for handover continuity.
- For new fixes/hotfixes, update at minimum:
  1. `docs/ERRORS-LOGS.md`
  2. `docs/TECHNICAL_ENV_GUIDE.md`
  3. `docs/PRODUCTION_HANDOVER_2026-03-08.md` or latest handover file
  4. `docs/CHANGE_MANIFEST_2026-03-08.md` (or current cycle manifest)
