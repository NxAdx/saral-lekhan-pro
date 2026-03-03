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

## Phase 15: Deep Root Edge Cases (Auth & Flashes)
- [x] Eradicate Cold Boot White Flash via `styles.xml` CI patch
- [x] Eradicate React Navigation white transition flashes via Theme injection
- [x] Wrap `_layout.tsx` in `View` + `onLayoutRootView` to mask React startup frame
- [ ] Final verification: Diagnose and eliminate the persisting `DEVELOPER_ERROR` (requires updated `GOOGLE_SERVICES_JSON` GitHub Secret)

## Phase 16: In-App Updater
- [x] Create `src/utils/githubUpdater.ts` (GitHub Releases API + APK download + intent launcher)
- [x] Add silent update check on Home Screen launch (`index.tsx`)
- [x] Add "Check for Updates" BentoCard UI in Settings
- [x] Configure CI pipeline to attach APK to GitHub Releases on tag push
- [x] Downgrade `expo-intent-launcher` to ~10.7.0 for SDK 49 compatibility
- [x] Version bumped to `2.9.4` (versionCode 35)

In progress:
- User verification of v2.9.4 APK features

Next actions (Future Roadmap):
1. Prepare Google Play Store submission assets.
2. Monitor user feedback on Devanagari font rendering (Noto Sans vs Hind vs Mukta).
3. Connect Weblate/Crowdin to open-source the `src/i18n/locales/*.json` files for community translation.
