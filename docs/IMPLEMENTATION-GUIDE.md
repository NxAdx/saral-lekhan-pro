Implementation Guide — run, develop, and continue work

Repository root: this folder contains `package.json`, `src/` and `docs/`.

Quick start (use the 8.3 short path if Windows PowerShell has trouble with Unicode folder names):

```powershell
cd d:\Development\Production\B2C6~1
npm install --legacy-peer-deps
npx expo start
# If port 8081 is in use, run instead:
npx expo start --port 8082
```

Notes about commands used during setup
- We used `npm install --legacy-peer-deps` to workaround peer dependency resolution issues while matching Expo SDK packages.
- If `expo start` suggests running `npx expo install --fix`, do that to align package versions with the chosen Expo SDK.

Development workflow
- Use `src/app` with Expo Router. Edit `src/app/(main)/index.tsx` for the Home feed.
- Components live under `src/components/ui` and tokens in `src/tokens.ts`.
- Stores are in `src/store` (Zustand). DB schema in `src/db/schema.ts`.

Device testing
- Use Expo Go (matching SDK version) on Android or iOS to load the app.
- If your device is connected via ADB and you want to use the emulator / direct run:

```bash
adb reverse tcp:8081 tcp:8081
npx expo run:android   # note: this may create a native project and require additional native deps
```

Notes about path / encoding issues
- PowerShell and some tools behaved oddly with the directory name `सरल लेखन`.
- We successfully used the 8.3 short path (e.g., `d:\Development\Production\B2C6~1`) to run commands and install packages.
- To avoid future issues, prefer an ASCII path like `d:\Development\Production\saral-lekhan` for builds.

TypeScript
- `tsconfig.json` was created and Expo updated it automatically. Dev dependencies include `typescript` and `@types/*`.
- Run `npx tsc --noEmit` after installing dev deps to validate types.

Testing & CI recommendations
- Unit tests: Jest + React Native Testing Library for components and stores.
- E2E: Detox or Appium for flows (create/edit note, tag filter, autosave, settings).
- CI: run `npm run lint`, `npx tsc --noEmit`, `npm test`, and build checks on pull requests.

Next dev tasks (short)
- App is feature complete up to Phase 14 (Cloud Sync, I18n, AI, Biometrics, Premium Themes).
- Maintenance only: Weblate translation synchronization.

Done: `NoteList` (Home) is wired to `notesStore` with tag filter, search, FAB → new note, and edit via `/editor/[id]`. Components: `TagPill`, `FAB`; store has `getNotesFilteredByTag`, `getUniqueTags`, `updateNote`, `deleteNote`.

Google Sign-In & Native Builds
- The app uses `@react-native-google-signin/google-signin` for authentication.
- **This native library will crash in Expo Go.** You MUST build a standalone APK or Development Build to test it.
- **Local Building (Recommended)**: Follow [BUILD_OFFLINE.md](./BUILD_OFFLINE.md) to generate a production APK locally using JDK 20 + Java 17 compatibility.
- **EAS Cloud Builds**: If you have an Expo account and want to build in the cloud:
```bash
npx eas-cli build -p android --profile production
```
- **Drive REST API**: Ensure you use the **Web Application Client ID** in `webClientId` for REST access.

## Telemetry & Production Monitoring
- **Crash Reporting (Sentry)**: For production online builds, you must integrate `@sentry/react-native`. Sentry provides stack traces that map back to your TypeScript code rather than obfuscated Java errors.
  1. `npx expo install @sentry/react-native`
  2. Map your DSN in `app.json` under the `plugins` array.
- **Over-The-Air (OTA) Updates**: The `updates` key has been added to `app.json`. To push a hotfix without a new Play Store release, run `eas update --branch production`.
