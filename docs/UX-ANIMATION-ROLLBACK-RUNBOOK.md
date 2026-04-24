# UX Animation and Splash Rollback Runbook

## Purpose

This runbook defines fast rollback paths for:

1. Spark AI blocking loading modal
2. Spark loading animation
3. Android startup and splash behavior

## Scope

- `src/components/ui/SparkLoadingModal.tsx`
- `src/app/editor/new.tsx`
- `src/app/editor/[id].tsx`
- `src/store/runtimeUxFlagsStore.ts`
- `src/utils/buildInfo.ts`
- `runtime-flags.json`
- `android/app/build.gradle`
- `src/app/_layout.tsx`

## Fast Rollback (No New Binary)

Direct builds can still use runtime flags to disable JS UX changes quickly.

1. Edit the remote runtime flags JSON.
2. The direct-build source URL comes from `RUNTIME_FLAGS_URL` in `src/utils/buildInfo.ts`.
3. Set:

```json
{
  "spark_loading_modal_v1": false,
  "spark_loading_animation_v1": false
}
```

4. Publish the updated JSON.
5. Validate on a direct build:
   - Open editor
   - Trigger a Spark AI action
   - Confirm the legacy inline loading path appears

F-Droid note:
- F-Droid builds ship with an empty runtime-flags URL and stay on bundled defaults.
- Remote rollback is therefore a direct-build-only tool.

## Controlled Rollback (New Binary Required)

Native splash behavior is not remotely switchable. Rollback requires a new build.

### Option A: Preferred

1. Create a hotfix branch.
2. Revert the splash migration commit.
3. Build the direct release or F-Droid flavor as needed.
4. Publish the updated binary.

### Option B: File-Level Restore

Restore these files from the last known stable commit:

1. `android/app/src/main/res/values/styles.xml`
2. `android/app/src/main/java/com/sarallekhan/MainActivity.java`
3. `src/app/_layout.tsx`

## Validation Checklist

1. Spark AI UX
   - Each AI action shows explicit loading state.
   - No duplicate request from rapid taps.
   - Modal always closes on success and error.
2. Splash
   - Cold launch shows one branded splash sequence.
   - No second branded JS splash frame.
3. Build
   - `npx tsc --noEmit`
   - Android verification on Java 17

## Operational Notes

- Keep startup background alignment on `#d9d7d2`.
- For local Android verification, use Java 17 instead of Java 20+.
- For updater-visible hotfixes, publish a direct release tag so GitHub Releases receives the APK asset.
