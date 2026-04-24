# CI/CD Guide - Mobile APK Workflow

This document summarizes the current GitHub Actions flow for Android artifacts.

## Workflow Objective

Generate direct Android release artifacts on tags or manual runs and produce a
debug APK for pull requests.

## Pipeline Stages

1. Install Node.js 20 and Java 17.
2. Install dependencies with `npm ci`.
3. Build the committed native Android project directly.
4. Upload direct-release artifacts or direct debug APKs.

## Production Build

The production workflow now builds the direct flavor from committed native
sources:

- `npm run build:android:direct`

Outputs:

- `android/app/build/outputs/bundle/directRelease/app-direct-release.aab`
- `android/app/build/outputs/apk/direct/release/app-direct-release.apk`

## Pull Request Build

The PR workflow builds:

- `cd android && ./gradlew assembleDirectDebug --no-daemon`

Output:

- `android/app/build/outputs/apk/direct/debug/app-direct-debug.apk`

## Secrets Required

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `ANDROID_STORE_PASSWORD`

## Triggering a Release

```bash
git tag v2.17.39
git push origin v2.17.39
```

This triggers the direct-release workflow and publishes the APK to GitHub Releases.
