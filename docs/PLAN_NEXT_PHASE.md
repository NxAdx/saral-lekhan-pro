# Saral Lekhan Production Stabilization and Incremental Roadmap

## Summary
- Stabilize launch first: target a true single-splash path on the current Expo 49 / RN 0.72 baseline, and keep a contained upgrade subphase ready if that stack still cannot deliver Vinyas-level single-splash behavior on Android 12+.
- Normalize public branding from `saral-lekhan` to `Saral Lekhan` everywhere user-visible, while keeping package IDs, slug, and deep-link scheme unchanged.
- Keep editor work incremental on the current `react-native-pell-rich-editor` stack; first feature is checklist support, not a block-editor rewrite.
- Keep widgets Android-first; first widget is quick capture.

## Key Changes
- Splash stabilization:
  - Define one splash authority: native splash stays branded; `AppTheme` and the JS pre-ready tree become non-branded continuity surfaces only.
  - Remove launch-path duplication caused by showing splash-like branding after the native splash handoff.
  - Reduce startup blocking to first-frame essentials only; move non-critical startup work off the splash-critical path where safe.
  - Audit Android launch theme, `MainActivity`, Expo splash hold/hide, and root layout together; compare against Vinyas behavior but do not reuse unsupported `SplashScreenManager` APIs on SDK 49.
  - If SDK 49 still shows a perceptible second branded phase after the constrained fix, execute a dedicated Expo/RN upgrade subphase and regenerate the splash path using the newer plugin-based native integration.
- Production hardening:
  - Treat GitHub Actions Node 24 runtime as the baseline and keep workflow changes verification-only unless a regression is found.
  - Do a dependency health pass limited to supported, stack-compatible updates and deprecation cleanup; do not do a blanket “latest everything” sweep before production.
  - Update changelog, release notes, and internal docs to record the splash baseline, branding baseline, and production rules.
- Branding:
  - Change installed app label and all user-facing app-name strings to `Saral Lekhan`.
  - Align Expo display name, Android `app_name`, settings/about text, updater text, and changelog headers to the same public brand.
  - Keep `slug`, Android package, and existing updater/release plumbing unchanged in this cycle.
- Editor roadmap:
  - Add checklist insertion and persistence using HTML-backed task-list markup that survives edit, save, reopen, export, and import flows.
  - Add read/render parity so checklist content is intentional outside the editor, not only inside the WebView.
  - Suggested incremental Notion-like wave after checklist: divider, callout block, quote, inline code/code block, and slash-style quick insert.
  - Explicitly defer collapsible toggles, tables, and database-style blocks until a future editor architecture project.
- Widget roadmap:
  - Build one Android home-screen quick-capture widget first.
  - Public interface addition: support deep links such as `sarallekhan://editor/new?source=widget&mode=note|checklist`.
  - Keep widget v1 as an app-launch shortcut, not background note mutation, to avoid native state and sync complexity near production.
- UX/UI polish:
  - Keep the current visual language and token system; do a consistency pass, not a redesign.
  - Standardize geometry across home, settings, and editor: header height, icon-button size, card rhythm, search density, spacing scale, toolbar hierarchy, and empty-state composition.
  - Focus the polish pass on launch/home, editor, and settings/update flow.

## Public Interfaces / Types
- Add widget deep-link contract for quick note and quick checklist entry.
- Add editor command/state support for checklist content and the minimum render support for divider, callout, quote, and code block.
- Keep note storage backward compatible; new content must degrade safely when old notes are reopened.

## Test Plan
- Android cold-launch validation on Android 11 and Android 12/13/14: one branded splash perception, no crash, no white/dark flash, no second logo phase.
- GitHub Actions validation on `main` and tag/release paths: build succeeds, Node 24 action-runtime warning absent, APK/AAB artifacts publish normally.
- Branding validation: installed launcher label shows `Saral Lekhan`; updater/about/changelog strings match.
- Editor validation: create, edit, save, reopen, export, and import notes containing checklist and new incremental blocks without corruption.
- Widget validation: quick note and quick checklist widget flows open correctly, survive reinstall/update, and do not break deep links or updater behavior.
- UX regression pass: home, settings, editor, lock screen, and splash transitions checked in light/dark modes and across multiple font scales.

## Assumptions
- Android remains the production priority; iOS widget parity is out of scope for this cycle.
- Package name, repo slug, and deep-link scheme remain unchanged unless a later full rebrand project is approved.
- “Use latest” means supported, stack-compatible updates in the production phase; major Expo/RN upgrades happen only in the explicit splash-upgrade subphase.
- If the constrained SDK 49 splash fix cannot reliably match the desired single-splash behavior, the plan proceeds to the upgrade subphase instead of layering more launch hacks.
