# Technical Environment and Build Guide

This document provides technical context for developers and AI agents working on
Saral Lekhan Plus.

## Core Stack

- Framework: Expo SDK 49 with committed native Android sources
- Runtime: Node.js 20.x
- Language: TypeScript 5.x
- Navigation: Expo Router v2
- State: Zustand
- Database: Expo SQLite
- Native baseline: React Native 0.72.10, Java 17, AGP 7.4.2, Gradle 8.0.1
- Agent Stack:
  - CLI: **Android CLI** (`android.exe`) localized in `%USERPROFILE%\.android-cli`
  - Skills: Official Android modular skills located in `.agents/skills/`
  - Lock: `skills-lock.json`

## Build Environment

- Java: 17
- Android SDK:
  - compileSdk: 34
  - targetSdk: 34
  - minSdk: 21
- NDK: 23.1.7779620
- CI direct-release command: `npm run build:android:direct`
- Local F-Droid command: `npm run build:android:fdroid`
- CI action baseline:
  - `actions/checkout@v4`
  - `actions/setup-node@v4`
  - `actions/setup-java@v4`
  - `actions/upload-artifact@v4`
  - `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`
- Local release-resource verification:
  - `cd android && ./gradlew :app:processDirectReleaseResources --no-daemon`
  - requires Java 17 and valid signing/env placeholders when release tasks are evaluated.

## Local Build Warning

- If the local machine uses Java 20+ for this Gradle stack, script compilation can fail.
- Use Java 17 for local Android verification to match CI and the F-Droid recipe.

## Runtime UX Flags

- Store: `src/store/runtimeUxFlagsStore.ts`
- Remote source URL: `RUNTIME_FLAGS_URL` from `src/utils/buildInfo.ts`
- Direct builds point to `runtime-flags.json` in the repo.
- F-Droid builds ship an empty runtime-flags URL and stay on bundled defaults.
- Local cache key: `saral-lekhan-runtime-ux-flags-v1`

## Startup Rules

- Root startup owner: `src/app/_layout.tsx`
- Splash flow:
  1. `preventAutoHideAsync` at root
  2. Initialize stores/services
  3. Return `null` while startup is blocked
  4. Hide splash after `coreReady` and the first real root layout pass
- Never add a second branded JS splash between native splash and app content.

## Release and Updater Rules

- The direct flavor checks GitHub Releases, not GitHub Actions artifacts.
- The F-Droid flavor disables the updater module and ships with `UPDATER_MODE=fdroid`.
- To ship a direct Android hotfix:
  1. push `main`
  2. create tag `vX.Y.Z`
  3. push the tag
  4. verify the workflow publishes the APK to GitHub Releases

## Spark AI Baseline

- Spark operations must show explicit generation state.
- Spark AI stays disabled until the user adds a Gemini API key.
- F-Droid builds still include Spark AI as optional BYO-key functionality and should declare `NonFreeNet`.

## Compatibility Constraints

- Keep `@shopify/flash-list` at `1.8.3` or a verified compatible 1.x release.
- Keep app version metadata synchronized:
  - `package.json`
  - `app.config.js`
  - `android/app/build.gradle` (`versionName`, `versionCode` sourced from `package.json`)

## Documentation Discipline

- `docs/` stays version-controlled for production handover continuity.
- Production-impacting build changes should update the active build and release docs in this folder.
