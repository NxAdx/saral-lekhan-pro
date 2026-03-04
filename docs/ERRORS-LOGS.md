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
