Important errors, logs and resolutions encountered during setup

1) Python docx read error (initial)
- Symptom: `docx.opc.exceptions.PackageNotFoundError: Package not found at 'd:\Development\Production\सरल लखन\tippani-design-system-documentation.docx'` when attempting to open docx via Python.
- Cause: Unicode path handling differences and initial incorrect path variant.
- Resolution: used `glob.glob('d:/Development/Production/*')` to discover the folder and then read the docx; installed `python-docx` package to extract text.

2) npm ERESOLVE / peer dependency conflicts
- Symptom: `npm ERR! ERESOLVE unable to resolve dependency tree` referencing `react` and `react-native` peer mismatches.
- Cause: package versions did not match Expo SDK expectations (react 18.3.0 vs required 18.2.0 for RN 0.72.x, etc.).
- Resolution: updated `package.json` to align versions (set `react` to 18.2.0), moved TypeScript and @types to devDependencies, and installed with `--legacy-peer-deps`. Also invoked `npx expo install --fix` suggestion when appropriate.

3) `expo start` / Expo Go SDK mismatch
- Symptom: Expo Go reported "Project is incompatible with this version of Expo Go" (device had SDK 54 while project used SDK 49).
- Cause: installed Expo Go app on device did not match project SDK.
- Resolution: installed the Expo Go build that matches SDK 49, or alternatively upgrade project to SDK 54 via `npx expo upgrade`.

4) Metro port conflict and change
- Symptom: `Port 8081 is being used by another process`.
- Cause: another process (previous Metro or other service) bound to 8081.
- Resolution: accepted Expo prompt to use port 8082; Metro started on 8082.

5) Bundling error: "Helpers are not supported by the default hub"
- Symptom: Android bundling failed with `node_modules\expo\AppEntry.js` or `node_modules\expo-router\_app.tsx` / `renderRootComponent.tsx: Helpers are not supported by the default hub.`
- Cause: Babel’s default Hub is used when transforming some files (e.g. in node_modules or when path/encoding triggers a different pipeline). The default Hub does not support `addHelper()`, so the transform throws.
- Resolution / Workarounds (try in order):
  - Set `"main": "expo-router/entry"` in `package.json` so Metro uses Expo Router’s entry instead of `expo/AppEntry.js`.
  - Add a root `babel.config.js` with `presets: ['babel-preset-expo']` and `plugins: ['react-native-reanimated/plugin']`.
  - Add a root `metro.config.js`: `const { getDefaultConfig } = require('expo/metro-config'); module.exports = getDefaultConfig(__dirname);`
  - Add `@babel/runtime` to dependencies and run `npm install --legacy-peer-deps`, then `npx expo start --clear`.
  - **Most reliable:** Copy the project to an **ASCII-only path** (e.g. `d:\Development\Production\saral-lekhan`), delete `node_modules` and `package-lock.json`, run `npm install --legacy-peer-deps`, then `npx expo start --clear`. Unicode in the folder path can cause Metro/Babel to use a code path that triggers this error.

6) `npx expo run:android` failing during prebuild
- Symptom: the run command attempted to create native project files and failed during `npm install` (non-zero exit code).
- Cause: native prebuild attempted to install packages and native toolchain mismatches / dependency issues.
- Resolution: for development we used Expo Go to iterate faster; to run `expo run:android` successfully, ensure native environment (Android SDK, JDK) is installed and package.json versions match Expo's recommendations; run `npx expo prebuild` manually to observe errors.

Notes
- Most problems encountered were package-version mismatches and Windows path encoding edge cases. These are documented above and in `IMPLEMENTATION-GUIDE.md` with recommended commands.

7) Google Auth `400: invalid_request`
- Symptom: Expo AuthSession throws a 400 error when trying to log in with Google on an Android build.
- Cause: Google's security policy blocks web-based OAuth flows from redirecting back to mobile apps on Android.
- Resolution: Migrated from `expo-auth-session` to `@react-native-google-signin/google-signin` to trigger the native Android account picker overlay instead of a web browser. Note: this library only works in standalone APK/AAB builds, NOT Expo Go.

