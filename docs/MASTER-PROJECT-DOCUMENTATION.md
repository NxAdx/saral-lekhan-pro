# Master Project Documentation: सरल लेखन (Saral Lekhan Plus)

> **Handoff Addendum (v2.17.31 / v3.0 F-Droid Release - 2026-03-24)**:
> - **FOSS Compliance**: Completely removed Google Mobile Services (GMS), Google Sign-In, and Google Drive dependencies.
> - **Local-First Backup**: Replaced cloud sync with a Local SQLite Backup Vault using `expo-document-picker`.
> - **UX Polish**: Moved font resizing to Settings, added explicit Spark AI buttons, and integrated a GitHub Bug Report link.
> - **Version State**: Mainline is at **v2.17.31** (versionCode 64+).

> **Handoff Addendum (v2.16.4 - 2026-03-08)**:
> - **Native Resource Sync**: Synchronized `colors.xml`, `styles.xml`, and `ic_launcher` assets to force light branding (`#d9d7d2`) at the system level.
> - **Android 12+ Splash Fix**: Explicitly handled `windowSplashScreenBackground` in `values-v31` to eliminate dark system flashes.
> - **Theme and Build Hardening**: Full production handover is documented in `docs/PRODUCTION_HANDOVER_2026-03-08.md`.
> - **Audit Trail**: Full commit/file trace is documented in `docs/CHANGE_MANIFEST_2026-03-08.md`.
> - **Toolchain Baseline**: Current baseline is Java 17 + Gradle 8.0.1 + AGP 7.4.2 + Android compile/target SDK 34.
> - **Version State**: Mainline is at **v2.16.4** (versionCode 57).

> **Post-v2.16.3 Startup/Icon Hotfix (2026-03-08)**:
> - **Dual Splash Root Cause Fixed**: Native Android color resources still had legacy dark values (`#171513`) causing the first system splash to render dark before the app splash.
> - **Android 12+ Alignment Added**: Added `values-v31/styles.xml` with `android:windowSplashScreenBackground` and `android:windowSplashScreenIconBackgroundColor` mapped to `#d9d7d2`.
> - **Adaptive Icon/Launcher Consistency**: Confirmed transparent adaptive foreground and regenerated fallback launcher PNG icons (`mipmap-*`) with `#d9d7d2` background to avoid cached dark launcher surfaces.
> - **Files Updated**:
>   - `android/app/src/main/res/values/colors.xml`
>   - `android/app/src/main/res/values-night/colors.xml`
>   - `android/app/src/main/res/values/styles.xml`
>   - `android/app/src/main/res/values-v31/styles.xml`
>   - `android/app/src/main/res/mipmap-*/ic_launcher.png`
>   - `android/app/src/main/res/mipmap-*/ic_launcher_round.png`
> - **Verification Required**: Uninstall app (to clear launcher cache), reinstall fresh APK, and cold-launch to validate single visual splash continuity on `#d9d7d2`.

> **Handoff Addendum (v2.16.3 - 2026-03-08)**:
> - **Unified Startup Branding**: Forced splash and adaptive icon background color to `#d9d7d2` across all system states (even Dark Mode).
> - **Seamless Transition**: Added the logo to the intermediate loading screen to prevent "disappearing logo" or white flashes during boot.
> - **Release Integrity**: Synchronized versioning across `app.json` and `package.json` to v2.16.3.
> - **Version State**: Mainline is at **v2.16.3** (versionCode 56).

> **Handoff Addendum (v2.13.2 - 2026-03-06)**:
> - **Emergency Startup Fix**: Introduced a guaranteed fail-safe UI rendering logic. If assets (fonts/DB) fail to load within 5 seconds, the app now forcibly renders the main UI instead of hanging. Refactored Sentry initialization to be non-blocking.
> - **Version State**: Mainline is at **v2.13.2** (versionCode 47).

> **Handoff Addendum (v2.13.1 - 2026-03-06)**:
> - **Deep Startup Fix**: Bundled fonts locally to `assets/fonts/` for 100% offline reliability. Implemented a 5-second combined safety net in `RootLayout`.
> - **Offline Reliability**: App is now 100% independent of network-based font loading during boot.
> - **Version State**: Mainline is at **v2.13.1** (versionCode 46).

> **Handoff Addendum (v2.13.0 - 2026-03-06)**:
> - **Performance Boost**: Migrated to `FlashList` for ultra-smooth scrolling and implemented `React.memo` for `BentoCard` to minimize re-renders.
> - **Agent Skills**: Integrated `vercel-react-native-skills` to enforce production-grade performance and UI best practices.
> - **Version State**: Mainline is at **v2.13.0** (versionCode 45).

> **Handoff Addendum (v2.12.0 - 2026-03-06)**:
> - **Smooth Boot**: White flash eliminated in `_layout.tsx` and `HomeSkeleton` deleted. App now stays themed during loading.
> - **Theme Simplification**: AMOLED mode and Pitch theme removed to reduce design debt. Standard dark themes are now curated for high-contrast readiness.
> - **Robust Updater**: Switched to `/releases` endpoint in `githubUpdater.ts` for strictly semantic version checks.
> - **UI Consistency**: All native alerts related to updates replaced with `ThemedModal`.
> - **Version State**: Mainline is at **v2.12.0** (versionCode 44).


> **Important for AI Agents**: This document provides the complete context, architecture, design philosophy, and technical implementation details of the Saral Lekhan app. Read this first to understand the project deeply.

> **Handoff Addendum (v2.10.1 - 2026-03-04
