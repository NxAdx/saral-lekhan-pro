# Technical Environment and Build Guide

This document provides technical context for developers and AI agents working on **Saral Lekhan Plus**.

## Core Stack
- Framework: Expo SDK 49 (prebuild workflow with committed native folders)
- Runtime: Node.js 20.x
- Language: TypeScript 5.x
- Navigation: Expo Router v2
- State: Zustand
- Database: Expo SQLite
- Native baseline: React Native 0.72.10, Java 17, AGP 7.4.2, Gradle 8.0.1

## Build Environment
- Java: 17 (Temurin/Zulu)
- Android SDK:
  - compileSdk: 34
  - targetSdk: 34
  - minSdk: 21
- NDK: 23.1.7779620
- CI command: `./gradlew bundleRelease assembleRelease --no-daemon`
- CI action runtime baseline:
  - `actions/checkout@v6`
  - `actions/setup-node@v6`
  - `actions/setup-java@v5`
  - `actions/upload-artifact@v7`
  - `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`
- Local release-resource verification:
  - `./gradlew :app:processReleaseResources --no-daemon`
  - requires Java 17 and valid signing/env placeholders when release tasks are evaluated.

## Local Build Warning
- If local machine uses Java 20+, Gradle script compilation can fail with:
  - `Unsupported class file major version 64`
- Use Java 17 for local Android release verification to match CI.

## Android Splash Baseline (Single Splash)
- Launch activity theme must be `Theme.App.SplashScreen`.
- `Theme.App.SplashScreen` must inherit from `Theme.SplashScreen`.
- `android/app/build.gradle` must include `androidx.core:core-splashscreen` so splash attrs resolve at AAPT link time.
- Required splash items:
  - `windowSplashScreenBackground`
  - `windowSplashScreenAnimatedIcon`
  - `postSplashScreenTheme`
- `MainActivity` must call `setTheme(R.style.AppTheme)` before `super.onCreate(null)` (AppCompat safety baseline for this SDK/runtime mix).
- `AppTheme` `android:windowBackground` should stay plain (`@color/splashscreen_background`) so Android does not show a second branded splash phase after the system splash.
- Do not import/use `expo.modules.splashscreen.SplashScreenManager` on SDK 49 (`expo-splash-screen` 0.20.5); that symbol does not exist and will fail CI Java compile.
- Keep splash style declarations in `values/styles.xml`; avoid redundant `values-v31` overrides unless there is a proven device-specific need.
- `_layout.tsx` must not render a plain JS fallback screen before startup is ready; return `null` and hide the splash only from the first real root layout.

## Runtime UX Flags (Rollback Support)
- Store: `src/store/runtimeUxFlagsStore.ts`
- Remote source URL: `expo.extra.runtimeFlagsUrl` from `app.json`
- Remote file baseline: `runtime-flags.json` (repo root)
- Local cache key: `saral-lekhan-runtime-ux-flags-v1`
- Current flags:
  - `spark_loading_modal_v1`
  - `spark_loading_animation_v1`
- Safe rollback path:
  - Set `spark_loading_modal_v1=false` in remote flags JSON to revert to legacy inline Spark loading feedback without shipping a new binary.

## Startup Rules
- Root startup owner: `src/app/_layout.tsx`
- Splash flow:
  1. `preventAutoHideAsync` at root
  2. Initialize stores/services
  3. Return `null` while startup is still blocked
  4. Hide splash after `coreReady` and the first real root layout pass
- Never add a second branded JS splash between native splash and app content.

## Editor Media Rules
- `react-native-pell-rich-editor` content must not depend on temporary `file://` or `content://` gallery URIs.
- For picked gallery images:
  1. prefer `expo-image-picker` `base64: true`
  2. embed the result as `data:image/jpeg;base64,...`
  3. only fall back to manual file reads when picker Base64 is unavailable
- Existing saved HTML should normalize stale local image URIs on load when possible.

## Typography Rules
- Font-family normalization lives in:
  - `src/constants/fontConfig.ts`
  - `src/store/themeStore.ts`
  - `src/store/typographyStore.ts`
- UI elements that should remain visually consistent across app fonts must size from:
  - `theme.fontSize`, or
  - shared typography tokens from `useTypography()`
- Avoid raw `settings.fontSize` for editor body text or reusable pills, because it bypasses family-specific scale compensation.

## Release/Updater Rules
- The direct updater checks GitHub Releases, not GitHub Actions artifacts.
- To ship an updater-visible Android hotfix:
  1. push `main`
  2. create tag `vX.Y.Z`
  3. push tag
  4. verify the release workflow publishes APK assets to GitHub Releases

## Spark AI UX Baseline
- Spark operations must show explicit generation state.
- Blocking loading modal is the primary UX when `spark_loading_modal_v1` is enabled.
- Legacy inline fallback remains available via runtime flag rollback.
- Generation phases used by editor flows:
  - `preparing`, `generating`, `applying`, `done`, `error`

## Compatibility Constraints
- Keep `@shopify/flash-list` at `1.8.3` or newer verified 1.x compatible release.
- Keep app version metadata synchronized:
  - `app.json`
  - `package.json`
  - `android/app/build.gradle` (`versionName`, `versionCode`)

## Documentation Discipline
- `docs/` is version-controlled for production handover continuity.
- Every production-impacting change must update:
  - `docs/ERRORS-LOGS.md`
  - `docs/TECHNICAL_ENV_GUIDE.md`
  - `docs/AGENT-CAPABILITIES-REGISTRY.md`
  - current cycle manifest/handover doc
  - `docs/UX-ANIMATION-ROLLBACK-RUNBOOK.md`

## References
- Android splash migration:
  - https://developer.android.com/develop/ui/views/launch/splash-screen/migrate
- AndroidX SplashScreen API:
  - https://developer.android.com/reference/androidx/core/splashscreen/SplashScreen
- Expo splash-screen API:
  - https://docs.expo.dev/versions/latest/sdk/splash-screen/
