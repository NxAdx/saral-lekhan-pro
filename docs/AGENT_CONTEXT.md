# Agent Context & Specialized Skills

This document provides critical context for AI agents working on **Saral Lekhan Plus** regarding newly integrated specialized skills and platform tooling.

## 1) Official Android Skills
The project has been upgraded with official, modular Android skills from `https://github.com/android/skills`. These are located in `.agents/skills/` and registered in `skills-lock.json`.

### Available Skills:
- **`agp-9-upgrade`**: Guidelines for upgrading and troubleshooting Android Gradle Plugin 9.
- **`edge-to-edge`**: Instructions for implementing adaptive system bar support and handling IME insets.
- **`migrate-xml-views-to-jetpack-compose`**: Structured workflow for converting legacy XML layouts to Compose.
- **`navigation-3`**: Implementation patterns for Jetpack Navigation 3.
- **`play-billing-library-version-upgrade`**: Commerce compliance and migration steps.
- **`r8-analyzer`**: Size optimization and Proguard/R8 rule debugging.

### How to use:
When tasked with any of the above (e.g., "migrate this view to Compose"), agents **MUST** use the `view_file` tool on the corresponding `SKILL.md` in `.agents/skills/` before proceeding.

## 2) Android CLI
The **Android CLI** (`android.exe`) is installed and available for terminal-based automation.

- **Location**: `%USERPROFILE%\.android-cli\android.exe` (Added to User PATH)
- **Primary Commands**:
  - `android init`: Refresh agent initialization.
  - `android skills list`: Check status of project skills.
  - `android skills add --all --project=.`: Force-sync skills with the official repository.
  - `android doctor`: Diagnose agent environment issues.

## 3) Skill Management Consistency
All specialized skills are tracked in `skills-lock.json`. Any new skill added to the project must be:
1.  Unpacked into a dedicated folder in `.agents/skills/`.
2.  Hashed (SHA256) and registered in `skills-lock.json` with its source.

---
*This document ensures that any agent joining the project can immediately leverage the enhanced capabilities and follow the established engineering standards.*

## 4) Recent Context
For context regarding recent UI/UX and updater fixes, see [PRODUCTION_HANDOVER_2026-06-12.md](./PRODUCTION_HANDOVER_2026-06-12.md) and [PRODUCTION_HANDOVER_2026-06-27.md](./PRODUCTION_HANDOVER_2026-06-27.md).

## 5) Security & Git Leak Prevention
> [!CAUTION]
> **CRITICAL SECURITY WARNING:** Do not track or push any sensitive information, credentials, or keys to Git.
> The following files and directories must remain strictly offline (local-only) and are explicitly ignored in `.gitignore`:
> - `docs/` (contains internal documentation, developer guides, and environment context)
> - `release.keystore` / `*.keystore` / `*.jks` (production Android signing keys)
> - `google-services.json` (Google/Firebase integration client credentials and API keys)
> - `.env` files and `security/` directory
> - `screenshot(keep me secret)/` (NEVER delete this folder)
>
> If you create any new files containing API keys, private tokens, passwords, or keystores, ensure they are added to `.gitignore` immediately. Never stage them (`git add`) or push them to remote repositories.

## 6) Editor Architecture & Known Quirks
- **Rich Editor Component**: The app uses `react-native-pell-rich-editor` which wraps a native WebView.
- **Scroll & Layout Stability**: Never use `useContainer={true}` combined with `flex: 1` inside a `KeyboardAvoidingView` on Android. It causes hardware acceleration crashes and breaks scrolling. The stable pattern is `useContainer={false}` and manually measuring/setting the editor container height.
- **Keyboard Handling**: Android is configured with `windowSoftInputMode="adjustResize"`. Do not add manual `keyboardHeight` padding to the ScrollView, as this double-counts the keyboard offset. Use `KeyboardAvoidingView` with `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`.
- **Delete Feature**: Deleting a note from `[id].tsx` without a delay causes a "Not Found" UI flicker before the back navigation completes. Wrap the delete call in a timeout after navigating back to prevent this.
- **Updater Status**: The updater module is currently noted as "messy" but is left as-is for now.
