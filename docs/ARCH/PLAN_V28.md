# Production Refinements (v2.8.0)

This plan addresses final UI polishing and critical fixes for image rendering.

## Proposed Changes

### [Component] Home Screen (index.tsx)
- [MODIFY] [index.tsx](file:///d:/Development/Production/saral-lekhan-plus/src/app/(main)/index.tsx):
    - **Top Bar**: Add "History" (Changelog) and "Report Bug" icons to the `headerRight` section.
    - **Logic**: 
        - Promote `showChangelog` state and modal from Settings to Home.
        - Add `handleReportBug` logic to Home screen as well (or keep it shared).
    - **Import**: Remove `application/pdf` from `DocumentPicker.getDocumentAsync` types and update UI hints.

### [Component] Note Editor ([id].tsx)
- [MODIFY] [[id].tsx](file:///d:/Development/Production/saral-lekhan-plus/src/app/editor/[id].tsx):
    - **Image Fix**: In `handlePickImage`, convert the captured image URI to a Base64 string before inserting it into the `RichEditor`. This ensures the rendering engine can always access the data without permission issues.

### [Component] Settings Screen (settings.tsx)
- [MODIFY] [settings.tsx](file:///d:/Development/Production/saral-lekhan-plus/src/app/(main)/settings.tsx):
    - Remove the redundant Changelog button from the header since it's now on the Home screen.

## Verification Plan
### Manual Verification
- **Top Bar**: Verify both icons appear and function on the Home screen.
- **Import**: Try to import a PDF; it should not be selectable or should show an error if forced.
- **Images**: Pick an image from the gallery and verify it appears immediately in the editor and persists after reload.
