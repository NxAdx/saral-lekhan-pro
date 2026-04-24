# AGENT-CAPABILITIES-REGISTRY

This registry tracks practical capabilities and hard constraints for AI agents working on **Saral Lekhan Plus**.

## 1) Automation and Platform Tooling
- **GitHub Actions**: primary CI/CD for production Android builds (AAB/APK).
- **Actions runtime policy**: workflows are configured to run JS actions on Node 24 (`FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`).
- **GitHub updater contract**:
  - the in-app updater reads **GitHub Releases**, not Actions artifacts.
  - branch pushes alone are not enough for direct installs.
  - updater-visible hotfixes must ship as a tagged release (`refs/tags/v*`).
- **ADB**: device diagnostics and log capture.
  - Path: `C:\Program Files (x86)\Minimal ADB and Fastboot\adb.exe`
- **Android CLI**: Official Google CLI for agent-based Android development.
  - Path: `%USERPROFILE%\.android-cli\android.exe`
  - Usage: `android init`, `android skills add`, `android sdk list`
- **Sentry**: runtime crash and error telemetry.
- **Firebase/Google Services**: OAuth + Drive integration validated in CI via secret and fingerprint checks.

## 2) Specialized Agent Skills
The project includes a suite of **Official Android Skills** from `https://github.com/android/skills`, localized in `.agents/skills/`. These skills provide agents with technical specifications and best practices for:
- **AGP 9 Upgrades**: Systematic migration and build troubleshooting.
- **Edge-to-Edge**: Implementation of adaptive system bar support.
- **Jetpack Compose Migration**: Pattern-based conversion from XML Views to Compose.
- **Navigation 3**: Implementation and migration guidelines.
- **Play Billing**: Version upgrades and compliance.
- **R8/Proguard Analysis**: Optimization and size reduction.

These skills are registered in `skills-lock.json` and are automatically loaded by the Antigravity agent.

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
  - `RUNTIME_FLAGS_URL` resolved from `src/utils/buildInfo.ts`
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
  1. On Expo SDK 49 with `expo-splash-screen` 0.20.5, `Theme.App.SplashScreen` must inherit `AppTheme` and override only `android:windowBackground=@drawable/splashscreen` to match Expo's generated Android plugin path.
  2. Do not stack Android 12 `Theme.SplashScreen` on top of Expo's own splash overlay in this project; that creates a visible double-splash sequence.
  3. `MainActivity` should use plain `super.onCreate(null)` for the current stable splash path.
  4. Do not reference `SplashScreenManager` (not present in `expo-splash-screen` 0.20.5).
  5. `AppTheme` should not own the splash background; otherwise the activity can fall through to a plain branded-color frame after the native splash hides.
  6. `_layout.tsx` must return `null` before startup is ready and hide the splash only after both startup and root navigation state are ready.
- **Editor image embedding baseline**:
  1. Gallery images inserted into the Pell editor must be embedded, not left as transient `file://` or `content://` URIs.
  2. `expo-image-picker` Base64 payloads must be treated as `image/jpeg` when building the data URI for the editor.
- **Editor toolbar baseline**:
  1. `react-native-pell-rich-editor` `RichToolbar` has a default 44dp container; selected states will crop if the custom item height approaches the container height.
  2. For this app, prefer a slimmer underline-style selected state inside the 44dp container instead of a tall filled pill.
- **Typography consistency baseline**:
  1. User-facing text that should track font-family normalization must use `theme.fontSize` or shared typography tokens.
  2. Avoid raw `settings.fontSize` for editor/body sizing when the chosen font family has its own compensation scale.
  3. The home brand lockup `Saral लेखन` is brand-controlled, not user-font-controlled.
  4. Keep the Latin half on `Poppins-Bold`; only the Devanagari half should use `Hind-Bold`.
- **Settings surface styling baseline**:
  - single-row settings cards should clip overflow and avoid implicit elevation/shadow so borders stay clean on Android.
- **FlashList compatibility**:
  - keep `@shopify/flash-list` at `1.8.3` or newer verified-compatible 1.x.
  - `1.4.3` causes CI Kotlin failure in `:shopify_flash-list:compileReleaseKotlin`.

## 5) Product Consistency Constraints
- Startup/system background and icon branding should remain aligned to `#d9d7d2`.
- Always synchronize release version values across:
  - `package.json`
  - `app.config.js`
  - `android/app/build.gradle` (`versionName`, `versionCode` sourced from `package.json`)

## 6) Documentation Discipline
- `docs/` is intentionally version-controlled for handover continuity.
- For release-facing changes, update at minimum:
  1. `docs/ERRORS-LOGS.md`
  2. `docs/TECHNICAL_ENV_GUIDE.md`
  3. latest cycle handover doc (`docs/PRODUCTION_HANDOVER_YYYY-MM-DD.md`)
  4. latest cycle manifest (`docs/CHANGE_MANIFEST_YYYY-MM-DD.md`)
  5. rollback runbook when UX/runtime-control behavior changes (`docs/UX-ANIMATION-ROLLBACK-RUNBOOK.md`)

## 7) Approved Reference Apps
- **Mihon**
  - reference for bounded native splash ownership and controlled exit timing.
  - local path: `D:/Development/Production/research/mihon`
- **ImageToolbox**
  - reference for centralized settings/theme state and visually stable preference rows.
  - local path: `D:/Development/Production/research/ImageToolbox`
- **Metrolist**
  - reference for clean settings grouping, low-elevation card treatment, and multi-language settings UX.
  - local path: `D:/Development/Production/research/Metrolist`
