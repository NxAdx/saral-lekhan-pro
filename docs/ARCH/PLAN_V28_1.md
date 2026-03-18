# Implementation Plan - v2.8.1 Stability & UI Reversion

This update addresses a fatal crash during note deletion, corrects UI placement of support buttons, and improves editor formatting behavior.

## Proposed Changes

### [Component] Home Screen
- Revert header changes: Remove "History" and "Report Bug" icons.
- Remove redundant state/functions.

### [Component] Settings Screen
- Add "History" (Changelog) and "Report Bug" buttons back.
- Restoration of Support section.

### [Component] Note Editor
- **Quote Breakout**: Fix nested blockquote issue.

### [Component] UI Primitives
- **BentoCard**: Add null guard to prevent crash.
- **ThemedModal**: Fix high-contrast button labels.
