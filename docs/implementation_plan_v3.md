# Saral Lekhan Plus 3.0 Release Plan

This document outlines the strategic product direction and technical architecture for the `v3.0` upgrade, focusing on user privacy, performance, enhanced AI interactions, and ensuring Google Play Store compliance for March 2026.

## 1. Complete Pivot to Local-First Backups
**Objective**: Remove the complex Google Drive backup logic (which causes friction and OAuth errors) and replace it with a secure, offline-first local export/import system.

### [DELETE] `src/services/googleDriveService.ts`
- Completely remove the Google Drive integration.
- Remove `@react-native-google-signin/google-signin` from `package.json` to significantly reduce the app's bundle size.

### [MODIFY] `src/app/(main)/settings.tsx`
- Remove the "Cloud & Intelligence - Google Sync" sections.
- Introduce **Local Backup Vault**:
  - **Export Backup**: Utilize `expo-file-system` to copy the local `saral_lekhan.db` and use `expo-sharing` so the user can save the `.db` or [.json](file:///d:/Development/Production/saral-lekhan-plus/src/i18n/locales/hi.json) file to their device's Downloads folder or any local directory.
  - **Import Backup**: Utilize `expo-document-picker` to allow users to select a previously exported database file and safely restore/overwrite the current app state.

## 2. Spark AI UX Enhancements
**Objective**: Make Spark AI feel more native and accessible instead of being buried in a bottom bar menu.

### [MODIFY] `src/app/editor/[id].tsx` & `src/app/editor/new.tsx`
- **Inline Contextual AI**: Instead of a generic bottom-bar button, integrate a "Magic Wand" (`✨`) button directly into the `RichToolbar`.
- **Selected Text Operations**: When the user highlights text in the editor, pop up a small floating menu (similar to iOS native text selection) specifically for AI: "Summarize this", "Rewrite this", "Expand this".
- **One-Tap Generation**: Surface the most used feature (e.g. "Smart Title") as a prominent button at the top of an empty document to eliminate "blank page anxiety".

## 3. Text Size UX Overhaul
**Objective**: Make resizing text fluid and immediate.

### [MODIFY] `src/app/(main)/settings.tsx` & `src/app/editor/[id].tsx`
- **Pinch-to-Zoom**: Implement an intuitive pinch-to-zoom gesture utilizing `react-native-gesture-handler` wrapping the `RichEditor` to seamlessly adjust the text size.
- **Floating Controls**: Deprecate the complex modal step-picker in Settings. Instead, when the user taps an "Aa" icon in the editor toolbar, show a localized floating slider that adjusts the text size instantly (live preview) without leaving the context of their note.

## 4. App Changelog & Logs Optimization
**Objective**: Reduce memory overhead on the settings/about screen by strictly limiting the log history rendered in-app.

### [MODIFY] `src/app/(main)/settings.tsx` 
- Render **only** `APP_CHANGELOG[0]` (the current version's release notes).
- Add a highly visible button: `"View Full Version History on GitHub"` which uses `Linking.openURL` to redirect the user to the GitHub Releases page.
- This entirely removes the need to render long virtualized lists of historical patches inside the app.

## 5. Lightening the App & Code Optimization
**Objective**: Shrink the APK/bundle size and ensure maximal performance.

- **Dependency Pruning**: Removing Google Sign-In and Google APIs directly sheds native libraries.
- **Dead Code Elimination**: Audit `src/utils` and `src/components/ui` for unused UI components.
- **Asset Compression**: Compress any static PNG/JPG assets to WEBP.
- **Hermes & ProGuard**: Ensure `enableHermes: true` is set, and ProGuard / R8 shrinking is aggressively configured in [android/app/build.gradle](file:///d:/Development/Production/saral-lekhan-plus/android/app/build.gradle) for production builds to strip unused Java/Kotlin code.

---

## 6. Sustainable FOSS Model (Donations & Community)
**Objective**: Build a sustainable application ecosystem without relying on aggressive paywalls or proprietary Google Play Billing modules.

- **100% Free Core**: 
  - Unlimited offline markdown note-taking.
  - Complete SQLite Backup and Restore functionality.
  - All typography and system palettes.
  - Full biometric privacy lock.
  - Spark AI Engine (Bring Your Own Key).

*Alternative Monetization*: Instead of Google Play Billing or RevenueCat SDKs, the app now successfully relies on purely voluntary support channels:
- Integrated **UPI / Check-out Links** natively in the Settings screen.
- Integrated **Ko-fi** sponsorship links natively in the Settings screen.
- This creates zero privacy overhead or API dependence.

---

## 7. App Store & F-Droid Policy Compliance
To ensure smooth sailing through strict FOSS guidelines (e.g., F-Droid) and standard Android OS limitations:

1. **Proprietary Software Deprecation**: 
   - Entirely scrubbed `@react-native-google-signin/google-signin` and any background Firebase logic. F-Droid mandates that applications cannot link or use proprietary Google Play Services.
2. **Offline Data Custody**: 
   - By pivoting from Google Drive to local `expo-document-picker` vaults, the app now perfectly aligns with F-Droid's "No Network Necessary" anti-features philosophy.
3. **Permissions Audit**: 
   - Local backups on modern Android (Android 11+) no longer use `READ_EXTERNAL_STORAGE`. Using the Android Storage Access Framework (SAF) cleanly avoids overly broad permissions.
---

## 8. Comprehensive UI/UX Improvements & Polish
**Objective**: Elevate the app's visual language from "functional" to "premium and delightful", emphasizing fluidity and modern aesthetics.

- **Micro-Interactions**: Add subtle haptic feedback (`expo-haptics`) when tapping important actions (Spark AI generate, Save Note, deleting an item).
- **Smooth Transitions**: Ensure all modals (Settings, Spark AI, Markdown Preview) use bottom-sheet spring animations (`react-native-reanimated` or `BottomSheet`) rather than abrupt pop-ins, creating a smoother native feel.
- **Empty States Polish**: 
  - Enhance the empty states (e.g., "No notes found", "Trash is empty") with elegant, custom SVG illustrations and improved typography.
  - Implement a skeleton loader (shimmer effect) when notes are loading rather than a static spinner.
- **Typography & Hierarchy Refinement**:
  - Unify the application's font stack to ensure headers, subheaders, and body texts scale beautifully.
  - Fix any lingering padding/margin inconsistencies across devices (especially handling SafeAreaView around notches and Android gesture bars).
- **Dark Mode Purity**: Refine the dark mode by ensuring the background uses true black (`#000000`) for OLED displays where appropriate, increasing contrast and saving battery while providing a premium aesthetic.

---

## 9. Direct In-App Updater (GitHub Lane vs F-Droid Lane)
**Objective**: Maintain an untethered, open-source distribution model.

- **GitHub Release Lane (`updaterMode: 'github'`)**: The app pings its own repository releases API and uses intent launchers to auto-download and install its own APK updates smoothly.
- **F-Droid Lane (`updaterMode: 'fdroid'`)**: The internal updater is cleanly bypassed. F-Droid acts as the single source of truth for repository scanning, verifying reproducible builds, and delivering verified APK updates natively to users.
