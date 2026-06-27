# Changelog

## v2.19.15 - Perfect TagPill UI Restoration
- **Reverted TagPill to Stable Layout**: Reverted the underlying flexbox layout of `TagPill` to exactly match the stable version from `v2.19.10` (before the UI regressions occurred), while preserving the safe dynamic font scaling fix. This guarantees the tags render perfectly as they used to.

## v2.19.14 - Definitively Fix TagPill Text Clipping
- **Tag Rendering Fixed**: On certain Android devices, `includeFontPadding: false` causes complete vertical text clipping if the device font metrics have zero height. Removed this property. Also enforced a strict `Math.max` for tag font size so it can never shrink below `10px` regardless of the user's base multiplier.

## v2.19.13 - Eliminate State Desync in Selection Mode
- **Architectural Fix for Selection State**: Completely eliminated the root cause of the "first note doesn't select" bug. Previously, the selection UI mode (`isSelectionMode`) and the underlying selected items list (`selectedIds`) were two separate React state variables synchronized via `useEffect`. Under certain race conditions, one would update without the other. This has been refactored so that `isSelectionMode` is purely derived from `selectedIds.size > 0`. This makes it mathematically impossible for the UI to be desynced from the actual selection state.

## v2.19.12 - Tag Visibility and Selection Reliability Fix
- **Fix Tag Visibility**: Added fallback values for `fontSize` calculations in `themeStore` and `TagPill`. If local storage evaluates to `NaN` or `undefined` (which shrinks tags to invisible dots), it now safely defaults to `1.0`.
- **Fix Selection Race Condition**: Refactored the `FlatList` component to determine selection status (`selectedIds.has(item.id)`) *inside* the `renderItem` closure instead of relying on a `.map()` copy array (`dataToRender`). Added `isSelectionMode` and `selectedIds` directly to the `useCallback` dependency array. This guarantees that `FlatList` sees a new component reference when state changes and accurately re-renders all cells in place without caching stale items (which previously caused the first long-press to malfunction).
- **Root Cause Confirmed**: Shopify's `FlashList` caches `ListHeaderComponent` and does NOT re-render it when state changes (confirmed via Shopify docs and GitHub issues). This is why the selection header never appeared despite `isSelectionMode` being `true`.
- **FlashList → FlatList**: Replaced `@shopify/flash-list` with React Native's standard `FlatList`. `FlatList` correctly re-renders all cells and respects `extraData` without recycler caching interference.
- **Header Extracted from List**: Moved the selection header, search bar, and tag rail completely outside the `FlatList` and into the parent component's render tree. This guarantees React always re-renders the header instantly on state transitions — no list component caching can interfere.

## v2.19.10 - Selection State Mapped Rendering & Visibility Fixes
- **State-to-Data Mapping**: Mapped `isSelected` and `isSelectionMode` directly onto each note object in a computed `dataToRender` array passed to `FlashList`. This forces FlashList's diffing engine to reliably redraw all visible items and the header component on selection state transitions, completely bypassing closure-stretching and recycling lags.
- **Unselected Outline Visibility**: Changed the border color of `unselectedIcon` in `BentoCard` from `strokeDim` to `stroke`. In almost all dark themes, `strokeDim` matches the card background color, rendering the empty selection rings invisible. The new `stroke` color provides high contrast and full visibility.

## v2.19.9 - FlashList Stale Render Resolution
- **Memoized Callbacks Fix**: Converted static `ListHeader` JSX element and inline `renderItem` into memoized functional callbacks (`renderHeader`, `renderItem`) utilizing `useCallback` with explicit dependency tracking.
- **Selection State Sync**: Configured a custom `extraData` dependency object that forces Shopify's `FlashList` to reliably re-evaluate cell renderers and header components on selection mode transitions, resolving stale closure bugs where selecting a note didn't update the header or tap behaviors on other notes.

## v2.19.8 - FlashList Refresh Enforcement
- **FlashList Stale Updates Fix**: Enforced array reference changes for the `data` prop of `FlashList` during selection transitions, forcing the list diffing engine to reliably re-render all visible cards and the list header.

## v2.19.7 - Selection Mode Lifecycle Polish
- **Pruning Effect Fix**: Removed the background `useEffect` prune watcher which was prematurely resetting the active selection states due to asynchronous list filter recalculation timing. Added event-driven clear triggers when tags or search queries change.
- **Robust Item Rendering**: Simplified `extraData` tracking on the note container list so cell view updates are forced on all mode transitions.

