# Production Handover - 2026-03-12

## 1) Purpose
This handover captures the focused UX pass completed on 2026-03-12:
- Spark AI loading clarity and interaction safety.
- Android single-splash startup baseline.
- Runtime kill-switch support for fast JS rollback.

## 2) What Was Implemented

### A) Spark AI loading clarity
1. Added reusable blocking modal:
   - `src/components/ui/SparkLoadingModal.tsx`
2. Added generation phases:
   - `idle`, `preparing`, `generating`, `applying`, `done`, `error`
   - Type in `src/types/spark.ts`
3. Wired phase flow in both editors:
   - `src/app/editor/new.tsx`
   - `src/app/editor/[id].tsx`
4. Added duplicate-tap guards to prevent concurrent generation calls.
5. Added reduced-motion handling in modal animation.

### B) Animation foundation
1. Added shared motion tokens:
   - `src/tokens/motion.ts`
2. Loader animation uses transform/opacity only (GPU-safe properties).

### C) Runtime rollback controls
1. Added runtime flag store:
   - `src/store/runtimeUxFlagsStore.ts`
2. Added remote flag baseline:
   - `runtime-flags.json`
3. Added app config pointer:
   - `app.json` -> `expo.extra.runtimeFlagsUrl`
4. Startup now loads flags non-blocking and refreshes on app active:
   - `src/app/_layout.tsx`

### D) Single splash migration
1. Migrated splash styles to Android SplashScreen pattern:
   - `android/app/src/main/res/values/styles.xml`
2. Removed redundant `values-v31` splash override to keep one authoritative splash style.
3. Updated `MainActivity` to theme-driven startup:
   - `android/app/src/main/java/com/sarallekhan/MainActivity.java`
   - Uses `super.onCreate(null);` only
   - Does not force `setTheme(...)` on launch
   - Does not use `SplashScreenManager` (class unavailable in `expo-splash-screen` 0.20.5).
4. Added required splash attr provider dependency:
   - `android/app/build.gradle` -> `implementation("androidx.core:core-splashscreen:1.0.1")`
5. Kept JS pre-ready fallback plain (non-branded):
   - `src/app/_layout.tsx`

### E) CI runtime modernization (Node 24 readiness)
1. Updated GitHub Actions majors in both workflows:
   - `actions/checkout@v6`
   - `actions/setup-node@v6`
   - `actions/setup-java@v5`
   - `actions/upload-artifact@v7`
2. Enabled Node 24 runtime for JS actions:
   - `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` at job level.

### E) Localization keys
Added editor loading keys across locales:
- `thinking`
- `aiLoadingTitle`
- `aiLoadingPreparing`
- `aiLoadingGenerating`
- `aiLoadingApplying`
- `aiLoadingPleaseWait`
- `aiLoadingError`

Files:
- `src/i18n/locales/en.json`
- `src/i18n/locales/hi.json`
- `src/i18n/locales/bn.json`
- `src/i18n/locales/te.json`
- `src/i18n/locales/mr.json`
- `src/i18n/locales/ta.json`

## 3) Verification Results
1. `npx tsc --noEmit` -> PASS
2. `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` -> PASS
3. `npx expo-doctor` -> 14/15 PASS (known non-CNG warning remains)
4. `cd android && .\\gradlew.bat :shopify_flash-list:compileDebugKotlin --no-daemon --console=plain` -> PASS
5. `cd android && .\\gradlew.bat :shopify_flash-list:compileReleaseKotlin --no-daemon --console=plain` -> PASS (with local release-signing env placeholders)
6. `cd android && .\\gradlew.bat :app:processReleaseResources --no-daemon --console=plain` -> PASS on Java 17 after adding `androidx.core:core-splashscreen`
7. Local verification used temporary local `android/app/google-services.json` only for build checks; file was removed after verification.

## 4) Rollback Model
1. JS UX rollback (instant, no new binary):
   - Set runtime flags to false in remote JSON:
     - `spark_loading_modal_v1=false`
     - `spark_loading_animation_v1=false`
2. Native splash rollback (requires hotfix binary):
   - Revert splash migration commit, or restore splash files from last stable commit.

Detailed runbook:
- `docs/UX-ANIMATION-ROLLBACK-RUNBOOK.md`

## 5) Known Non-Blocking Risks
1. New loading copy defaults to English in some locales until translation pass.
2. Local release-resource checks still require Java 17, local signing env placeholders, and a local google-services file.

## 6) Required Context for Next Developer/Agent
Before making further release-facing changes:
1. Read `docs/TECHNICAL_ENV_GUIDE.md`.
2. Read `docs/UX-ANIMATION-ROLLBACK-RUNBOOK.md`.
3. Keep `runtime-flags.json` and app config URL synchronized.
4. Validate with Java 17 for Android release checks.