8) Google Sign-in `DEVELOPER_ERROR` (Error 10)
- Symptom: React Native Google Sign-in crashes instantly on button press.
- Cause: OAuth config mismatch. The most critical cause was release APKs being signed with debug keystore, producing SHA fingerprints that do not match Firebase OAuth for production.
- Resolution: Keep `webClientId` set to a valid OAuth Web Client, sign release builds with release keystore credentials (`MYAPP_UPLOAD_*`), and ensure Firebase fingerprints include the release signing SHA values.

9) Google Drive API `401 Unauthorized`
- Symptom: Google login succeeds, but `fetch()` requests to `googleapis.com/drive` return 401 Unauthenticated.
- Cause: Google refuses to grant REST API access tokens to pure Android identity tokens. 
- Resolution: Generated a separate "Web application" OAuth Client ID in the exact same Google Cloud project, and passed *that* ID into the `webClientId` parameter of `GoogleSignin.configure()`. This bridges the native Android login with REST web permissions.

10) React Native WebView image loading failures
- Symptom: Inserted gallery images from `ImagePicker` do not render in the `RichEditor` WebView.
- Cause: Webview permission and security constraints on local `file://` URIs picked from the gallery.
- Resolution: Converted picked image URIs to Base64 data URIs (`data:image/...;base64,...`) using `expo-file-system` before insertion.

11) Note Editor Crashes on Concurrent Re-entry
61: 11) Note Editor Crashes on Concurrent Re-entry
62: - Symptom: App crashes or hangs when opening the same note multiple times or navigating quickly.
63: - Cause: Race conditions in script injection and layout thrashing while re-using the `RichEditor` instance.
64: - Resolution: Assigned a unique `key` to the `RichEditor` to force a clean re-mount on re-entry, disabled `useContainer` to prevent nested scroll conflicts, and implemented mount guards (`isMounted` ref) for all `injectJavascript` and state updates.
65: 
12) App Compilation throws Unsupported class file major version 64
- Symptom: `D8: java.lang.IllegalArgumentException: Unsupported class file major version 64`
- Cause: Java 20 compiles class files with major version 64. However, the legacy Android Jetifier tool (responsible for migrating older support libraries to AndroidX) crashes when it encounters bytecode newer than Java 11.
- Resolution: Added `android.enableJetifier=false` to `gradle.properties`. Since modern React Native libraries (0.60+) are already AndroidX compatible, Jetifier is no longer strictly needed and bypassing it immediately fixes the Java 20 compilation crash.

13) Gradle Timeout waiting to lock Artifact transforms cache
- Symptom: `Timeout waiting to lock Artifact transforms cache (transforms-3). It is currently in use by another Gradle instance.`
- Cause: A previous Gradle compilation daemon crashed or was abandoned, leaving a file system lock actively held on the `.gradle/caches/transforms-3` directory.
- Resolution: Terminated all hanging Java daemons globally using `taskkill /F /IM java.exe /T` and explicitly deleted the `transforms-3.lock` file via terminal. Initiating the next build with the `--no-daemon` flag prevents future lockups on memory-constrained systems.

14) React Native CLI Empty Project Detection (project:[:])
- Symptom: `npx react-native config` returns `project: {}` or an error, leading to `native_modules.gradle` crashing with `Cannot get property 'packageName' on null object`.
- Cause: React Native CLI v11.3.10 and earlier can fail to auto-detect the Android project structure in Expo-managed "prebuild" environments, or when the `namespace` is defined in `build.gradle` but the `package` attribute is missing from `AndroidManifest.xml`.
- Resolution: 
  - Patched `node_modules/@react-native-community/cli-platform-android/native_modules.gradle` to include a null-project fallback: `if (project == null) { project = [packageName: "com.sarallekhan", sourceDir: "./android"] }`.
  - Added `package="com.sarallekhan"` back to the `<manifest>` tag in `android/app/src/main/AndroidManifest.xml`.

15) Missing Expo Modules on App Classpath
- Symptom: `package expo.modules does not exist` or `cannot find symbol: ApplicationLifecycleDispatcher` during Java compilation.
- Cause: The `android/app/build.gradle` was missing the Expo autolinking dependency registration calls.
- Resolution: Added the following to the end of `android/app/build.gradle`:
  ```groovy
  apply from: new File(["node", "--print", "require.resolve('expo/package.json')"].execute(null, rootDir).text.trim(), "../scripts/autolinking.gradle")
  addExpoModulesDependencies(dependencies, project)
  generateExpoModulesPackageList()
  ```

