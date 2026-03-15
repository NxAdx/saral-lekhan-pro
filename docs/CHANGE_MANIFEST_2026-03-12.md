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
   - temporarily removed forced `setTheme(...)` from `MainActivity` (later reverted in crash hotfix)
   - kept launch fully theme-driven (`Theme.App.SplashScreen` + `postSplashScreenTheme`)

## Emergency Crash Hotfix (2026-03-13, v2.16.6)
1. Symptom:
   - App crashed right after splash on some devices.
2. Root cause:
   - `MainActivity` no longer switched to `AppTheme` before `ReactActivity` startup.
3. Fix:
   - restored `setTheme(R.style.AppTheme);` before `super.onCreate(null);`.
4. Release metadata sync:
   - `package.json` -> `2.16.6`
   - `app.json` -> `2.16.6`, `versionCode 59`
   - `android/app/build.gradle` -> `versionName 2.16.6`, `versionCode 59`

## Dual-Splash Continuity Fix (2026-03-13, v2.16.7)
1. Symptom:
   - Startup no longer crashed, but users still saw split launch phases.
2. Fix:
   - changed `AppTheme android:windowBackground` to `@drawable/splashscreen`
   - updated `android/app/src/main/res/drawable/splashscreen.xml` to include centered `@drawable/splashscreen_image` over splash background.
3. Release metadata sync:
   - `package.json` -> `2.16.7`
   - `app.json` -> `2.16.7`, `versionCode 60`
   - `android/app/build.gradle` -> `versionName 2.16.7`, `versionCode 60`

## Launch and Editor Stabilization (2026-03-14, v2.16.8)
1. User-facing regressions addressed:
   - fixed duplicated home title styling for `Saral लेखन`
   - reduced editor toolbar friction and improved checklist spacing
   - normalized editor-picked images so local URIs do not break after reload
   - corrected Android splash handoff to remove the extra branded phase and blank gap
   - cleaned the Settings `Biometric Vault` card geometry
2. Native/runtime splash corrections:
   - `AppTheme android:windowBackground` reverted to plain `@color/splashscreen_background`
   - `_layout.tsx` now hides splash only after startup is ready and the first root layout is measured
3. Typography corrections:
   - rebalanced supported font scaling
   - forced Devanagari-safe fallback for `Noto Sans` in Hindi/Marathi contexts
4. Release metadata sync:
   - `package.json` -> `2.16.8`
   - `app.json` -> `2.16.8`, `versionCode 61`
   - `android/app/build.gradle` -> `versionName 2.16.8`, `versionCode 61`

## Startup, Editor, and Release Follow-Up (2026-03-14, v2.16.9)
1. Residual issues addressed after device verification:
   - removed the remaining plain JS fallback during splash handoff
   - fixed intermittent editor gallery image failures
   - tightened font scaling consistency in editor and settings pills
   - flattened `Biometric Vault` card geometry
2. Startup correction:
   - `src/app/_layout.tsx` now returns `null` until startup is ready
   - splash hides only from the first real root layout
3. Editor media correction:
   - `expo-image-picker` gallery insert now uses `base64: true`
   - picker Base64 is embedded as `data:image/jpeg;base64,...`
4. Typography correction:
   - editor body CSS now uses `theme.fontSize`
   - `TagPill` now scales from `theme.fontSize`
5. Release/update correction:
   - updater-visible direct installs require a tagged GitHub Release, not only a branch build
6. Release metadata sync:
   - `package.json` -> `2.16.9`
   - `app.json` -> `2.16.9`, `versionCode 62`
   - `android/app/build.gradle` -> `versionName 2.16.9`, `versionCode 62`

## Splash Stack, Home Title, and Editor Toolbar Follow-Up (2026-03-14, v2.16.10)
1. Launch path correction:
   - removed the Android 12 `Theme.SplashScreen` style path that was stacking on top of Expo's own splash overlay
   - restored Expo-style `Theme.App.SplashScreen` with `android:windowBackground="@drawable/splashscreen"`
   - removed the now-unused `androidx.core:core-splashscreen` dependency
   - `MainActivity` now uses plain `super.onCreate(null)`
   - `_layout.tsx` now hides splash after the first settled root layout paint via chained `requestAnimationFrame`
2. Home title lockup:
   - refined `Saral लेखन` mixed-script metrics and baseline alignment
3. Editor toolbar polish:
   - increased toolbar height and button breathing room
   - stopped selected-state pill clipping on Android
4. Editor feature tranche:
   - added divider support
   - added code block support
5. Release metadata sync:
   - `package.json` -> `2.16.10`
   - `app.json` -> `2.16.10`, `versionCode 63`
   - `android/app/build.gradle` -> `versionName 2.16.10`, `versionCode 63`

## Splash, Wordmark, and Toolbar Refinement (2026-03-15, v2.16.11)
1. Splash correction:
   - changed `Theme.App.SplashScreen` to inherit `AppTheme`
   - removed `android:windowBackground` splash color from `AppTheme`
   - `_layout.tsx` now hides splash after startup and root navigation state are both ready
2. Home brand lockup:
   - kept `Saral` on `Poppins-Bold`
   - kept `????` on `Hind-Bold`
   - rendered the title as one nested wordmark to avoid Hindi clipping and baseline drift
3. Editor toolbar correction:
   - restored compact 44dp toolbar height
   - replaced tall selected pills with slimmer underline-style active states
4. Code block UX refinement:
   - added `CODE` label chip and accent rail to `pre` blocks so they read as intentional code surfaces
5. Release metadata sync:
   - `package.json` -> `2.16.11`
   - `app.json` -> `2.16.11`, `versionCode 64`
   - `android/app/build.gradle` -> `versionName 2.16.11`, `versionCode 64`
