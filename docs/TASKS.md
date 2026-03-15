Current tasks and next actions

Completed:
- Scaffold project structure in `src/` with skeleton screens and `NotePill` component.
- Extracted design system (DOCX + HTML) and created `src/tokens.ts`.
- Created prototype `saral-lekhan-sample.html`.
- Installed dependencies and resolved peer conflicts to get Metro bundler running.
- **NoteList (Home) screen**: header, search, tag rail, `NotePill` list from `notesStore`, FAB.
- **Editor**: Rich text formatting toolbar, autosave, meta bar, and Hindi optimizations.
- **Store**: SQLite persistent database integration (`expo-sqlite`) for zero-data-loss logic.
- **UI components**: `TagPill`, `FAB`, `HardShadow`, `BentoCard`, `ThemedModal`.
- **Phase 7+ UI Overhaul**: Dynamic Theme Engine, Live Settings Preview, Metrolist font slider.
- **Phase 12 (Plus Features)**: Globabl Biometric Authentication lock screen (`expo-local-authentication`).
- **Phase 12 (Style Studio)**: Custom embedded Google Fonts (Playfair, JetBrains, Vesper Libre) and 8 Premium AMOLED-ready Palettes.
- **Phase 12 (Spark AI)**: Integrated `@google/generative-ai` for Title Generation, Note Summarization, and Prompt-driven content generation.
- **Phase 13 (Expansion)**: `.txt` and `.md` file imports via `expo-document-picker` with auto HTML compilation.
- **Phase 14 (Cloud Sync)**: Full SQLite Backup/Restore engine using Google Drive REST API and Native Google Sign-In (`@react-native-google-signin/google-signin`).
- **Phase 14 (I18n)**: Fully localized UI in English, Hindi, Marathi, Bengali, Tamil, and Telugu.
- **Phase 5 (Reliability)**: Persistent high-frequency logging system, crash survival storage, and global JS exception catching.
- **Phase 6 (Production Refinements)**: Base64 image rendering fix, Home screen toolbar integration (Report Bug / History), and UI accessibility enhancements (Modal contrast).
- Built and published successful EAS Production Android APK.
- **Phase 10 (Aesthetics)**: Full Icon System Migration to Tabler Icons (v2.9.1) with unified 2px stroke across all main screens.
- **Phase 10 (Stability)**: Resolved `BentoCard` prop mismatch in Trash screen causing potential crashes.
- **Phase 14 (Auth Debugging)**: Diagnosed `DEVELOPER_ERROR` via Firebase App Signing Fingerprint mismatches and GCP project mismatch. Corrected `WEB_CLIENT_ID` to correctly target the Firebase instance. Added SHA-1 printout step in GitHub CI.
- **Phase 10 (Visual Polish)**: Extinguished the 1ms "White Flash" on app resume by permanently locking the root window background to `#171513` using `expo-system-ui`.
- **Phase 17 (Auth Hardening)**: Fixed release signing path in `android/app/build.gradle` so release builds no longer default to debug keystore (primary root cause behind recurring `DEVELOPER_ERROR`).
- **Phase 17 (CI Hardening)**: Updated `.github/workflows/android-build.yml` to stop `expo prebuild --clean` overwrites and added strict `GOOGLE_SERVICES_JSON` validation (`com.sarallekhan` package + OAuth Web client presence).
- **Phase 17 (Startup Polish)**: Unified startup background to `#171513` across `app.json`, Android `values/colors.xml`, `values-night/colors.xml`, and `AppTheme` window background.
- **Phase 17 (Updater Polish)**: Green border pass for updater card/button and centralized app version source (`src/utils/githubUpdater.ts`) with semver-safe comparison.

## Phase 15: Deep Root Edge Cases (Auth & Flashes)
- [x] Eradicate Cold Boot White Flash via `styles.xml` CI patch
- [x] Eradicate React Navigation white transition flashes via Theme injection
- [x] Wrap `_layout.tsx` in `View` + `onLayoutRootView` to mask React startup frame
- [x] Root-cause fix merged for persisting `DEVELOPER_ERROR` (release signing + secret validation)
- [ ] Final live verification on freshly signed GitHub APK

## Phase 16: In-App Updater
- [x] Create `src/utils/githubUpdater.ts` (GitHub Releases API + APK download + intent launcher)
- [x] Add silent update check on Home Screen launch (`index.tsx`)
- [x] Add "Check for Updates" BentoCard UI in Settings
- [x] Configure CI pipeline to attach APK to GitHub Releases on tag push
- [x] Downgrade `expo-intent-launcher` to ~10.7.0 for SDK 49 compatibility
- [x] Version bumped to `2.9.4` (versionCode 35)

In progress:
- User verification of v2.9.4 APK features and Google Sign-In on the new release-signed build