## v2.19.6 - Selection Header Updates
- **Selection Header Fix**: Removed `useMemo` caching from the home page `ListHeader` layout to ensure selection actions and active note selection states update instantly without relying on FlatList/FlashList internal cache triggers.

## v2.19.5 - Duplicate Key Resolution
- **Duplicate Key Fix**: Resolved a critical duplicate `version` key issue at the bottom of `package.json` that was overriding the target build version and keeping it hardcoded at `2.19.1` in production builds. The app will now properly build and publish as `2.19.5`.

## v2.19.4 - Version Sync Fixes
- **Version Configuration Fix**: Fixed an issue where the Expo configuration (`app.config.js`) was trying to read an undefined version field from `package.json`, causing the app to silently fall back to an older cached version during builds. The app will now correctly compile with the latest version number (`2.19.4`) and apply all recent UI fixes.

## v2.19.3 - Updater Testing Release
- **Version Bump**: Bumped version specifically to test the in-app OTA GitHub release updater workflow.

## v2.19.2 - Selection UI & Logic Fixes
- **Selection Layout Fix**: Redesigned the selection mode header into a two-row layout so the Delete and Export buttons are prominently visible on narrow mobile screens.
- **Visual Selection Indicators**: Added a clear empty circular ring to unselected cards when in selection mode, making it visually obvious that they can be selected.
- **Selection Mode Freezing Fix**: Fixed a critical logic bug (React Hook infinite loop) that caused the app to completely freeze when tapping buttons during selection mode.
- **Tap Responsiveness**: Rewrote the underlying FlashList state rendering logic so tapping cards instantly updates their visual selection state without stale cache issues.
- **Updater Diagnostics**: Added detailed version comparison logging for the in-app updater to assist with remote debugging.

## v2.19.1 - Stability & UX Polish
- **Live Preview:** Added an Edit/Preview toggle in the markdown editor for instant rich-text visualization.
- **Selection Mode Fixes:** Added a "Select All" button and removed bouncy animations during bulk selection for a faster, stable experience.
- **Checklist Removed:** Completely removed the Checklist feature to keep the app strictly Markdown-first.
- **Crisp Icons:** Replaced custom toolbar icons with standard vector icons for a premium look.
- **Editor Stability:** Reverted to a stable WebView container pattern for the Rich Editor to fix crashes and broken scrolling on Android.
- **Editor Layout:** Removed redundant keyboard height padding that caused text to be obscured behind the toolbar. The editor now relies securely on Android's native window resizing.
- **Delete UI Fix:** Fixed an ugly "Not Found" flicker that occurred when deleting a note by delaying the deletion until the navigation transition finishes.

## v2.19.0 - Editor Rewrite & UI Polish
- **Pure Native Editor:** Replaced the legacy WebView rich text editor with a lightning-fast native Markdown text box. Perfect 60FPS scrolling and instant keyboard responsiveness.
- **Dual-Mode Magic:** A new View Mode automatically renders your Markdown into beautiful headings and lists.
- **Consolidated Category Rail:** Replaced the clunky double-rails for folders and tags into a single, unified, horizontal category filter on the home screen.
- **OTA Updates Re-Enabled:** The in-app updater and remote UX flags have been fully re-enabled.
- **Premium UX:** Replaced all formatting toolbar buttons with rounded, vector-perfect icons.
- **Backwards Compatibility:** Old notes seamlessly auto-convert their legacy HTML into clean Markdown without losing formatting.

## [2.18.0] - 2026-06-11
### Added
- **Checklist Mode**: Added a dedicated checklist editor for notes. Users can seamlessly toggle a note between standard rich text and an interactive checklist, complete with drag-and-drop reordering.
- **Folder Organization**: Added the ability to organize notes into Folders. The Home Screen now features a dual-rail filter system for folders and context-aware tags.
- **Google Keep Import**: Added native support for importing Google Keep Takeout `.zip` files directly from the Home Screen. Checklists, text, and labels map seamlessly into the local database.
- **Markdown Export Enhancements**: Markdown exports now include full YAML frontmatter containing tags, folders, pinned status, and dates for perfect compatibility with Obsidian and Joplin.

### Changed
- SQLite Database schema migrated to support enriched `Note` properties safely (backward-compatible).