16) Missing Splash Screen Background Color
- Symptom: `AAPT: error: resource color/splashscreen_background not found`.
- Cause: The `splashscreen.xml` drawable references `@color/splashscreen_background`, but the `colors.xml` resource file was overwritten or missing that entry.
- Resolution: Manually added `<color name="splashscreen_background">#171513</color>` to `android/app/src/main/res/values/colors.xml` and mirrored the same value in `values-night/colors.xml`.

17) Release Build Signed with Debug Keystore
- Symptom: Google login fails with Error 10 in production despite correct package name and seemingly correct `google-services.json`.
- Cause: `android/app/build.gradle` had `release { signingConfig signingConfigs.debug }`, so production APK used debug SHA fingerprints.
- Resolution: Added explicit release signing config wired to `MYAPP_UPLOAD_STORE_FILE`, `MYAPP_UPLOAD_STORE_PASSWORD`, `MYAPP_UPLOAD_KEY_ALIAS`, and `MYAPP_UPLOAD_KEY_PASSWORD`.

18) CI Native Files Overwritten by Clean Prebuild
- Symptom: CI repeatedly required runtime `sed` patches and produced unstable auth/build behavior across releases.
- Cause: Workflow used `npx expo prebuild --platform android --clean`, which regenerated `android/` and discarded committed native fixes.
- Resolution: Removed clean prebuild from production workflow and validated `GOOGLE_SERVICES_JSON` before build.

19) Fresh Startup White Screen (~1 second)
- Symptom: On cold launch, app shows a brief white frame before themed UI renders.
- Cause: Startup backgrounds were not unified between Expo splash config, Android `AppTheme`, and light/night native color resources.
- Resolution: Forced `#171513` across `app.json` splash, Android `values` + `values-night`, `AppTheme android:windowBackground`, and early `SystemUI.setBackgroundColorAsync()` call.

20) "Login Failed: Google Sign-In config mismatch for package com.sarallekhan"
- Symptom: Settings -> Google Drive Sync -> "Sign in with Google" shows a modal saying config mismatch and asks for SHA-1/SHA-256 registration.
- Cause: Installed APK is signed with a certificate that is not registered in Firebase for Android app `com.sarallekhan` (usually debug-vs-release key mismatch, or old `google-services.json`).
- Resolution:
  1. Extract SHA-1 and SHA-256 from the keystore that signed the installed APK.
  2. Add both fingerprints in Firebase -> Project Settings -> Android app `com.sarallekhan`.
  3. Download a fresh `google-services.json` and update local file + CI secret.
  4. Remove old OAuth grant from Google Account -> Security -> Third-party access.
  5. Reinstall APK and sign in again.

21) GitHub Release publish failed with 403 (`Resource not accessible by integration`)
- Symptom: Build succeeds and APK/AAB artifacts upload, but `softprops/action-gh-release` fails. In-app updater appears stale because no new GitHub release is published.
- Cause: Token used by workflow had read-only repository contents permission at runtime (`Contents: read`).
- Resolution:
  1. In repository settings, open `Settings -> Actions -> General`.
  2. Set `Workflow permissions` to `Read and write permissions`.
  3. Keep workflow-level `permissions: contents: write` in `.github/workflows/android-build.yml`.
  4. Re-run tag workflow so release is created.

22) Startup loading screen loop after splash customization
- Symptom: App remains stuck on `Loading Saral Lekhan...` spinner.
- Cause: Splash-hide and startup-ready state were gated incorrectly during root bootstrap.
- Resolution: Keep native splash visible until initialization completes, and use the stable startup layout baseline (`d3057e4` + `d8912b6`). Avoid introducing persistent JS loading overlays as a replacement for transition flash.

23) OAuth consent shows `project-871132329368` instead of app name
- Symptom: Google consent page shows project numeric label instead of `Saral Lekhan Plus` branding.
- Cause: Branding/audience publication not fully propagated or configured in a different project.
- Resolution:
  1. In Google Cloud, confirm selected project is `871132329368`.
  2. Configure `Google Auth Platform -> Branding` with app name and support/developer emails.
  3. Set Audience to External and publish app to Production (if applicable).
  4. Remove old third-party access grant from Google Account, then sign in again.

