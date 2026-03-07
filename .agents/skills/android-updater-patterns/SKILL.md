---
name: android-updater-patterns
description: Production-grade Android APK updater implementation patterns derived from CloudStream and ImageToolbox.
---

# Android Updater Patterns

This skill provides instructions and patterns for implementing robust, production-grade Android in-app updaters. Traditional "UI-thread" updaters are fragile and prone to failure; these patterns ensure resilience and reliability.

## Core Patterns

### 1. Foreground Service Download
**Concept:** Moving the download logic from the application UI context to a dedicated Android Service.
- **Why:** Prevents the OS from killing the download process when the app is backgrounded or swiped away.
- **Implementation:** Use `FOREGROUND_SERVICE_TYPE_DATA_SYNC` (Android 10+) and show a persistent notification with a progress bar.

### 2. PackageInstaller API (Preferred)
**Concept:** Using `android.content.pm.PackageInstaller` for installation instead of `Intent.ACTION_VIEW`.
- **Why:** More secure, allows for "session-based" streaming of APK bytes, and provides better feedback/control over the installation process.
- **Key Logic:**
    1. Create a `PackageInstaller.Session`.
    2. Write APK bytes directly into the session.
    3. `commit` the session to trigger the system's package installer.

### 3. Delayed Installation (Opt-in)
**Concept:** Preparing the update in the background and prompting the user for a "Delayed Install" (e.g., at the next app exit or restart).
- **Why:** Reduces user friction by not forcing an immediate restart during an active workflow.
- **Pattern:** Use a `DelayedInstaller` class to store the committed session and a `BroadcastReceiver` to handle the status.

### 4. Resilient Version Comparison
**Concept:** Numeric semantic versioning.
- **Why:** String comparison (e.g., `"2.10.0" > "2.9.0"`) fails in many languages.
- **Pattern:** Convert versions to Long: `major * 1,000,000 + minor * 1,000 + patch`.

## Best Practices
- **Watchdog:** Implement a timeout that fails the download if no progress is detected for 30+ seconds.
- **Cleanup:** Always delete temporary `.apk` or `.tmp` files after successful installation or on app exit.
- **MIUI Compatibility:** Be aware that Xiaomi devices (MIUI) often require specialized intent flags or fallback to legacy installation methods.
- **Guidance Modals:** When an installation fails, show a clean modal explaining how to "Allow installation from unknown sources" for your specific package.

## References
- CloudStream `InAppUpdater.kt` / `PackageInstaller.kt`
- ImageToolbox `AndroidDownloadManager.kt` / `KeepAliveService`
