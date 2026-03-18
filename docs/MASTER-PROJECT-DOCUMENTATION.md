# Master Project Documentation: सरल लेखन (Saral Lekhan)

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

> **Handoff Addendum (v2.10.1 - 2026-03-04)**:
> - **Instant Launch Optimized**: Database initialization moved to `_layout.tsx` (concurrent with splash/fonts). Home renders instantly without the `HomeSkeleton` overlay.
> - **Updater Hang Fixed**: `githubUpdater.ts` now uses fire-and-forget intents and the `REQUEST_INSTALL_PACKAGES` permission to prevent the "Stuck at 100%" bug on Android 11+.
> - **Auth Hardened**: GitHub CI now prints both **SHA-1 and SHA-256** fingerprints. Both must be registered in Firebase to prevent `DEVELOPER_ERROR` in production builds.
> - **Version State**: Mainline is at **v2.10.1** (versionCode 43).

> **Post-v2.10.1 Hotfix (main - 2026-03-04)**:
> - Added `REQUEST_INSTALL_PACKAGES` in committed native `AndroidManifest.xml` to ensure installer permission exists in CI-built APKs.
> - Settings updater now always clears `isDownloadingUpdate` in `finally`, preventing UI from staying at "Downloading 100%".
> - Added dedicated updater technical runbook: `docs/UPDATER-LOGIC.md`.
> - Added Google Sign-In resilience fallback: on `DEVELOPER_ERROR`, app retries once with Android default OAuth config from `google-services.json`.

> **Hotfix Addendum (v2.9.9/v2.10.0)**:
> - Release signing now uses dedicated release keystore inputs in `android/app/build.gradle`.
> - Production GitHub workflow validates `GOOGLE_SERVICES_JSON` and no longer runs `expo prebuild --clean`.

## 1. Project Overview & Idea
**सरल लेखन (Saral Lekhan)** is a premium, tactile notes application designed primarily for Hindi (Devanagari) writers.
- **Goal**: To make digital writing feel physical and beautiful.
- **Name**: "Saral Lekhan" translates to "Simple Writing".
- **Design Philosophy**: Based on the **Tippani Design System**, which uses warm palettes, hard-offset shadows (tactile feel), and a "pill-forward" UI vocabulary.

---

## 2. Technical Stack
- **Framework**: [Expo](https://expo.dev/) (SDK 49)
- **Core**: React Native (0.72.10)
- **Navigation**: [Expo Router](https://docs.expo.dev/routing/introduction/) (v2, File-based routing)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Simple, efficient stores)
- **Database**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Local persistent storage)
- **Styling**: React Native StyleSheet + Centralized Design Tokens (`src/tokens.ts`)
- **Animation**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) (v3)
- **Icons**: React Native SVG (Lucide-like custom implementations)
- **Language**: TypeScript (Strict typing for robustness)

---

## 3. Design System (Tippani)
The app strictly follows the Tippani system defined in `docs/tippani-design-system.html`.

### Visual Tokens (`src/tokens.ts`)
- **Colors**:
  - `bg`: `#D9D7D2` (Main surface, warm grey)
  - `accent`: `#C14E28` (Burnt terracotta for primary actions)
  - `ink`: `#1C1A17` (Deep charcoal for primary text)
- **Typography**:
  - **Hindi/UI**: `Hind` (Sans-serif, optimized for Devanagari)
  - **Display**: `Vesper Libre` (Serif, used for loud titles)
  - **Metadata**: `DM Mono` (Monospace for word counts/timestamps)
- **Tactile UI**:
  - **Hard Shadows**: No blur, fixed offsets (e.g., `2px 3px`).
  - **Interactives**: Buttons "press down" physically (TranslateY + shadow reduction).

---

## 4. Folder Structure
```text
saral-lekhan/
├── android/            # Native Android project (Java 17 CI baseline, Gradle 8.0.1, target SDK 34)
├── docs/               # Technical specs, logs, and master documentation
├── src/                # Primary source code
│   ├── app/            # Expo Router screens (file-based navigation)
│   │   ├── (main)/     # Main app group (Home, etc.)
│   │   └── editor/     # Editor screens ([id].tsx, new.tsx)
│   ├── components/     # UI components
│   │   ├── ui/         # Primitives (HardShadow, TagPill, FAB, etc.)
│   │   └── layout/     # Reusable layout wrappers
│   ├── store/          # Zustand stores (notesStore.ts)
│   ├── db/             # SQLite schema and migration logic
│   ├── i18n/           # Bilingual strings (Hindi/English)
│   ├── tokens.ts       # Central design system tokens
│   └── utils/          # Helper functions (date formatting, etc.)
├── assets/             # Images, fonts, and icons
├── app.json            # Expo configuration
└── package.json        # Dependencies and scripts
```