24) Google Sign-In config mismatch persists even when SHA-1 seems correct
- Symptom: Modal still says `Google Sign-In config mismatch for package com.sarallekhan`.
- Cause: Commonly one of:
  - Installed APK signed by a different key than expected (debug/release/Play signing mismatch).
  - Updated fingerprints were not followed by a refreshed `google-services.json` in CI secret.
  - Cached OAuth grant/session from old config.
- Resolution:
  1. Register SHA-1 and SHA-256 for every signing path you use (release, debug, and Play App Signing if distributed through Play).
  2. Download fresh `google-services.json` and update local file + `GOOGLE_SERVICES_JSON` secret.
  3. Uninstall app, remove old Google third-party access grant, reinstall latest signed APK, sign in again.

25) Hidden keystore vs google-services mismatch in CI
- Symptom: Firebase appears to have correct fingerprints, but release APK still throws `DEVELOPER_ERROR` on some devices.
- Cause: CI secret `GOOGLE_SERVICES_JSON` can become stale and not match the exact keystore that signed the artifact, even when local files look correct.
- Resolution:
  1. CI now validates `APP_PACKAGE` and `WEB_CLIENT_ID` from `src/services/googleDriveService.ts` against injected `GOOGLE_SERVICES_JSON`.
  2. CI now compares normalized release keystore SHA-1 to Android OAuth `certificate_hash` in injected `google-services.json`.
  3. Build fails early if mismatch is detected, preventing broken auth artifacts from being published.

26) In-app updater still stuck at 100% after v2.10.1
- Symptom: Download reaches 100%, but installer prompt does not appear and button can remain in downloading state.
- Cause:
  1. `REQUEST_INSTALL_PACKAGES` existed in `app.json` but was missing in committed native `android/app/src/main/AndroidManifest.xml`.
  2. Settings updater UI did not always clear `isDownloadingUpdate` after successful installer intent dispatch.
- Resolution:
  1. Added `<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES"/>` to committed native manifest.
  2. Updated updater action to always reset download state in `finally`.
  3. Added success guidance modal (`Installer Started`) when installer is dispatched.

27) Google Sign-In `DEVELOPER_ERROR` still shown on some builds despite correct updater flow
- Symptom: Login modal shows config mismatch even after updater/install flow is fixed.
- Cause: In some environments the strict `webClientId` path can fail while Android native oauth config from `google-services.json` is valid.
- Resolution:
  1. Added auth resilience fallback in `src/services/googleDriveService.ts`.
  2. On `DEVELOPER_ERROR`, app now retries sign-in once using Android default config (`offlineAccess: false`, no forced web client id).
  3. Strict config is restored after retry for normal operation.

28) Two-stage splash color mismatch + adaptive icon appears without expected background
- Symptom:
  1. First splash frame appears dark/black, then second splash frame appears with intended light color (`#d9d7d2`).
  2. Launcher/adaptive icon can still look dark on some devices.
- Cause:
  1. Native Android color resources were still carrying legacy dark values (`#171513`) in `values`/`values-night`.
  2. Android 12+ system splash attributes were not explicitly aligned under `values-v31`.
  3. Fallback launcher PNG icons (`ic_launcher.png`, `ic_launcher_round.png`) were baked with older dark background values, so some launchers/caches kept showing dark icon surfaces.
- Resolution:
  1. Updated `android/app/src/main/res/values/colors.xml` to set:
     - `splashscreen_background = #d9d7d2`
     - `iconBackground = #d9d7d2`
     - `colorPrimaryDark = #d9d7d2`
  2. Updated `android/app/src/main/res/values-night/colors.xml` with same light values and added missing `splashscreen_background` + `iconBackground`.
  3. Updated `android/app/src/main/res/values/styles.xml` to enforce:
     - `<item name="android:windowBackground">@color/splashscreen_background</item>`
  4. Added `android/app/src/main/res/values-v31/styles.xml` with Android 12+ splash settings:
     - `android:windowSplashScreenBackground`
     - `android:windowSplashScreenAnimatedIcon`
     - `android:windowSplashScreenIconBackgroundColor`
     - `postSplashScreenTheme`
  5. Regenerated fallback launcher icons in all `mipmap-*` folders using `#d9d7d2` background.
  6. Verification runbook:
     - Uninstall app (to clear launcher cache)
     - Install fresh APK
     - Cold-launch and verify splash continuity + icon background consistency.