Next actions (Future Roadmap):
1. Prepare Google Play Store submission assets.
2. Monitor user feedback on Devanagari font rendering (Noto Sans vs Hind vs Mukta).
3. Connect Weblate/Crowdin to open-source the `src/i18n/locales/*.json` files for community translation.

## Phase 18: Post-v2.9.9 Stabilization (March 2026)
- [x] Capture startup loop regression and restore stable baseline startup layout.
- [x] Document Google Sign-In mismatch runbook in `docs/ERRORS-LOGS.md` and CI guide.
- [x] Add release notes for `v2.9.9`.
- [x] Verify repository Actions permission is `Read and write` and confirm release publish succeeds on next tag.
- [x] Re-validate Google Sign-In on clean install after refreshing Firebase SHA + `google-services.json` secret.
- [x] Re-test in-app updater against a real published GitHub release (v2.9.9).

- **Phase 19: Loading Screen Fix (v2.9.10)**: Fixed stuck loading screen by ensuring `isLoaded` always sets to true. Documented Error #25.
- **Phase 14 (Auth Hardening Final)**: Verified release SHA-1 matches Firebase config.
- **Phase 20: Instant Launch Optimization (v2.10.0)**: Moved DB initialization to `_layout.tsx`. Eliminated pulsing gray skeleton for an instant-render experience.
- **Phase 21: Updater & Auth Polish (v2.10.1)**: 
    - Fixed 100% updater hang via fire-and-forget intents.
    - Added `REQUEST_INSTALL_PACKAGES` permission for Android 11+.
    - Updated CI to print SHA-256 fingerprints needed for full Google Auth stability.
- **Phase 22: Auth Drift Guard (CI)**:
    - Added CI validation to ensure `APP_PACKAGE` and `WEB_CLIENT_ID` in code match injected `GOOGLE_SERVICES_JSON`.
    - Added CI SHA-1 congruence check between release keystore and Android OAuth `certificate_hash` in injected `google-services.json`.
    - Build now fails early on config drift so broken Google Sign-In artifacts are not published.
- **Phase 23: Updater Reliability Hardening (v2.10.1+)**:
    - Added `REQUEST_INSTALL_PACKAGES` to committed native `android/app/src/main/AndroidManifest.xml` for CI-built APK parity.
    - Added guaranteed updater UI reset (`isDownloadingUpdate = false` in `finally`) in Settings update flow.
    - Added dedicated updater architecture/troubleshooting runbook: `docs/UPDATER-LOGIC.md`.
- **Phase 24: Google Sign-In Resilience Fallback**:
    - Added one-time fallback retry for `DEVELOPER_ERROR` in `GoogleDriveService.signIn()`.
    - Fallback uses Android default OAuth config from `google-services.json` (no forced `webClientId`) to recover client wiring edge cases.

Current tasks and next actions

Completed:
- Scaffold project structure in `src/` with skeleton screens and `NotePill` component.
- Extracted design system (DOCX + HTML) and created `src/tokens.ts`.
- Created prototype `saral-lekhan-sample.html`.
- Installed dependencies and resolved peer conflicts to get Metro bundler running.
- **NoteList (Home) screen**: header, search, tag rail, `NotePill` list from `notesStore`, FAB.
- **Editor**: Rich text formatting toolbar, autosave, meta bar, and Hindi optimizations.
- **Store**: SQLite persistent database integration (`expo-sqlite`) for zero-data-loss logic.
- **UI components**: `TagPill`, `FAB`, `HardShadow`, `BentoCard`, `ThemedModal`.
- **Phase 7+ UI Overhaul**: Dynamic Theme Engine, Live Settings Preview, Metrolist font slider.
- **Phase 12 (Plus Features)**: Globabl Biometric Authentication lock screen (`expo-local-authentication`).
- **Phase 12 (Style Studio)**: Custom embedded Google Fonts (Playfair, JetBrains, Vesper Libre) and 8 Premium AMOLED-ready Palettes.
- **Phase 12 (Spark AI)**: Integrated `@google/generative-ai` for Title Generation, Note Summarization, and Prompt-driven content generation.
- **Phase 13 (Expansion)**: `.txt` and `.md` file imports via `expo-document-picker` with auto HTML compilation.
- **Phase 14 (Cloud Sync)**: Full SQLite Backup/Restore engine using Google Drive REST API and Native Google Sign-In (`@react-native-google-signin/google-signin`).
- **Phase 14 (I18n)**: Fully localized UI in English, Hindi, Marathi, Bengali, Tamil, and Telugu.
- **Phase 5 (Reliability)**: Persistent high-frequency logging system, crash survival storage, and global JS exception catching.
- **Phase 6 (Production Refinements)**: Base64 image rendering fix, Home screen toolbar integration (Report Bug / History), and UI accessibility enhancements (Modal contrast).
- Built and published successful EAS Production Android APK.
- **Phase 10 (Aesthetics)**: Full Icon System Migration to Tabler Icons (v2.9.1) with unified 2px stroke across all main screens.
- **Phase 10 (Stability)**: Resolved `BentoCard` prop mismatch in Trash screen causing potential crashes.
- **Phase 14 (Auth Debugging)**: Diagnosed `DEVELOPER_ERROR` via Firebase App Signing Fingerprint mismatches and GCP project mismatch. Corrected `WEB_CLIENT_ID` to correctly target the Firebase instance. Added SHA-1 printout step in GitHub CI.
- **Phase 10 (Visual Polish)**: Extinguished the 1ms "White Flash" on app resume by permanently locking the root window background to `#171513` using `expo-system-ui`.
- **Phase 17 (Auth Hardening)**: Fixed release signing path in `android/app/build.gradle` so release builds no longer default to debug keystore (primary root cause behind recurring `DEVELOPER_ERROR`).
- **Phase 17 (CI Hardening)**: Updated `.github/workflows/android-build.yml` to stop `expo prebuild --clean` overwrites and added strict `GOOGLE_SERVICES_JSON` validation (`com.sarallekhan` package + OAuth Web client presence).
- **Phase 17 (Startup Polish)**: Unified startup background to `#171513` across `app.json`, Android `values/colors.xml`, `values-night/colors.xml`, and `AppTheme` window background.
- **Phase 17 (Updater Polish)**: Green border pass for updater card/button and centralized app version source (`src/utils/githubUpdater.ts`) with semver-safe comparison.

