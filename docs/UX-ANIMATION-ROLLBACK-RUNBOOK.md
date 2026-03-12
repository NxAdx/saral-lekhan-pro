# UX Animation and Splash Rollback Runbook

## Purpose
This runbook defines fast rollback paths for the focused UX motion pass:
1. Spark AI blocking loading modal.
2. Spark loading animation.
3. Single-splash Android startup migration.

## Scope
- Spark AI UX files:
  - `src/components/ui/SparkLoadingModal.tsx`
  - `src/app/editor/new.tsx`
  - `src/app/editor/[id].tsx`
  - `src/store/runtimeUxFlagsStore.ts`
  - `runtime-flags.json`
- Native splash files:
  - `android/app/src/main/res/values/styles.xml`
  - `android/app/src/main/java/com/sarallekhan/MainActivity.java`
  - `android/app/build.gradle`
  - `src/app/_layout.tsx`

## Fast Rollback (No New Binary)
Use runtime flags to disable JS UX changes immediately.

1. Edit remote runtime flags JSON.
   - Source URL comes from `expo.extra.runtimeFlagsUrl` in `app.json`.
2. Set:
```json
{
  "spark_loading_modal_v1": false,
  "spark_loading_animation_v1": false
}
```
3. Save and publish the JSON file.
4. Validate on device:
   - Open editor.
   - Trigger Spark AI action.
   - Confirm legacy inline loading appears and no blocking modal appears.

## Controlled Rollback (Native Splash Hotfix Required)
Native splash changes are not remotely switchable. Rollback requires a new build.

### Option A: Preferred (single-commit revert)
1. Create hotfix branch:
   - `git checkout -b hotfix/revert-splash-migration`
2. Revert the splash migration commit:
   - `git revert <SPLASH_MIGRATION_COMMIT_SHA>`
3. Build release artifacts.
4. Push and trigger CI release workflow.

### Option B: File-level manual revert
If commit-level revert is not possible, restore these files from the last known stable commit:
1. `android/app/src/main/res/values/styles.xml`
2. `android/app/src/main/java/com/sarallekhan/MainActivity.java`
3. `src/app/_layout.tsx`

Then build and release a hotfix binary.

## Validation Checklist
Run after rollout and after rollback.

1. Spark AI UX
   - Each AI action shows clear loading state.
   - No duplicate request from rapid taps.
   - Modal always closes on success and error.
2. Splash
   - Cold launch on Android 12+ shows one branded splash sequence.
   - No second branded JS splash frame.
3. Build
   - `npx tsc --noEmit`
   - `npx tsc --noEmit --noUnusedLocals --noUnusedParameters`
   - Android release resource task on Java 17 environment.

## Operational Notes
- Keep startup background alignment on `#d9d7d2` during both normal and rollback states.
- If local build uses Java 20+, switch to Java 17 before Android verification (avoids `Unsupported class file major version 64`).
- Keep `androidx.core:core-splashscreen` dependency present when `Theme.SplashScreen` is used.
