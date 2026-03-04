# Master Project Documentation: सरल लेखन (Saral Lekhan)

> **Important for AI Agents**: This document provides the complete context, architecture, design philosophy, and technical implementation details of the Saral Lekhan app. Read this first to understand the project deeply.

> **Hotfix Addendum (2026-03-04)**:
> - Release signing now uses dedicated release keystore inputs in `android/app/build.gradle` (no debug-signing fallback for production artifacts).
> - Production GitHub workflow now validates `GOOGLE_SERVICES_JSON` and no longer runs `expo prebuild --clean`.
> - Startup background is unified to `#171513` across Expo splash and Android native resources to reduce cold-boot white flash.
> - Updater version logic and Settings updater UI were refined (semantic comparison + green visual polish).

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
├── android/            # Native Android project (configured for Java 20/Gradle 8)
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

### Saral Lekhan Plus Features

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
The project is configured to build on modern systems (Java 20 / Gradle 8.9) while maintaining compatibility with Expo SDK 49.
- **BuildConfig**: Explicitly enabled in `android/app/build.gradle` and `android/gradle.properties`.
- **Kotlin Integration**: Set to `1.9.0` to support newer JDKs.
- **Gradle Patching**: `node_modules/@react-native/gradle-plugin` was patched (via previous agent actions) to fix `serviceOf<ModuleRegistry>` errors common in Gradle 8+.

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
*Generated: 2026-03-02 | Version 2.9.3 (Audited & Hardened)*
