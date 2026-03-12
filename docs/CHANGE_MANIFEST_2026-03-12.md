# Change Manifest - 2026-03-12

## Purpose
Auditable manifest for the focused UX motion pass:
1. Spark AI loading clarity.
2. Single Android splash migration.
3. Runtime rollback controls.
4. Documentation and runbook updates.

## Scope
- Branch: `main`
- Change set type: focused UX + startup reliability hardening

## Source Code Changes

### Runtime UX controls
- `src/store/runtimeUxFlagsStore.ts` (new)
- `runtime-flags.json` (new)
- `app.json`
- `src/app/_layout.tsx`

### Spark AI loading UX
- `src/components/ui/SparkLoadingModal.tsx` (new)
- `src/types/spark.ts` (new)
- `src/tokens/motion.ts` (new)
- `src/app/editor/new.tsx`
- `src/app/editor/[id].tsx`

### Android single splash migration
- `android/app/src/main/res/values/styles.xml`
- `android/app/src/main/java/com/sarallekhan/MainActivity.java`
- `android/app/build.gradle`
- `src/app/_layout.tsx`

### CI workflow modernization (2026-03-13 follow-up)
- `.github/workflows/android-build.yml`
- `.github/workflows/android-test.yml`

### Localization keys
- `src/i18n/locales/en.json`
- `src/i18n/locales/hi.json`
- `src/i18n/locales/bn.json`
- `src/i18n/locales/te.json`
- `src/i18n/locales/mr.json`
- `src/i18n/locales/ta.json`

## Documentation Changes
- `docs/TECHNICAL_ENV_GUIDE.md`
- `docs/AGENT-CAPABILITIES-REGISTRY.md`
- `docs/ERRORS-LOGS.md`
- `docs/UX-ANIMATION-ROLLBACK-RUNBOOK.md` (new)
- `docs/PRODUCTION_HANDOVER_2026-03-12.md` (new)

## Verification Commands Executed
1. `npx tsc --noEmit` -> PASS
2. `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` -> PASS
3. `npx expo-doctor` -> 14/15 PASS (known non-CNG warning only)
4. `cd android && .\\gradlew.bat :shopify_flash-list:compileDebugKotlin --no-daemon --console=plain` -> PASS
5. `cd android && .\\gradlew.bat :shopify_flash-list:compileReleaseKotlin --no-daemon --console=plain` -> PASS (with local release signing env placeholders)
6. `cd android && .\\gradlew.bat :app:processReleaseResources --no-daemon --console=plain` -> PASS on Java 17 after adding `androidx.core:core-splashscreen`
7. Verification note: local `android/app/google-services.json` dummy file was used only for local build verification and removed immediately after validation.

## Risk Notes
1. Local Android release verification requires Java 17 to match CI baseline.
2. Release-resource local checks require release-signing env placeholders and a local google-services file; CI already injects real secrets.
3. Native splash rollback requires hotfix build; JS loading rollback is remote via runtime flags.

## Post-Merge Hotfix (2026-03-12)
After commit `1786605`, CI failed in `:app:compileReleaseJavaWithJavac` with:
- `cannot find symbol: class SplashScreenManager`
- `cannot find symbol: SplashScreenManager.registerOnActivity(this)`

### Hotfix applied
1. Updated `android/app/src/main/java/com/sarallekhan/MainActivity.java`:
   - removed `import expo.modules.splashscreen.SplashScreenManager`
   - removed `SplashScreenManager.registerOnActivity(this)`
   - restored compile-safe SDK 49 startup.
2. Updated documentation baseline in:
   - `docs/TECHNICAL_ENV_GUIDE.md`
   - `docs/AGENT-CAPABILITIES-REGISTRY.md`
   - `docs/PRODUCTION_HANDOVER_2026-03-12.md`
   - `docs/ERRORS-LOGS.md`

## Follow-Up Hardening (2026-03-13)
1. Removed Node 20 action-runtime deprecation warning by upgrading workflow actions:
   - `actions/checkout@v6`
   - `actions/setup-node@v6`
   - `actions/setup-java@v5`
   - `actions/upload-artifact@v7`
2. Enabled Node 24 JS-action runtime explicitly:
   - `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`
3. Finalized splash transition baseline to reduce dual-phase effect:
   - removed redundant `android/app/src/main/res/values-v31/styles.xml`
   - removed forced `setTheme(...)` from `MainActivity`
   - kept launch fully theme-driven (`Theme.App.SplashScreen` + `postSplashScreenTheme`)
