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

## 🧹 Maintenance

- `watchman watch-del-all`: Clear Watchman watches.
- `rm -rf node_modules && npm install`: Full dependency reinstall.
- `cd android && ./gradlew clean`: Clean Gradle build cache.
