# Production Handover - 2026-03-08

## 1) Purpose
This document records the full production-hardening pass completed on `2026-03-08` so the next developer/agent can continue with exact context.

Primary goals of this pass:
- Remove TypeScript/build blockers.
- Stabilize startup and theme behavior without changing user-facing features.
- Improve release hygiene for Play Store readiness.
- Document the exact state, validations, and remaining risks.

## 2) Commits Included
- `a86a506` - `docs: finalize v2.16.4 release with native fixes and onboarding guides`
- `c9a9649` - `fix: final native splash resource sync for v2.16.4`
- `822744a` - `Harden theme architecture, fix TS blockers, and align Android release config`
- `62b856d` - `chore: apply safe lockfile security patch`
- `2862f38` - `docs: add production handover and version docs folder for future maintainers`

Repository/branch:
- `origin/main`

## 3) High-Level Outcomes
- TypeScript gates now pass.
- Unused/temporary tracked files that were causing compile noise were removed.
- Google Sign-In session handling now supports package-version differences safely.
- Version metadata was aligned.
- Android compile/target SDK upgraded to 34.
- Expo doctor improved to `14/15` checks passing.
- Remaining doctor item is an expected architecture warning (non-CNG sync warning).

## 4) Detailed Change Log

### A) Build and Type Safety Blockers
1. Removed stale tracked temporary files:
   - `tmp_layout_new.tsx` (deleted)
   - `window_dump.xml` (deleted)
2. Removed dead component:
   - `src/components/ui/NotePill.tsx` (deleted)
   - It referenced missing `HardShadow` and had no usages.

Impact:
- `npx tsc --noEmit` no longer fails due to missing modules from dead/temp files.

### B) Google Sign-In Compatibility Hardening
File:
- `src/services/googleDriveService.ts`

Change:
- Added compatibility helper for previous-session checks:
  - Uses `hasPreviousSignIn()` when available.
  - Falls back to `getCurrentUser()` for package variants lacking that API.

Reason:
- Existing code assumed a single API shape and failed in strict TypeScript mode.

Runtime effect:
- No behavior regression expected; sign-in flow remains same for users, now more robust across package versions.

### C) Theme and Rendering Best-Practice Refactor
New file:
- `src/constants/fontConfig.ts`

Refactors:
- `src/store/themeStore.ts`
- `src/store/typographyStore.ts`
- `src/app/_layout.tsx`
- `src/components/ui/LockScreen.tsx`

What changed:
1. Centralized font scaling and script safety logic:
   - Introduced shared `FONT_SCALES`.
   - Added `resolveEffectiveAppFont()` for Devanagari-safe fallback.
2. Removed duplicated font-scaling rules between theme and typography paths.
3. Replaced broad Zustand store subscriptions with selector + `shallow` in critical paths.
4. Memoized navigation theme object in root layout.

Why this matters:
- Reduces unnecessary rerenders.
- Prevents font drift between typography layers.
- Preserves Hindi/Marathi script reliability under custom font selection.

### D) Release Metadata and Version Alignment
Files:
- `android/app/build.gradle`
- `src/app/(main)/settings.tsx`

Changes:
1. Android version aligned:
   - `versionCode 57`
   - `versionName "2.16.4"`
2. Settings footer no longer hardcodes old version text.
   - Now uses `APP_VERSION`.

### E) Android SDK Target Uplift
File:
- `android/build.gradle`

Changes:
- `buildToolsVersion` -> `34.0.0`
- `compileSdkVersion` -> `34`
- `targetSdkVersion` -> `34`

Reason:
- Moves project toward Play Store target requirements.

### F) Expo/Dependency Hygiene
Files:
- `app.json`
- `package.json`
- `package-lock.json`

Changes:
1. Removed invalid `fonts` key from Expo config schema.
2. Added direct peer dependency:
   - `react-native-gesture-handler` (SDK-compatible version).
3. Removed direct `@types/react-native` dependency (types already provided by RN stack).
4. Applied safe lockfile-only audit patch:
   - `minimatch` nested lock resolved from `8.0.5` -> `8.0.7`.

### G) Code Hygiene Cleanup (No Feature Changes)
Files cleaned for unused imports/variables:
- `src/app/(main)/index.tsx`
- `src/app/(main)/settings.tsx`
- `src/app/(main)/trash.tsx`
- `src/app/editor/[id].tsx`
- `src/app/editor/new.tsx`
- `src/components/ui/FAB.tsx`
- `src/components/ui/LockScreen.tsx`
- `src/components/ui/ThemedModal.tsx`
- `src/store/aiStore.ts`

Goal:
- Keep strict TS and unused checks clean.

## 5) Verification Evidence

Commands run and final state:
1. `npx tsc --noEmit`
   - Result: pass
2. `npx tsc --noEmit --noUnusedLocals --noUnusedParameters`
   - Result: pass
3. `npx expo-doctor --verbose`
   - Result: `14/15` checks pass
   - Remaining warning:
     - Non-CNG sync warning (expected when native folders are committed and `app.json` also contains native config fields).

## 6) Remaining Known Risks
1. Dependency vulnerabilities remain in `npm audit` output.
   - Most remaining fixes require major/breaking upgrades (Expo/RN toolchain bump).
   - Not force-applied in this pass to avoid runtime regressions.
2. Non-CNG configuration warning remains by architecture choice.
   - This is not an immediate runtime bug, but must be understood by future maintainers.

## 7) Play Store Readiness Status

Completed:
- Target SDK moved to 34.
- Version alignment fixed.
- Type and config stability improved.

Still required before final store publish:
1. Final dependency upgrade plan for remaining high vulnerabilities (safe phased plan).
2. End-to-end release pipeline verification on CI (artifact + signing + smoke test).
3. Play Console compliance checks:
   - Data safety form.
   - Permission declarations (especially update/install behavior if distributing via Play).
   - Privacy policy and support details.

## 8) CI/CD Notes for Next Developer/Agent
1. Push to `main` triggers production workflow (`Production Android Build`) in this repository.
2. If querying workflow status via `gh` CLI, local machine must be authenticated:
   - `gh auth login`
3. Keep `GOOGLE_SERVICES_JSON` and keystore secrets in sync; existing workflow already validates SHA/package consistency.

## 9) Rollback Strategy
If any regression is discovered:
1. Revert latest hardening commits in order:
   - `62b856d`
   - `822744a`
2. Re-run:
   - `npx tsc --noEmit`
   - `npx expo-doctor --verbose`
3. Validate splash/startup/login/update flows on a clean install.

## 10) Ownership Note
This handover intentionally prioritizes production stability over aggressive dependency churn.  
Future modernization (SDK major upgrade + security sweep) should be planned as a dedicated milestone, not mixed with hotfixes.

## 11) Documentation Continuity Update
To preserve institutional knowledge for future developers/agents:
1. `docs/` is now version-controlled in git.
2. A full commit/file manifest has been added in:
   - `docs/CHANGE_MANIFEST_2026-03-08.md`
3. Heavy artifacts stay ignored to keep repo size stable:
   - `docs/*.html`
   - `docs/*.docx`