29) CI release build failed after splash hotfix (`:app:bundleReleaseResources`)
- Symptom:
  1. GitHub Actions release build failed in AAPT2 resource linking.
  2. Error: `style attribute 'attr/postSplashScreenTheme ...' not found`.
- Cause:
  1. `android/app/src/main/res/values-v31/styles.xml` included `<item name="postSplashScreenTheme">`.
  2. Current project stack (Expo SDK 49 / AGP 7.4.2 / Gradle 8.0.1) does not expose that attr in this configuration.
- Resolution:
  1. Removed `postSplashScreenTheme` from `values-v31/styles.xml`.
  2. Kept API 31 splash attributes limited to platform-safe entries:
     - `android:windowSplashScreenBackground`
     - `android:windowSplashScreenAnimatedIcon`
     - `android:windowSplashScreenIconBackgroundColor`
     - `android:windowBackground`
  3. Updated `docs/TECHNICAL_ENV_GUIDE.md` with accurate CI baseline (Java 17, Gradle 8.0.1, AGP 7.4.2) and this constraint.

30) Two visually different splash screens (system + in-app) on cold launch
- Symptom:
  1. Users see two consecutive splash-like frames with different logo scale.
  2. First frame is Android system splash, second frame is JS loading UI with its own logo.
- Cause:
  1. Native splash was retained while app initialized, but root layout also rendered a branded loading screen.
  2. Android 12 splash icon scale is system-governed, while JS logo size was manually fixed (`180dp`), causing a visual mismatch.
- Resolution:
  1. Converted startup to a single branded splash strategy: keep native splash as the only branded splash.
  2. Moved splash hide control to `src/app/_layout.tsx` once `coreReady` is true.
  3. Removed Home-screen splash hide logic and removed JS branded loading logo.
  4. Pre-ready fallback now renders only a plain background (`#d9d7d2`) to avoid a second branded splash.

31) Production hardening pass (2026-03-08)
- Scope:
  1. Remove compile blockers and stale tracked files.
  2. Align version metadata and dependency health checks.
  3. Keep runtime behavior stable (no feature rewrites).
- Changes:
  1. Removed tracked temp/garbage files:
     - `tmp_layout_new.tsx`
     - `window_dump.xml`
     - unused `src/components/ui/NotePill.tsx` (was importing missing `HardShadow`).
  2. Fixed Google Sign-In compatibility in `src/services/googleDriveService.ts`:
     - Added a safe fallback helper for previous-session detection that works across package variants (`hasPreviousSignIn` when available, otherwise `getCurrentUser`).
  3. Aligned release versioning:
     - `android/app/build.gradle` -> `versionCode 57`, `versionName "2.16.4"`.
     - Settings footer now uses `APP_VERSION` instead of hardcoded `v2.15.1`.
  4. Fixed Expo config/dependency doctor blockers:
     - Removed invalid `fonts` field from `app.json`.
     - Added direct dependency `react-native-gesture-handler` via `npx expo install`.
     - Removed direct `@types/react-native` dev dependency.
  5. Warning-noise cleanup (no behavior change):
     - Removed unused imports/vars in multiple files (`settings`, `index`, `trash`, `_layout`, `FAB`, `LockScreen`, `ThemedModal`, `aiStore`, `themeStore`, editors).
- Validation:
  1. `npx tsc --noEmit` -> PASS.
  2. `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` -> PASS.
  3. `npx expo-doctor` -> 13/15 PASS.
- Remaining known items (intentional deferral):
  1. Non-CNG warning persists by design because native folders are committed while app.json still has native-related fields.

32) Theme architecture hardening + SDK target uplift (2026-03-08)
- Scope:
  1. Improve theme performance and consistency.
  2. Reduce release submission warnings.
