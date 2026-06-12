# Production Handover - 2026-06-12

## Context
This handover documents the resolution of severe regressions reported by the user following a previous feature update and an F-Droid metadata integration attempt. The user reported the following critical issues:
1.  **Updater Breakage**: The GitHub updater logic was broken after F-Droid build flavors were hardcoded into the project via `BuildInfoModule`.
2.  **Editor UX Regressions**: The editor was glitchy, formatting effects were not visible (WYSIWYG lost), and the toolbar hid under the keyboard due to the introduction of a faulty `NativeMarkdownEditor`.
3.  **Home Screen Selection/Deletion Logic**: Deleting items did not immediately reflect in the UI (items lingered until the trash was emptied) and long-pressing items to select them failed to show visual feedback.

## Key Changes Implemented

### 1. GitHub Updater Restored
-   **Removed F-Droid Hardcoding**: Completely removed the custom Android modules (`android/app/src/main/java/com/sarallekhan/BuildInfoModule.java` and `BuildInfoPackage.java`) that forced `updaterMode` to `"fdroid"`.
-   **Cleaned up React Native Hooks**: Deleted `src/utils/buildInfo.ts` and refactored `githubUpdater.ts` and `runtimeUxFlagsStore.ts` to rely on standard `expo-constants` (`Constants.expoConfig?.extra` / `Constants.manifest?.extra`).
-   *The app now correctly checks GitHub for new releases.*

### 2. Editor Stabilized
-   **Reverted to RichTextEditor**: The experimental `NativeMarkdownEditor.tsx` was completely deleted. We fully restored the stable `RichTextEditor.tsx` (using `react-native-pell-rich-editor`).
-   **WYSIWYG Restored**: Users can now see formatting effects live as they type.
-   **Toolbar & Icons Fixed**: Re-linked the correct Feathers/Custom icons for the MarkdownToolbar and removed the unwanted "checklist" feature button.
-   **Keyboard Insets**: The editor layout was updated to correctly pad above the keyboard, preventing the toolbar from hiding.

### 3. Selection & Deletion Logic Fixed
-   **Visual Selection Fixed**: Added `extraData={[selectedIds, isSelectionMode, loc]}` to the `FlashList` in `src/app/(main)/index.tsx`. This ensures that state changes to `selectedIds` trigger a visual re-render of the list items so the user can actually see what they are selecting.
-   **Deleted Items UI Update Fixed**: Restored the usage of `getNotesFilteredByTag` from the `notesStore` so that deleted items instantly drop out of the list view.
-   **Selection Cleanup Effect**: Added a `useEffect` inside `index.tsx` that sanitizes the `selectedIds` state. If a user deletes a note from inside the editor screen and navigates back, the deleted note's ID is safely removed from `selectedIds` to avoid crashes.

## Important Note for Future Agents
-   **Do NOT Reintroduce `NativeMarkdownEditor`**: The user strongly dislikes the lack of WYSIWYG support and the bugs associated with it. Stick to `RichTextEditor`.
-   **Updater Logic**: The project uses `githubUpdater.ts` relying on `expo-constants`. Avoid hardcoding build flavor logics via Java modules unless explicitly maintaining dual build pipelines using Gradle Product Flavors (which was causing conflicts).
-   **Zustand Filtering**: When filtering items from the store to display in lists, rely on store selectors like `getNotesFilteredByTag` rather than inline `.filter()` calls inside components to avoid breaking React's memoization and `FlashList` rendering optimizations.
