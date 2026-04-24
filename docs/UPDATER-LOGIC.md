# In-App Updater Logic (Android)

Last updated: 2026-04-23
Scope: direct GitHub-release APK updates for `com.sarallekhan`, plus the F-Droid
distribution split.

## Overview

Saral Lekhan now has two Android distribution lanes:

1. `direct`
   - Checks GitHub Releases for newer APKs.
   - Can request `REQUEST_INSTALL_PACKAGES`.
   - Registers `UpdaterPackage` and `InstallReceiver`.
2. `fdroid`
   - Disables the updater module and hides the update path.
   - Ships without `REQUEST_INSTALL_PACKAGES`.
   - Does not make GitHub updater calls.

Core files:

- `src/utils/githubUpdater.ts`
- `src/utils/buildInfo.ts`
- `src/app/(main)/settings.tsx`
- `android/app/build.gradle`
- `android/app/src/direct/AndroidManifest.xml`
- `android/app/src/fdroid/AndroidManifest.xml`
- `android/app/src/main/java/com/sarallekhan/MainApplication.java`

## Runtime Flow

### Direct builds

`checkForUpdate()` calls:

- `GET https://api.github.com/repos/NxAdx/saral-lekhan-pro/releases`

Behavior:

1. Fetch release metadata from GitHub.
2. Strip leading `v` from version tags.
3. Compare strict semantic parts with the installed app version.
4. Find the latest APK asset.
5. Return update metadata for the settings UI.

`downloadAndInstallApk()`:

1. Downloads the APK into cache.
2. Verifies install permission support.
3. Uses `UpdaterModule` when available.
4. Falls back to opening the download URL in the system browser on failure.

### F-Droid builds

F-Droid builds set `UPDATER_MODE=fdroid`, so:

1. `checkForUpdate()` returns `null` immediately.
2. install-permission helpers are no-ops.
3. the updater package is not registered in `MainApplication`.
4. the update UI is hidden in settings.

## Permission Model

Direct-only permission:

- `android.permission.REQUEST_INSTALL_PACKAGES`

Location:

- `android/app/src/direct/AndroidManifest.xml`

F-Droid builds intentionally do not carry this permission.

## Verification Checklist

For direct builds:

1. Tag a release and confirm a GitHub Release exists.
2. Confirm an APK asset is attached to the release.
3. Open Settings -> Check for Updates.
4. Confirm install permission guidance appears when needed.

For F-Droid builds:

1. Open Settings and confirm updater UI is absent.
2. Confirm no GitHub updater requests happen.
3. Confirm the package does not request installer permission.

## Operational Notes

- The updater is for the direct flavor only.
- F-Droid builds rely on the F-Droid repository for updates.
- Spark AI remains optional and independent of the updater flow.
