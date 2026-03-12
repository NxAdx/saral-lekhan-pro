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
  - `windowSplashScreenIconBackgroundColor`
  - `postSplashScreenTheme`
- `MainActivity` must call `SplashScreenManager.registerOnActivity(this)` in `onCreate`.
- Do not call `setTheme(R.style.AppTheme)` manually during launch in `MainActivity`.
- `_layout.tsx` must keep pre-ready fallback plain and non-branded.

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
  3. Hide splash on `coreReady`
- Never add a second branded JS splash between native splash and app content.

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
