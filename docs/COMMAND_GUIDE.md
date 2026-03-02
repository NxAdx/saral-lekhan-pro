# Command Guide - सरल लेखन (Saral Lekhan)

This guide provides common terminal commands for developers working on the Saral Lekhan project.

## 1. Development Commands
> [!IMPORTANT]
> All commands must be run from the project root: `d:\Development\Production\saral-lekhan-plus`

### Start Development Server
```bash
npx expo start
```
*Options:*
- `-c`: Clear the packager cache.
- `--android`: Open the app on a connected Android device/emulator.
- `--ios`: Open the app on a connected iOS simulator.

### Run on Android (Development Client)
```bash
npx expo run:android
```

### Run on iOS (Development Client)
```bash
npx expo run:ios
```

## 2. Build Commands (Production)
Commands to generate the final APK/AAB for distribution.

### Build Local APK (Development/Internal Testing)
```powershell
cd android
.\gradlew assembleRelease
```
*The resulting APK will be at `android/app/build/outputs/apk/release/app-release.apk`.*

### EAS Build (Cloud Build)
If you have EAS configured:
```bash
eas build --platform android --profile production
```

## 3. Database & Store
### Reset Local Storage (Development Only)
If you need to clear the app state and database during development:
- **Android**: Long-press app icon > App Info > Storage & Cache > Clear Storage.
- **Terminal (if using emulator)**:
```bash
adb shell pm clear com.saral.lekhan
```

## 4. Linting & Type Checking
### Run TypeScript Compiler
```bash
npx tsc
```

### Linting
If ESLint is configured:
```bash
npm run lint
```

## 5. Helpful Utilities
### View Connected Devices
```bash
adb devices
```

### Logcat (Android Debugging)
```bash
adb logcat *:S ReactNative:V ReactNativeJS:V
```

---
*Version 1.0 | 2026-03-01*
