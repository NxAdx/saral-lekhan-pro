# Offline Android Production Build Guide (Without Expo EAS)

This guide documents the exact commands and configurations required to build the Saral Lekhan Plus APK locally on your Windows machine, entirely offline and without relying on Expo's EAS cloud servers.

## Environment Requirements
- **Node.js**: v20.15.1+ 
- **Java JDK**: 20.0.2 (runs Gradle, but bytecode targets Java 17)
- **Gradle**: 8.3 (via wrapper, NOT 8.4+)
- **Kotlin**: 1.9.10
- **Android SDK**: API 33+ with Build Tools installed

## Critical Build Fixes Applied

The following patches are required to make the local build work with JDK 20:

### 1. Java 17 Bytecode Enforcement (3-layer)
JDK 20 outputs major version 64 bytecode which crashes Android's D8 dexer. Three layers enforce Java 17:

- **Root `android/build.gradle`**: `gradle.taskGraph.whenReady` hook forces ALL Kotlin tasks to `jvmTarget='17'`
- **App `android/app/build.gradle`**: `compileOptions { sourceCompatibility = VERSION_17; targetCompatibility = VERSION_17 }`
- **`node_modules/expo-modules-core/android-annotation{,-processor}/build.gradle`**: Direct `jvmTarget='17'` patches

### 2. Native Modules Null Project Fallback
**File**: `node_modules/@react-native-community/cli-platform-android/native_modules.gradle`
The RN CLI v11.3.10 returns empty `project:{}` for Expo-managed projects. Patched to use fallback config instead of throwing.

### 3. AndroidManifest Package Attribute
**File**: `android/app/src/main/AndroidManifest.xml`
Added `package="com.sarallekhan"` to help RN CLI detect native module dependencies.

### 4. Expo Autolinking Dependencies
**File**: `android/app/build.gradle`
Added `addExpoModulesDependencies(dependencies, project)` and `generateExpoModulesPackageList()` calls to link all Expo modules as app dependencies.

### 5. Splash Screen Color Resource
**File**: `android/app/src/main/res/values/colors.xml`
Added `<color name="splashscreen_background">#ffffff</color>` referenced by `splashscreen.xml`.

---

## 🛠️ Build Commands (Execute in PowerShell)

### Step 1: Terminate Hanging Processes
```powershell
./android/gradlew --stop
taskkill /F /IM java.exe /T
```

### Step 2: Apply node_modules Patches
After every `npm install`, re-apply these patches:
```powershell
# expo-modules-core annotation processor patches (jvmTarget=17)
# Edit: node_modules/expo-modules-core/android-annotation/build.gradle
# Edit: node_modules/expo-modules-core/android-annotation-processor/build.gradle
# Change: java { sourceCompatibility = VERSION_11 } → VERSION_17
# Add: tasks.withType(KotlinCompile).configureEach { kotlinOptions.jvmTarget = '17' }

# native_modules.gradle null project fallback
# Edit: node_modules/@react-native-community/cli-platform-android/native_modules.gradle
# Change line ~431: throw → project = [packageName: 'com.sarallekhan', sourceDir: './android']
# Change line ~476: return json["project"]["android"] → return project
```

### Step 3: Clear Caches (Optional but Recommended)
```powershell
Remove-Item -Recurse -Force "android/.gradle" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "android/app/build" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
```

### Step 4: Build the APK
```powershell
cd android
./gradlew assembleRelease --no-daemon --console=plain
```

### Step 5: Locate your APK!
**`android/app/build/outputs/apk/release/app-release.apk`** (~37.5 MB)

---

## ⚠️ Known Warnings (Safe to Ignore)
- `metro.config.js should extend @react-native/metro-config` — False positive for Expo projects
- `package="com.sarallekhan" found in source AndroidManifest.xml` — Expected, needed for CLI detection
- `Deprecated Gradle features were used` — Cosmetic only

## 🔧 Troubleshooting

| Error | Fix |
|-------|-----|
| `Unsupported class file major version 64` | Re-apply jvmTarget=17 patches after `npm install` |
| `project:[:]` / config detection error | Re-apply `native_modules.gradle` patch |
| `package expo.modules does not exist` | Ensure `addExpoModulesDependencies` is in `app/build.gradle` |
| `splashscreen_background not found` | Add color to `values/colors.xml` |
| `Timeout waiting to lock Artifact transforms` | Kill all `java.exe` processes first |