## Phase 15: Deep Root Edge Cases (Auth & Flashes)
- [x] Eradicate Cold Boot White Flash via `styles.xml` CI patch
- [x] Eradicate React Navigation white transition flashes via Theme injection
- [x] Wrap `_layout.tsx` in `View` + `onLayoutRootView` to mask React startup frame
- [x] Root-cause fix merged for persisting `DEVELOPER_ERROR` (release signing + secret validation)
- [ ] Final live verification on freshly signed GitHub APK

## Phase 16: In-App Updater
- [x] Create `src/utils/githubUpdater.ts` (GitHub Releases API + APK download + intent launcher)
- [x] Add silent update check on Home Screen launch (`index.tsx`)
- [x] Add "Check for Updates" BentoCard UI in Settings
- [x] Configure CI pipeline to attach APK to GitHub Releases on tag push
- [x] Downgrade `expo-intent-launcher` to ~10.7.0 for SDK 49 compatibility
- [x] Version bumped to `2.9.4` (versionCode 35)

In progress:
- User verification of v2.9.4 APK features and Google Sign-In on the new release-signed build

Next actions (Future Roadmap):
1. Prepare Google Play Store submission assets.
2. Monitor user feedback on Devanagari font rendering (Noto Sans vs Hind vs Mukta).
3. Connect Weblate/Crowdin to open-source the `src/i18n/locales/*.json` files for community translation.

## Phase 18: Post-v2.9.9 Stabilization (March 2026)
- [x] Capture startup loop regression and restore stable baseline startup layout.
- [x] Document Google Sign-In mismatch runbook in `docs/ERRORS-LOGS.md` and CI guide.
- [x] Add release notes for `v2.9.9`.
- [x] Verify repository Actions permission is `Read and write` and confirm release publish succeeds on next tag.
- [x] Re-validate Google Sign-In on clean install after refreshing Firebase SHA + `google-services.json` secret.
- [x] Re-test in-app updater against a real published GitHub release (v2.9.9).

- **Phase 19: Loading Screen Fix (v2.9.10)**: Fixed stuck loading screen by ensuring `isLoaded` always sets to true. Documented Error #25.
- **Phase 14 (Auth Hardening Final)**: Verified release SHA-1 matches Firebase config.
- **Phase 20: Instant Launch Optimization (v2.10.0)**: Moved DB initialization to `_layout.tsx`. Eliminated pulsing gray skeleton for an instant-render experience.
- **Phase 21: Updater & Auth Polish (v2.10.1)**: 
    - Fixed 100% updater hang via fire-and-forget intents.
    - Added `REQUEST_INSTALL_PACKAGES` permission for Android 11+.
    - Updated CI to print SHA-256 fingerprints needed for full Google Auth stability.
- **Phase 22: Auth Drift Guard (CI)**:
    - Added CI validation to ensure `APP_PACKAGE` and `WEB_CLIENT_ID` in code match injected `GOOGLE_SERVICES_JSON`.
    - Added CI SHA-1 congruence check between release keystore and Android OAuth `certificate_hash` in injected `google-services.json`.
    - Build now fails early on config drift so broken Google Sign-In artifacts are not published.
