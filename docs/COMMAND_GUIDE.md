# Command Guide

A centralized reference for all development commands required to run, build, and debug the **Saral Lekhan Plus** system.

## 🚀 Development & Running

- `npm start`: Start the Expo development server.
- `npx expo start --android`: Run the app on a connected Android device/emulator.
- `npx expo start --ios`: Run the app on an iOS simulator.

## 🛠️ Build & Compilation

- `npx expo prebuild`: Generate native `android/` and `ios/` folders.
- `cd android && ./gradlew assembleRelease`: Build the production Android APK.
- `cd android && ./gradlew assembleDebug`: Build the debug Android APK.

## ✅ Quality & Testing

- `npm test`: Run Jest unit tests.
- `npm run lint`: Run ESLint for code formatting and style.
- `npm run tsc`: Run TypeScript compiler for type validation.

## 🔍 Diagnostics & Debugging

- **ADB Logcat**:
  ```bash
  # View app-specific logs
  & "C:\Program Files (x86)\Minimal ADB and Fastboot\adb.exe" logcat ReactNativeJS:V saral:V *:S
  # Filter only errors
  & "C:\Program Files (x86)\Minimal ADB and Fastboot\adb.exe" logcat *:E
  ```
- **Sentry Check**:
  ```bash
  # Verify Sentry initialization and recent events (via Sentry UI or CLI)
  sentry-cli info
  ```

## 📦 Releasing (GitHub)

- **Create a New Release**:
  ```bash
  # 1. Create a version tag
  git tag v2.15.3
  # 2. Push the tag to trigger GitHub Actions (Automated Build & Release)
  git push origin v2.15.3
  ```
  *Note: Ensure `app.json` and `package.json` versions are updated before tagging.*

## 🧹 Maintenance

- `watchman watch-del-all`: Clear Watchman watches.
- `rm -rf node_modules && npm install`: Full dependency reinstall.
- `cd android && ./gradlew clean`: Clean Gradle build cache.

## Splash/Icon Validation (v2.16.3+ Hotfix)

- `adb uninstall com.lokhande.sarallekhan`: Remove old install to clear launcher icon cache before verification.
- `cd android && ./gradlew assembleRelease`: Build release APK with updated native splash/icon resources.
- `adb install -r app/build/outputs/apk/release/app-release.apk`: Install freshly built APK.
- `adb shell am start -n com.lokhande.sarallekhan/.MainActivity`: Cold-launch the app for splash transition validation.

Expected result:
- Single visual splash continuity with `#d9d7d2` (no black first-frame).
- Launcher icon surface/background appears light (`#d9d7d2`) instead of legacy dark.
