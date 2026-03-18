# Bug Reporting & Crash Fix Plan (v2.7.0)

This plan outlines the implementation of a bug tracking system and the resolution of a crash occurring when re-opening notes.

## Proposed Changes

### [Component] Logger Utility
- [NEW] [Logger.ts](file:///d:/Development/Production/saral-lekhan-plus/src/utils/Logger.ts): A singleton utility to capture logs (info, warn, error) and store them in a local log buffer. This buffer can be exported as a string for bug reports.

### [Component] Settings Screen
- [MODIFY] [settings.tsx](file:///d:/Development/Production/saral-lekhan-plus/src/app/(main)/settings.tsx):
    - Add a "Report Bug" section under "Aesthetics" or a new "Support" section.
    - Button to "Copy Debug Logs" and "Email Bug Report".
    - Bug report will include: App Version, Device OS, Device Model, and recent logs.

### [Component] Note Editor
- [MODIFY] [[id].tsx](file:///d:/Development/Production/saral-lekhan-plus/src/app/editor/[id].tsx):
    - **Crash Resolution**: 
        - Wrap `injectJavascript` in a mount-safe check.
        - Ensure `RichEditor` ref is correctly handled during navigation.
        - Add a small delay/guard before `RichEditor` initialization if `id` hasn't changed.
        - Potential issue: `useContainer={true}` might be causing layout thrashing on re-entry.
        - Add `ErrorBoundary` concept if possible, or at least `try-catch` on lifecycle methods.

## Verification Plan
### Manual Verification
- **Bug Reporting**: 
    1. Navigate through app to generate logs.
    2. Go to Settings -> Report Bug.
    3. Verify logs are copied/shared correctly.
- **Crash Fix**: 
    1. Open a note.
    2. Go back to Home.
    3. Open the **same** note again.
    4. Repeat 10 times to ensure stability.
