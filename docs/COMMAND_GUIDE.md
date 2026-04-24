# Command Guide

A centralized reference for the main development, build, and release commands
used in Saral Lekhan Plus.

## Development and Running

- `npm start`: Start the Expo development server.
- `npx expo start --android`: Run the app on a connected Android device or emulator.
- `npx expo start --ios`: Run the app on an iOS simulator.

## Build and Compilation

- `npm run build:android:direct`: Build the signed direct-release AAB and APK.
- `npm run build:android:fdroid`: Build the unsigned F-Droid APK.
- `cd android && ./gradlew assembleDirectDebug`: Build the direct debug APK.

## Quality and Testing

- `npm test`: Run Jest unit tests.
- `npm run lint`: Run ESLint.
- `npm run tsc`: Run the TypeScript compiler.

## Diagnostics and Debugging

- `adb logcat ReactNativeJS:V saral:V *:S`: View app-specific Android logs.
- `adb logcat *:E`: Filter only Android errors.

## Agent Skills & Automation (Android CLI)

- `android init`: Initialize the agent environment and install core skills.
- `android skills list`: List all installed skills and their availability.
- `android skills add --all --project=.`: Refresh/install all official Android skills for this project.
- `android sdk list`: List installed Android SDK components for verification.
- `android doctor`: Diagnose common environment and agent configuration issues.

## Releasing (GitHub)

```bash
# 1. Confirm package.json + app.config.js versions are correct
# 2. Tag the release
git tag v2.17.39

# 3. Push the tag to trigger the direct release workflow
git push origin v2.17.39
```

Versioning note:
- `package.json`, `app.config.js`, and committed Android version metadata must stay in sync before tagging.

## Maintenance

- `watchman watch-del-all`: Clear Watchman watches.
- `rm -rf node_modules && npm install`: Reinstall dependencies from scratch.
- `cd android && ./gradlew clean`: Clean the Gradle build cache.

## Splash/Icon Validation

- `npm run build:android:direct`: Build the current direct release APK.
- `adb install -r android/app/build/outputs/apk/direct/release/app-direct-release.apk`: Install the fresh APK.
- `adb shell am start -n com.sarallekhan/.MainActivity`: Cold-launch the app for verification.

Expected result:
- Single visual splash continuity with `#d9d7d2` and no black first frame.
- Launcher icon surface/background stays on the updated light baseline.
