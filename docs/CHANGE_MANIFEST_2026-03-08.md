# Change Manifest - 2026-03-08

## 1) Purpose
This file is the auditable manifest of all production changes delivered in the 2026-03-08 hardening cycle.  
Use this as the first reference when a new developer/agent needs to understand what changed, why it changed, and where to continue safely.

## 2) Scope Window
- Branch: `main`
- Commits covered:
  - `a86a506`
  - `c9a9649`
  - `822744a`
  - `62b856d`
  - `2862f38`
  - `06cf03c`

## 3) Commit-by-Commit Manifest

### Commit `a86a506`
Message: `docs: finalize v2.16.4 release with native fixes and onboarding guides`

Changed files:
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png`
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png`
- `android/app/src/main/res/values-night/colors.xml`
- `android/app/src/main/res/values-v31/styles.xml` (added)
- `android/app/src/main/res/values/colors.xml`
- `android/app/src/main/res/values/styles.xml`
- `app.json`
- `package.json`
- `src/constants/changelog.ts`

Why:
- Unified Android startup/icon resources around `#d9d7d2`.
- Added Android 12+ splash style resource path (`values-v31`).
- Synced app semantic version/changelog for release traceability.

---

### Commit `c9a9649`
Message: `fix: final native splash resource sync for v2.16.4`

Changed files:
- `android/app/src/main/res/values-v31/styles.xml`

Why:
- Resolved native splash style mismatch introduced during v2.16.4 resource migration.
- Kept `values-v31` limited to attributes safe for current AGP/compile setup.

---

### Commit `822744a`
Message: `Harden theme architecture, fix TS blockers, and align Android release config`

Changed files:
- `android/app/build.gradle`
- `android/build.gradle`
- `app.json`
- `package-lock.json`
- `package.json`
- `src/app/(main)/index.tsx`
- `src/app/(main)/settings.tsx`
- `src/app/(main)/trash.tsx`
- `src/app/_layout.tsx`
- `src/app/editor/[id].tsx`
- `src/app/editor/new.tsx`
- `src/components/ui/FAB.tsx`
- `src/components/ui/LockScreen.tsx`
- `src/components/ui/NotePill.tsx` (deleted)
- `src/components/ui/ThemedModal.tsx`
- `src/constants/fontConfig.ts` (added)
- `src/services/googleDriveService.ts`
- `src/store/aiStore.ts`
- `src/store/themeStore.ts`
- `src/store/typographyStore.ts`
- `tmp_layout_new.tsx` (deleted)
- `window_dump.xml` (deleted)

Why:
- Removed tracked temp/dead files that broke strict TypeScript.
- Introduced centralized font scale config + script-safe font resolver.
- Reduced rerenders via better Zustand selector usage and memoized theme shape.
- Hardened Google Sign-In previous-session detection for API compatibility.
- Upgraded Android compile/target SDK to 34 and aligned release metadata.
- Removed stale/unused code paths to reduce maintenance risk.

---

### Commit `62b856d`
Message: `chore: apply safe lockfile security patch`

Changed files:
- `package-lock.json`

Why:
- Applied lockfile-only transitive security patch (`minimatch` lineage) without risky runtime churn.

---

### Commit `2862f38`
Message: `docs: add production handover and version docs folder for future maintainers`

Changed files:
- `.gitignore`
- `docs/AGENT-CAPABILITIES-REGISTRY.md`
- `docs/ARCH/PLAN_V27.md`
- `docs/ARCH/PLAN_V28.md`
- `docs/ARCH/PLAN_V28_1.md`
- `docs/ARCH/PLAN_V29_0.md`
- `docs/App_Color_Palette.md`
- `docs/BUILD_OFFLINE.md`
- `docs/CI-CD-GUIDE.md`
- `docs/CI_CD_Guide.md`
- `docs/COMMAND_GUIDE.md`
- `docs/DESIGN-SYSTEM.md`
- `docs/DESIGN_DNA.md`
- `docs/ERRORS-LOGS.md`
- `docs/GOOGLE-AUTH-LOGIC.md`
- `docs/Git_Guide.md`
- `docs/IMPLEMENTATION-GUIDE.md`
- `docs/MASTER-PROJECT-DOCUMENTATION.md`
- `docs/PRODUCTION_HANDOVER_2026-03-08.md`
- `docs/README.md`
- `docs/RELEASES/v2.10.1.md`
- `docs/RELEASES/v2.12.0.md`
- `docs/RELEASES/v2.15.1.md`
- `docs/RELEASES/v2.15.2.md`
- `docs/RELEASES/v2.7.1.md`
- `docs/RELEASES/v2.8.0.md`
- `docs/RELEASES/v2.8.1.md`
- `docs/RELEASES/v2.8.2.md`
- `docs/RELEASES/v2.9.0.md`
- `docs/RELEASES/v2.9.1.md`
- `docs/RELEASES/v2.9.2.md`
- `docs/RELEASES/v2.9.3.md`
- `docs/RELEASES/v2.9.4.md`
- `docs/RELEASES/v2.9.9.md`
- `docs/RESEARCH-UPDATER-STRATEGY.md`
- `docs/TASKS.md`
- `docs/TECHNICAL_ENV_GUIDE.md`
- `docs/TYPOGRAPHY_PLAN.md`
- `docs/UI-UX.md`
- `docs/UPDATER-LOGIC.md`
- `docs/USER_MANUAL.md`
- `docs/ui-fixes-documentation.md`

Why:
- Brought docs under source control to preserve implementation memory.
- Added a dedicated handover baseline and environment warnings for reproducible CI builds.
- Kept docs repository-weight controlled by ignoring heavy generated assets (`docs/*.html`, `docs/*.docx`).

## 4) Known Production-Safety Decisions
1. No forced major dependency upgrades were applied during hardening.
2. Security patching was lockfile-only where safe.
3. Startup/splash logic was stabilized without introducing custom Java/Kotlin boot hacks.
4. Strict TypeScript gate was restored before considering additional feature work.

## 5) Validation Snapshot (After Code Hardening)
Commands executed:
1. `npx tsc --noEmit`
2. `npx tsc --noEmit --noUnusedLocals --noUnusedParameters`
3. `npx expo-doctor --verbose`

Result:
- TypeScript checks passed.
- Unused symbol checks passed.
- Expo Doctor passed `14/15` with one known non-CNG warning retained by architecture choice.

## 6) Next Maintainer Checklist
1. Read `docs/PRODUCTION_HANDOVER_2026-03-08.md` first.
2. Review `docs/TECHNICAL_ENV_GUIDE.md` before local/CI build edits.
3. Run TypeScript + Expo doctor checks before and after each release-facing change.
4. Keep native splash resources, `app.json`, and version/changelog constants in sync per release.

## 7) Post-Handover Follow-Up (same date)
An additional CI-only Kotlin failure was discovered after the initial hardening commits:
- Hotfix commit: `06cf03c`
- Task: `:shopify_flash-list:compileReleaseKotlin`
- Error source: `@shopify/flash-list@1.4.3` Android file `AutoLayoutView.kt` (`dispatchDraw(Canvas?)` incompatibility)
- Remediation: bump to `@shopify/flash-list@1.8.3` and update lockfile
- This follow-up is intentionally documented here so future maintainers can distinguish:
  1. Initial hardening baseline.
  2. Immediate CI compatibility hotfix that followed.
