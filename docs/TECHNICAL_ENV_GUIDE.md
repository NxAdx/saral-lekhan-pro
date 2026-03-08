# Technical Environment & Build Guide 🛠️

This document provides the necessary technical context for developers and AI agents to build, maintain, and contribute to **Saral Lekhan Plus**.

## 🏗️ Core Tech Stack
- **Framework**: [Expo SDK 49](https://expo.dev/) (Managed Workflow / Prebuild)
- **Runtime**: Node.js v20+ (LTS recommended)
- **Language**: TypeScript 5.1+
- **Navigation**: Expo Router v2
- **State**: Zustand v4
- **Database**: Expo SQLite v11
- **Styling**: React Native StyleSheet + Custom Design Tokens (`src/tokens.ts`)
- **Native**: React Native 0.72.10

## 🤖 Build Environment Requirements
To build the production APK natively (`npx expo run:android` or `assembleRelease`), the following environment is required:

- **JDK**: Java 17 (Temurin/Zulu; matches CI and current Android toolchain)
- **Gradle**: 8.0.1 (Configured in `android/gradle/wrapper/gradle-wrapper.properties`)
- **Android Gradle Plugin (AGP)**: 7.4.2 (`android/build.gradle`)
- **Android SDK**: 
  - Compile SDK: 34
  - Target SDK: 34
  - Min SDK: 21
- **NDK**: 23.1.7779620 (or compatible)

## CI Baseline (GitHub Actions)
- **Runner**: `ubuntu-latest` (currently Ubuntu 24.04)
- **Node**: 20.x
- **Java**: 17 (`actions/setup-java@v4`)
- **Build command**: `./gradlew bundleRelease assembleRelease --no-daemon`

## Known Android Resource Constraint (Splash)
- Do not add `postSplashScreenTheme` in `android/app/src/main/res/values-v31/styles.xml` for this stack.
- Reason: current dependency/toolchain does not expose that attr, causing AAPT2 failure:
  - `error: style attribute 'attr/postSplashScreenTheme ...' not found`
- Keep API 31 splash items limited to:
  - `android:windowSplashScreenBackground`
  - `android:windowSplashScreenAnimatedIcon`
  - `android:windowSplashScreenIconBackgroundColor`
  - `android:windowBackground`

## 🚀 Getting Started (New Developer/Agent)
1. **Clone & Install**:
   ```bash
   npm install
   ```
2. **Environment Secrets**: Ensure `google-services.json` is present in `android/app/` if testing Google Sign-In locally.
3. **Local Development**:
   ```bash
   npx expo start
   ```
4. **Native Android Run**:
   ```bash
   npx expo run:android
   ```

## ⚠️ Critical Logic & Constraints
- **Startup Chain**: `_layout.tsx` owns native splash lifecycle (`preventAutoHideAsync` + hide on `coreReady`), then routes render in `index.tsx`.
- **Branding Sync**: Splash background, Loading Gap view, and Adaptive Icon background must ALL match `#d9d7d2`.
- **Versioning**: Always update `app.json` AND `package.json` before tagging a release.
- **Security**: `.env` files are untracked via `.gitignore`. `docs/` is intentionally versioned for production handover continuity.
- **FlashList Compatibility**: Keep `@shopify/flash-list` on `1.8.3` (or newer verified-compatible 1.x) for this stack. `1.4.3` fails CI Kotlin compile with `dispatchDraw` signature errors.

## 📦 Documentation Directory
- `docs/MASTER-PROJECT-DOCUMENTATION.md`: Global architecture and history.
- `docs/UPDATER-LOGIC.md`: Details on the GitHub-based in-app updater.
- `docs/App_Color_Palette.md`: Official branding hex codes.
- `docs/AGENT-CAPABILITIES-REGISTRY.md`: Tooling and MCP context.

## Startup UX Standard (Single Branded Splash)
- Use Android system splash as the only branded splash on launch.
- Keep native splash visible during initialization (`preventAutoHideAsync` in root, hide when `coreReady`).
- Do not show a second JS logo screen while startup tasks run; if fallback is needed, show only a plain background that matches splash color.
- This mirrors production practice from Android splash migration guidance: avoid duplicate custom splash behavior and transition directly into app content/placeholders.

## Current Health Snapshot (2026-03-08)
- TypeScript:
  - `npx tsc --noEmit` passes.
  - Strict unused check (`--noUnusedLocals --noUnusedParameters`) passes.
- Expo Doctor:
  - 14/15 checks pass.
  - Remaining:
    1. Non-CNG sync warning (native folders committed + app.json native config).
- Versioning baseline:
  - `app.json` version: `2.16.4`, `android.versionCode: 57`.
  - `android/app/build.gradle`: `versionName "2.16.4"`, `versionCode 57`.
- Known policy-sensitive permissions in Android manifest:
  - `REQUEST_INSTALL_PACKAGES` is intentionally present for in-app updater flow.
  - Review distribution model (Play vs direct APK) before release submission.

## References (Official)
- Android splash migration: https://developer.android.com/develop/ui/views/launch/splash-screen/migrate
- AndroidX SplashScreen API: https://developer.android.com/reference/androidx/core/splashscreen/SplashScreen
- Expo splash-screen API: https://docs.expo.dev/versions/latest/sdk/splash-screen/
- Expo splash behavior caveat (Expo Go vs standalone): https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/