- Changes:
  1. Added shared font configuration source in `src/constants/fontConfig.ts`.
  2. Unified font scaling between `useTheme` and `useTypography` via `FONT_SCALES`.
  3. Added Devanagari-safe font resolver (`resolveEffectiveAppFont`) to avoid glyph regressions.
  4. Refactored theme consumers to use selective Zustand subscriptions with `shallow` instead of full-store subscriptions.
  5. Memoized navigation theme object in root layout to reduce unnecessary rerenders.
  6. Updated Android SDK targets in `android/build.gradle`:
     - `buildToolsVersion -> 34.0.0`
     - `compileSdkVersion -> 34`
     - `targetSdkVersion -> 34`
- Validation:
  1. `npx tsc --noEmit` -> PASS.
  2. `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` -> PASS.
  3. `npx expo-doctor --verbose` -> 14/15 PASS (only non-CNG sync warning remains).

33) CI release build failure in `:shopify_flash-list:compileReleaseKotlin` (2026-03-08)
- Symptom:
  1. All Android release jobs fail in GitHub Actions during Kotlin compile step.
  2. Error in FlashList native source:
     - `AutoLayoutView.kt: 'dispatchDraw' overrides nothing`
     - `Type mismatch: inferred type is Canvas? but Canvas was expected`
- Cause:
  1. Project was pinned to `@shopify/flash-list@1.4.3`.
  2. That version's Android source declares `dispatchDraw(canvas: Canvas?)`, which is incompatible with the current Android/Kotlin compile path used in CI.
- Resolution:
  1. Upgraded FlashList within the same major line:
     - `@shopify/flash-list: 1.4.3 -> 1.8.3`
  2. Regenerated lockfile to ensure CI resolves the fixed artifact.
  3. Verified installed source now uses:
     - `override fun dispatchDraw(canvas: Canvas)`
- Files changed:
  1. `package.json`
  2. `package-lock.json`

34) Android release resource failure with splash attr mismatch (2026-03-08 to 2026-03-12)
- Symptom:
  1. CI failed in `:app:bundleReleaseResources`.
  2. AAPT error: `style attribute 'attr/postSplashScreenTheme ... not found'`.
- Cause:
  1. Splash theming was partially migrated and styles were inconsistent across `values` and `values-v31`.
  2. Activity launch theme path and runtime theme handoff were not aligned to a single Android 12 splash baseline.
- Resolution:
  1. Migrated `Theme.App.SplashScreen` to inherit `Theme.SplashScreen` in both `values/styles.xml` and `values-v31/styles.xml`.
  2. Declared splash keys explicitly:
     - `windowSplashScreenBackground`
     - `windowSplashScreenAnimatedIcon`
     - `windowSplashScreenIconBackgroundColor`
     - `postSplashScreenTheme`
  3. MainActivity splash handoff was adjusted during migration; latest stable baseline is documented in entry 42.
  4. Kept JS pre-ready view plain to avoid visual double splash.

35) Double-splash UX (system splash + branded JS loading) (resolved in focused UX pass)
- Symptom:
  1. Users saw two launch visuals with different logo scale.
  2. Perceived as broken startup animation.
- Cause:
  1. Native splash remained active.
  2. Root JS layer rendered a branded secondary loading state.
- Resolution:
  1. Native splash kept as the only branded splash.
  2. Root pre-ready fallback remains plain background only (`#d9d7d2`).
  3. Startup hide stays gated on `coreReady` in `src/app/_layout.tsx`.

36) Spark AI loading state unclear / duplicate action taps (resolved in focused UX pass)
- Symptom:
  1. Users could not clearly tell when Spark AI was generating.
  2. Inline tiny loading text was easy to miss.
  3. Rapid taps could trigger overlapping requests.
- Cause:
  1. Loading feedback was minimal and non-blocking.
  2. Generation actions did not enforce consistent phase/state UX.
- Resolution:
  1. Added `SparkLoadingModal` blocking UX with explicit phases:
     - `preparing`, `generating`, `applying`, `done`, `error`
  2. Applied phase flow and duplicate-tap guards in:
     - `src/app/editor/new.tsx`
     - `src/app/editor/[id].tsx`
  3. Added runtime kill-switch flags:
     - `spark_loading_modal_v1`
     - `spark_loading_animation_v1`
  4. Added reduced-motion fallback and shared motion tokens.

