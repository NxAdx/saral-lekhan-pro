# Production-Grade Android Updater Strategy
**A Reverse-Engineering Study of CloudStream & ImageToolbox**

## 1. Executive Summary
Current updater logic in Saral Lekhan Plus is "worthless" because it operates purely in the UI thread/context, is fragile to backgrounding, and relies on deprecated `Intent` triggers. This research identifies patterns for a stable, resilient, and professional updater architecture.

---

## 2. Reverse Engineering Findings

### A. CloudStream (Model: Integrated Foreground Service)
CloudStream uses the most sophisticated approach for independent APK management.
- **Background Resilience:** Uses a `PackageInstallerService` (Foreground Service) with `FOREGROUND_SERVICE_TYPE_DATA_SYNC`. This prevents the OS from killing the download even if the app is closed.
- **Modern API Integration:** Leverages the `android.content.pm.PackageInstaller` API instead of simple `VIEW` Intents.
- **Delayed Installation:** Introduces the concept of `DelayedInstaller`. On Android 12+, it can fetch the update and wait for a user to trigger the restart, avoiding jarring interruptions.
- **Installer Reliability:** Handles MIUI (Xiaomi) specific quirks and explicit permission handling for "Unknown Sources".
- **Versioning:** Uses Regex-based numerical comparison of versions (1.2.3 -> 10203) to avoid string comparison errors.

### B. ImageToolbox (Model: Resilient Download Architecture)
ImageToolbox focuses on the *resilience* of the download process itself.
- **KeepAlive Service:** Uses a `KeepAliveService` with a `track` function. Any important operation (like downloading update assets) is "tracked" to ensure the process stays alive.
- **Performance:** Uses `Ktor` with `throttleLatest` (50ms) progress updates. This prevents UI jank from excessive progress callbacks.
- **Asset Integrity:** Downloads to a `.tmp` file in a dedicated cache and only renames to `.apk` after a successful checksum/finish.

---

## 3. The "Production-Level" Updater Blueprint
To implement a "worthless-no-more" updater, we should adopt these four pillars:

### Pillar 1: The Foreground Service
- **Logic:** Move `downloadAndInstallApk` logic from a React Native bridge helper to a dedicated Native Android Service.
- **Benefit:** Download continues in the notification tray even if the user swipes away the app.

### Pillar 4: The PackageInstaller API
- **Logic:** Use `PackageInstaller.Session` to stream the APK.
- **Benefit:** No need for `FileProvider` URI permission headaches; the system handles the stream directly.

### Pillar 3: Smart Versioning
- **Logic:** Implement semantic versioning parsing that handles `major.minor.patch` comparisons numerically.
- **Benefit:** Prevents `2.10.0` being seen as smaller than `2.9.0`.

### Pillar 4: User-Centric Controls
- **Logic:** Implement "Skip this version" and "Install on Exit" (Delayed Install).
- **Benefit:** Respects user workflow; doesn't force an update at a bad time.

---

## 4. Implementation Strategy for Saral Lekhan Plus

### Phase 1: Native Module Refactor
- Create `UpdaterModule.kt` (or similar) to bridge to a Kotlin-based foreground service.
- Use `expo-task-manager` or a custom native service if managed flow permits (likely needs custom dev client/prebuild).

### Phase 2: Enhanced UI
- Show persistent notification with progress bar.
- Guidance modal that explains *why* the user needs to grant "Install Unknown Apps" permission.

### Phase 3: Version Shadowing
- Store `skippedVersionNodeId` in `MMKV`/`Zustand` to stop nagging the user once they've seen a release.

---

## 5. Conclusion
By moving from "UI-triggered-Intent" to "Service-backed-PackageInstaller", we move from a hobbyist tool to a production-grade utility that users can trust.
