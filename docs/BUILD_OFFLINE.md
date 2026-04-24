# Offline Android Build Guide

This guide documents the current local Android build flow for Saral Lekhan Plus
without EAS cloud builds.

## Requirements

- Node.js 18+ or 20.x
- Java 17
- Android SDK installed locally
- Working `node_modules`

## Important Constraint

This project's current Android Gradle stack must be built with Java 17.

If you use Java 20 or newer, Gradle can fail early with:

- `Unsupported class file major version 64`
- or the Java 21 equivalent (`major version 65`)

## Install Dependencies

```bash
npm ci --legacy-peer-deps
```

## Build Commands

Direct release artifacts:

```bash
npm run build:android:direct
```

F-Droid flavor:

```bash
npm run build:android:fdroid
```

Direct debug APK:

```bash
cd android
./gradlew assembleDirectDebug --no-daemon
```

## Expected Outputs

- Direct release APK:
  - `android/app/build/outputs/apk/direct/release/app-direct-release.apk`
- Direct release AAB:
  - `android/app/build/outputs/bundle/directRelease/app-direct-release.aab`
- F-Droid APK:
  - `android/app/build/outputs/apk/fdroid/release/app-fdroid-release-unsigned.apk`

## Troubleshooting

- If `npx tsc --noEmit` fails, refresh dependencies first.
- If Gradle fails before task execution with class-file-version errors, switch to Java 17.
- If direct release signing fails, set the `MYAPP_UPLOAD_*` or legacy `ANDROID_*` env vars before building.