---

## 5. Key Technical Features
### Tactile HardShadows
Implemented via a custom `<HardShadow />` component that wraps UI elements to provide the signature Tippani block-shadow effect across both Android and iOS without relying on inconsistent native elevation.

### Hindi-First Editor
The editor features a custom toolbar for quick access to formatting and specific Hindi punctuation/symbols (। ॥), optimizing the experience for Devanagari content creation.

### Robust Local Storage
Uses SQLite via `expo-sqlite` for persistence. The `notesStore` (Zustand) acts as the bridge between the UI and the database, ensuring reactive updates and fast performance.

#### Diagnostic Tools
> [!NOTE]
> **Minimal ADB Path**: `C:\Program Files (x86)\Minimal ADB and Fastboot\adb.exe`
> Use this command for diagnostics: `& "C:\Program Files (x86)\Minimal ADB and Fastboot\adb.exe" logcat -d ReactNativeJS:V saral:V`

## v2.14.0 - Total Startup Safety
#### Biometric Security & AuthStore
Implemented `expo-local-authentication` to secure the app. The core lock logic is separated into a strict `authStore.ts` (Zustand) that listens to device `AppState` changes (Active vs Background) and forces a global `LockScreen.tsx` modal overlay upon return.

#### Spark AI Integration
Integrated `@google/generative-ai` to power the Editor's smart tools. Using a Bring-Your-Own-Key (BYOK) architecture, the `aiService.ts` handles:
1. Contextual Title Generation based on body text.
2. Note Summarization using localized prompts.
3. Free-hand Prompts ("Format Note", "Write a poem") directly returning compiled Markdown-to-HTML back into the rich-text view.

#### File I/O & Cloud Sync (Google Drive)
- **Local Imports**: Uses `expo-document-picker` to parse `.txt` and `.md` files directly into SQLite.
- **Google Drive Backup**: Uses `@react-native-google-signin/google-signin` for native Cross-Platform authentication. Securely retrieves an Access Token via a Web Client ID, then executes raw multipart HTTP requests via the Google Drive REST API (`v3/files`) to silently push/pull the `saral_lekhan.db` database. 
- **Critical Auth Context**: The `WEB_CLIENT_ID` must strictly align with the specific Firebase project where the APK's SHA-1 signing certificates (including Google Play App Signing keys) are registered. Mismatches or dropped JSON injects will trigger `DEVELOPER_ERROR` (Error 10).

#### I18n Multi-lingual Engine
Utilizes `i18n-js` strictly bound to the `settingsStore`. Core translations reside in `src/i18n/locales/` (`en.json`, `hi.json`, `mr.json`, etc.), making the app fully open-source translation ready (via Weblate/Crowdin).

---

## 6. Build & Android Configuration (Critical)
The current production baseline is:
- Java 17 (CI)
- Gradle 8.0.1
- Android Gradle Plugin 7.4.2
- Android compile/target SDK 34

Important:
- Do not assume old local-only tweaks are canonical; prefer `docs/TECHNICAL_ENV_GUIDE.md` as source of truth.
- Build/signing secrets are validated in CI before Gradle release tasks run.

**Build Command**:
```powershell
cd android
.\gradlew assembleRelease
```

---

## 7. Current State & User Guide
### Implemented
- **Home Screen**: Full note list with search, tag filtering, and tactile pills.
- **Editor**: Full creation and editing flow with title/body/tags and formatting toolbar.
- **Building**: Successfully builds production-ready APKs.

### How to use
1. **Search**: Use the top pill-shaped search bar to filter notes by title or content.
2. **Filter**: Horizontal tag rail allows filtering by category (विचार, कविता, etc.).
3. **Create**: Tap the large floating terracotta button (FAB) at the bottom.
4. **Edit**: Tap any note card to open it; changes are autosaved (or saved on 'Done').

---

## 8. Development Guidelines (For Agents)
- **Tokens Only**: Never use hardcoded colors. Always import `T` from `src/tokens.ts`.
- **Tactile State**: When adding buttons, ensure they follow the `onPressIn` / `onPressOut` animation pattern defined in the design system.
- **Bilingual**: Use strings from `src/i18n/strings.ts` to maintain the English-Hindi balance.
- **Database**: When modifying the data model, update both `src/db/schema.ts` and the `notesStore.ts`.

---
*Generated: 2026-03-08 | Version 2.16.4 (Production Ready & Polished)*
