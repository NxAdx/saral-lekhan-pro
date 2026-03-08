# In-App Updater Logic (Android)

Last updated: 2026-03-08
Scope: GitHub release based APK updates for `com.sarallekhan`.

## 1. Design Overview

The app uses a custom updater, not Expo OTA, for APK replacement:

1. Read all release metadata from GitHub REST API (v2.16.x uses `/releases`).
2. Compare semantic version with installed app version strictly.
3. Download `.apk` asset when a NEWER version is available.
4. Launch Android package installer intent.

Core files:

- `src/utils/githubUpdater.ts` - fetch, compare, download, and installer intent.
- `src/app/(main)/settings.tsx` - updater UI state using `ThemedModal`.
- `src/app/(main)/index.tsx` - background update check on app launch using `ThemedModal`.
- `android/app/src/main/AndroidManifest.xml` - install permission for unknown sources flow.
- `app.json` - Android permission declaration for managed config.

## 2. Runtime Flow

### Step A: Check for update

`checkForUpdate()` now calls:

- `GET https://api.github.com/repos/NxAdx/saral-lekhan-pro/releases`

Behavior (Strict Versioning):

1. Fetches all releases to find the latest available version.
2. Removes leading `v` from tags.
3. Compares with installed version using a strict semantic parts comparison (`x.y.z`).
4. Finds `.apk` asset in the release.
5. Returns:
   - `hasUpdate = true` ONLY for strictly newer versions.
   - `isReinstall = true` if versions match (only prompted for manual checks).
6. UI: Uses `ThemedModal` instead of native `Alert` for a consistent look.

### Step B: Download and install

`downloadAndInstallApk()`:

1. Downloads APK to app cache using `FileSystem.createDownloadResumable`.
2. Converts file path to content URI via `FileSystem.getContentUriAsync`.
3. Fires installer intent:
   - action: `android.intent.action.VIEW`
   - type: `application/vnd.android.package-archive`
   - flags include read grant + new task.

If installer launch fails:

1. Opens unknown-app-sources settings for this package.
2. Falls back to opening the APK URL in browser.

## 3. Permission Requirements

Updater requires Android unknown source install capability.

Required permission:

- `android.permission.REQUEST_INSTALL_PACKAGES`

It must exist in both:

1. `app.json` (managed config)
2. `android/app/src/main/AndroidManifest.xml` (committed native project used by CI release builds)

If manifest is missing this permission, users can see download reach 100% but installer never opens on some Android devices.

## 4. UI State Contract (Settings Screen)

Updater UI state variables:

- `isCheckingUpdate`
- `isDownloadingUpdate`
- `downloadProgress`
- `updateInfo`

Current behavior:

1. On download start:
   - `isDownloadingUpdate = true`
   - `downloadProgress = 0`
2. On success:
   - progress set to `1`
   - installer is triggered
   - user receives `Installer Started` modal guidance
3. On failure:
   - `Update Failed` modal shown
4. `finally` always sets `isDownloadingUpdate = false`

This avoids the historical "stuck at Downloading 100%" state.

## 5. Known Failure Modes & Fixes

### A) Stuck at 100% with no installer popup

Likely causes:

1. Missing `REQUEST_INSTALL_PACKAGES` in committed native manifest.
2. OEM blocks install intent until unknown sources is allowed manually.
3. UI state not reset after intent fire.

Fix status:

- Addressed by commit `71c5692` (manifest permission + guaranteed UI reset + installer guidance modal).

### B) Update available but cannot install

Likely causes:

1. GitHub release exists but no APK asset attached.
2. APK URL blocked/network issue.
3. Device policy disallows sideloading.

Fix/diagnosis:

1. Check release page has `.apk` asset.
2. Open download URL directly in browser.
3. Enable unknown-app installation permission for Saral Lekhan.

### C) Updater shows nothing though build succeeded

Likely cause:

- Workflow uploaded artifact, but GitHub release publish failed (403 integration permission issue).

Fix:

1. Repo Settings -> Actions -> Workflow permissions -> `Read and write`.
2. Re-run tag workflow and confirm real release exists.

## 6. Verification Checklist (Post-build)

After each production build:

1. Verify GitHub release was created for tag.
2. Verify `.apk` attached to release.
3. On device with older app version:
   - open Settings -> Check for Updates
   - start download
   - confirm installer opens or guidance modal appears
4. If installer does not appear:
   - allow unknown app installs for Saral Lekhan
   - retry once

## 7. Future Improvements

Recommended:

1. Add a timeout watchdog that auto-fails download if no progress for N seconds.
2. Track updater events with Sentry breadcrumbs (check/download/install-intent outcome).
3. Add explicit "Open Downloaded APK" retry button when installer intent fails.
