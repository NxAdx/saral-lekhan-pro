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

## Secrets and Variables Required

### GitHub Action Secrets:
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `ANDROID_STORE_PASSWORD`
- `GOOGLE_SERVICES_JSON` (if configured for notifications/services)

### GitLab CI/CD Variables:
Navigate to GitLab project **Settings > CI/CD > Variables** and configure:

| Variable Key | Value Type | Visibility Flag | Description |
| :--- | :--- | :--- | :--- |
| `ANDROID_KEYSTORE_BASE64` | Variable | **Visible** | Base64 of `release.keystore` (cannot be masked) |
| `GOOGLE_SERVICES_JSON` | Variable | **Visible** | Contents of `google-services.json` (cannot be masked) |
| `ANDROID_KEY_ALIAS` | Variable | Masked / Hidden | Key alias (`androidreleasekey`) |
| `ANDROID_KEY_PASSWORD` | Variable | Masked / Hidden | Keystore key password |
| `ANDROID_STORE_PASSWORD` | Variable | Masked / Hidden | Keystore store password |

*Note: Large variables like keystores and JSON configs cannot be masked in GitLab and must be marked as **Visible**.*

## Triggering a Release

On GitHub (via tag):
```bash
git tag v2.17.39
git push origin v2.17.39
```
This triggers the direct-release workflow and publishes the APK to GitHub Releases.

On GitLab (automatic build on main/tags):
The `.gitlab-ci.yml` pipeline automatically builds the production Android build on pushes to the `main` branch or when version tags matching `v*.*.*` are pushed.
To push to both remotes:
```bash
git push both main
```