37) Locale text corruption risk during scripted JSON edits (resolved in focused UX pass)
- Symptom:
  1. Non-English locale files can become mojibake if edited with incorrect encoding path.
- Cause:
  1. Scripted rewrite pass touched multilingual JSON with unsafe encoding handling.
- Resolution:
  1. Restored affected locale files from last good git state.
  2. Reapplied only required new keys via UTF-8 safe script.
  3. Added process note: always validate locale diff for non-ASCII regressions before commit.

38) Android release resource linking failure after SplashScreen theme migration (resolved 2026-03-12)
- Symptom:
  1. `:app:processReleaseResources` failed with AAPT attr errors:
     - `windowSplashScreenBackground`
     - `windowSplashScreenAnimatedIcon`
     - `windowSplashScreenIconBackgroundColor`
     - `postSplashScreenTheme`
- Cause:
  1. App styles were migrated to `Theme.SplashScreen`, but project dependencies did not include AndroidX SplashScreen attr provider resources.
- Resolution:
  1. Added dependency in `android/app/build.gradle`:
     - `implementation("androidx.core:core-splashscreen:1.0.1")`
  2. Re-ran local release resource verification on Java 17:
     - `:app:processReleaseResources` -> PASS.

39) CI release build failed after MainActivity splash API mismatch (resolved 2026-03-12)
- Symptom:
  1. GitHub Actions failed at `:app:compileReleaseJavaWithJavac`.
  2. Java compile errors:
     - `cannot find symbol class SplashScreenManager`
     - `cannot find symbol SplashScreenManager.registerOnActivity(this)`
- Cause:
  1. `MainActivity.java` used `expo.modules.splashscreen.SplashScreenManager`.
  2. Current project baseline (`expo-splash-screen` 0.20.5 / Expo SDK 49) does not provide that class.
- Resolution:
  1. Replaced unsupported API usage with SDK 49 compatible `onCreate` flow:
     - `setTheme(R.style.AppTheme);`
     - `super.onCreate(null);`
  2. Removed `SplashScreenManager` import/call from `MainActivity`.
  3. Updated docs to prevent reintroduction of this regression.
  4. Follow-up splash UX refinement later removed forced `setTheme(...)`; see entry 42 for current baseline.

40) Local Android compile check blocked by machine JDK/Kotlin target mismatch (known local-only)
- Symptom:
  1. Local command `:app:compileDebugJavaWithJavac` failed before app Java compile with:
     - `Unknown Kotlin JVM target: 20`
     - task: `:expo-modules-core$android-annotation:compileKotlin`
- Cause:
  1. Local Java/Kotlin toolchain mismatch versus repo baseline.
- Resolution:
  1. Use Java 17 locally to match CI baseline.
  2. Treat CI Ubuntu/Java 17 run as source of truth for release compile validation.

41) GitHub Actions warning: Node.js 20 action runtime deprecation (resolved 2026-03-13)
- Symptom:
  1. Build completed, but GitHub Actions annotation warned:
     - `Node.js 20 actions are deprecated`
     - affected actions: `checkout`, `setup-node`, `setup-java`, `upload-artifact`.
- Cause:
  1. Workflows were still pinned to older action majors running on Node 20 runtime.
- Resolution:
  1. Upgraded workflow actions:
     - `actions/checkout@v6`
     - `actions/setup-node@v6`
     - `actions/setup-java@v5`
     - `actions/upload-artifact@v7`
  2. Added `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` in workflow jobs to validate Node 24 runtime now.

42) Dual splash perception persisted after initial splash migration (resolved 2026-03-13)
- Symptom:
  1. Users still observed two startup phases during cold launch.
- Cause:
  1. Launch path had extra transition complexity:
     - forced `setTheme(...)` in `MainActivity`
     - redundant `values-v31` splash style override.
- Resolution:
  1. Removed forced theme switch from `MainActivity` and kept `super.onCreate(null)` only.
  2. Removed redundant `android/app/src/main/res/values-v31/styles.xml`.
  3. Kept one authoritative splash style in `values/styles.xml` using:
     - `Theme.App.SplashScreen`
     - `windowSplashScreenBackground`
     - `windowSplashScreenAnimatedIcon`
     - `postSplashScreenTheme`
