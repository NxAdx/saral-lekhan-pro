# Production Handover - 2026-06-27

## Context
This handover documents the investigation and implementation of selection mode fixes in versions `v2.19.9` and `v2.19.10` to resolve issues where the selection header didn't appear, tapping other notes navigated to the editor instead of selecting them, and unselected circles were invisible in dark mode.

Although we implemented state-to-data mapping to bypass `FlashList` recycling optimizations and corrected the dark mode border color collision, the user reported that the selection mode is still not working as expected. This document provides complete context for a future agent to pick up the task and troubleshoot.

## Key Changes Implemented

### 1. State-to-Data Mapping inside FlashList (`v2.19.10`)
- **Root Cause**: Shopify's `FlashList` performs aggressive optimizations. If the references of items in the `data` array do not change, it skips calling `renderItem` for visible cells (even if `extraData` changes). As a result, when selection mode was entered, the on-screen cells retained stale click closures (`isSelectionMode = false`), which caused taps on other notes to open the note editor instead of selecting/deselecting.
- **Fix**: In `src/app/(main)/index.tsx`, we mapped the selection state directly into each item object in the data array:
  ```typescript
  const dataToRender = useMemo(() => {
    return filteredNotes.map(note => ({
      ...note,
      isSelected: selectedIds.has(note.id),
      isSelectionMode,
    }));
  }, [filteredNotes, selectedIds, isSelectionMode]);
  ```
  We passed `data={dataToRender}` to `FlashList` and updated `renderItem` to read selection variables directly from the `item` parameter (e.g. `item.isSelected` and `item.isSelectionMode`). This forces `FlashList` to correctly re-run `renderItem` and update cell click handlers.
- **Header Element Restoration**: Restored `ListHeader` back to a static JSX element. Since the list re-renders on selection state changes, the header is cleanly recreated and diffed, displaying the selection header actions immediately without losing text input focus.

### 2. Selection Outline Visibility in Dark Mode (`v2.19.10`)
- **Root Cause**: The empty circle indicator of unselected notes in selection mode used `borderColor: colors.strokeDim`. In almost all dark themes (such as `classic.dark`), `colors.strokeDim` and the card background `colors.bgRaised` carry the exact same hex code (e.g. `#2B2926`), rendering the selection circle completely invisible.
- **Fix**: In `src/components/ui/BentoCard.tsx`, we changed `borderColor: colors.strokeDim` to `borderColor: colors.stroke` for the `unselectedIcon` style block. This provides high contrast and full visibility across all light and dark themes.

### 3. Version Bump & Metadata
- **Version**: Bumped to `2.19.10`
- **androidVersionCode**: Bumped to `111`
- **Releases**: Logged in `CHANGELOG.md` and `docs/RELEASES/v2.19.10.md`.

---

## Troubleshooting Guide for the Next Agent

If the user reports that selection is still broken, investigate the following areas:

### 1. Build Version and Cache Verification
- **Symptom**: The user is running an older build (e.g., v2.19.9, v2.19.1, or older) where the fix is not present.
- **Action**: Direct the user to check **Settings -> About** to confirm if the running version displays **2.19.10**. If the OTA updater failed or was not installed, they are still running buggy code.

### 2. Reanimated `Pressable` Gesture Conflicts
- **Symptom**: Long-press does not trigger selection mode, or tapping does not register.
- **Context**: `BentoCard` is wrapped in an `AnimatedPressable` (created via Reanimated's `Animated.createAnimatedComponent(Pressable)`).
- **Code snippet (`src/components/ui/BentoCard.tsx`)**:
  ```tsx
  <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => { pressed.value = 1; }}
      onPressOut={() => { pressed.value = 0; }}
      style={[s.card, animStyle]}
      delayLongPress={300}
      testID={`note-card-${note.id}`}
  >
  ```
- **Investigation**: Check if `onLongPress` is actually firing. If Reanimated's layout animation triggers a layout layout-transition or updates the layout thread, the touch gesture might be cancelled. Test replacing `AnimatedPressable` with React Native's standard `Pressable` to see if gesture handling is stable.

### 3. Immediate Selection Reset Effects
- **Symptom**: Long-press enters selection mode for a frame, but is immediately reset back to normal mode.
- **Context**: In `index.tsx`, we have a filter cleanup effect:
  ```tsx
  useEffect(() => {
    if (isSelectionMode) {
      clearSelection();
    }
  }, [selectedTag, debouncedSearchQuery]);
  ```
- **Investigation**: Check if setting `isSelectionMode = true` triggers a parent re-render that causes `selectedTag` or `debouncedSearchQuery` to momentarily change or re-initialize. If it does, the selection mode is instantly cleared on the next frame.

### 4. FlashList Component Caching
- **Investigation**: If `FlashList` still refuses to refresh cells, try substituting `FlashList` with a standard React Native `FlatList` in `index.tsx` to verify if the issue is completely tied to Shopify's layout recycler.