- **Phase 23: Updater Reliability Hardening (v2.10.1+)**:
    - Added `REQUEST_INSTALL_PACKAGES` to committed native `android/app/src/main/AndroidManifest.xml` for CI-built APK parity.
    - Added guaranteed updater UI reset (`isDownloadingUpdate = false` in `finally`) in Settings update flow.
    - Added dedicated updater architecture/troubleshooting runbook: `docs/UPDATER-LOGIC.md`.
- **Phase 24: Google Sign-In Resilience Fallback**:
    - Added one-time fallback retry for `DEVELOPER_ERROR` in `GoogleDriveService.signIn()`.
    - Fallback uses Android default OAuth config from `google-services.json` (no forced `webClientId`) to recover client wiring edge cases.

- **Phase 49: Startup Optimization (v2.16.1)**:
    - Optimized splash dismissal logic to wait for `HomeScreen` data.
    - Updated official splash background to light grey (`#d9d7d2`).
    - Unified initialization \"Gap View\" background to prevent colored flashes.
- **Phase 50: Release Fix & Startup Polish (v2.16.2)**:
    - Added splash logo to the intermediate loading screen for a 100% seamless transition.
    - Synchronized versioning across `app.json`- [x] Phase 51: Splash & Icon Color Sync (v2.16.3).
- [x] Phase 52: Production Audit & Roadmap (v2.16.7).

In progress:
- Phase 53: Production Hardening & Normalization.
- **Phase 51: Splash & Icon Color Sync (v2.16.3)**:
    - Forced light-mode splash background even if the system is in dark mode.
    - Delayed theme-based background changes in `_layout.tsx` until `coreReady` to eliminate \"Dark Flash\".
    - Final verification and push of v2.16.3.
- **Phase 52: Native Splash/Icon Consistency Hotfix (v2.16.3+)**:
    - Synced native Android color resources to `#d9d7d2` in `values/colors.xml` and `values-night/colors.xml`.
    - Added Android 12+ splash alignment via `android/app/src/main/res/values-v31/styles.xml`.
    - Updated `AppTheme` `android:windowBackground` to `@color/splashscreen_background`.
    - Regenerated fallback launcher PNG icons (`mipmap-*`) with `#d9d7d2` background for launcher cache/device compatibility.
    - Pending final user verification on fresh uninstall/reinstall build.

In progress:

Next actions (Future Roadmap):
1. Prepare Google Play Store submission assets.
2. Monitor user feedback on Devanagari font rendering (Noto Sans vs Hind vs Mukta).
3. Connect Weblate/Crowdin to open-source the `src/i18n/locales/*.json` files for community translation.
4. Implement the New Editor feature (Markdown Shortcuts/Toolbar enhancements).
- **Phase 53: CI Resource Linking Hotfix (v2.16.3+)**:
    - Fixed GitHub Actions build break in `:app:bundleReleaseResources` caused by unsupported `postSplashScreenTheme` in `values-v31`.
    - Removed `postSplashScreenTheme` and kept only supported Android 12 splash attributes.
    - Updated `docs/TECHNICAL_ENV_GUIDE.md` with CI-accurate toolchain versions (Java 17, Gradle 8.0.1, AGP 7.4.2).
- **Phase 54: Single-Stage Splash UX Refactor (v2.16.4+)**:
    - Removed second branded splash from React startup path.
    - Root layout now owns splash hide lifecycle and releases splash when `coreReady` becomes true.
    - Home screen no longer calls splash hide, preventing duplicate transition timing.
    - Pre-ready fallback is plain background only (`#d9d7d2`) for visual continuity.
- **Phase 55: Production Hardening Pass (2026-03-08)**:
    - Removed tracked temp/garbage files causing TS and repository noise (`tmp_layout_new.tsx`, `window_dump.xml`, stale `NotePill`).
    - Fixed Google Sign-In previous-session compatibility for mixed package versions.
    - Aligned version metadata across app config, Android build.gradle, and Settings UI.
    - Cleared Expo doctor blockers for schema + peer deps (`fonts` key removal, direct `react-native-gesture-handler`, removed direct `@types/react-native`).
    - Ran validation gates:
      - `npx tsc --noEmit` pass
      - `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` pass
      - `npx expo-doctor` now 13/15 pass (2 expected strategic items remain)
- **Phase 56: Theme Best-Practice Refactor + Android API 34 (2026-03-08)**:
    - Added centralized font config (`FONT_SCALES`, Devanagari-safe font fallback).
    - Unified typography/theme scaling to remove internal drift.
    - Replaced broad Zustand subscriptions with selector + `shallow` in critical theme paths.
    - Memoized navigation theme object in root layout.
    - Updated Android compile/target SDK to 34.
    - Validation:
      - `npx tsc --noEmit` pass
      - `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` pass
      - `npx expo-doctor` now 14/15 pass (only non-CNG warning remains)
