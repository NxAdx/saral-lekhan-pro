/**
 * Enriched Note types — inspired by simple-notes-sync Note.kt
 *
 * These types extend our existing note model with:
 * - noteType: text vs checklist mode
 * - checklistItems: structured checklist data
 * - folderName: folder organization
 * - syncStatus: WebDAV sync state tracking
 * - labels: multi-label tagging (future, alongside existing single `tag`)
 *
 * All new fields have safe defaults so existing notes work without migration issues.
 */

/** The type of note content */
export type NoteType = 'text' | 'checklist';

/** Sync status for WebDAV integration */
export type SyncStatus = 'local_only' | 'synced' | 'pending' | 'conflict' | 'deleted_on_server';

/** A single checklist item within a checklist note */
export interface ChecklistItem {
  /** Unique identifier for the item */
  id: string;
  /** The text content of the checklist item */
  text: string;
  /** Whether the item is checked/completed */
  isChecked: boolean;
  /** Sort order (0-based). Used for manual ordering. */
  order: number;
}

/** Available sort options for checklist items */
export type ChecklistSortOption = 'manual' | 'alphabetical' | 'checked_last';

/**
 * Generates a unique ID for a checklist item.
 * Uses timestamp + random suffix to avoid collisions.
 */
export function generateChecklistItemId(): string {
  return `cli_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Parses plain text lines into checklist items.
 * Supports GitHub-flavored markdown task list syntax:
 *   - [ ] unchecked item
 *   - [x] checked item
 * Also handles plain lines without checkbox markers.
 */
export function textToChecklistItems(text: string): ChecklistItem[] {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  return lines.map((line, index) => {
    const trimmed = line.trim();
    // Match GFM task list: "- [ ] text" or "- [x] text" or "[x] text" or "[ ] text"
    const taskMatch = trimmed.match(/^[-*]?\s*\[([ xX])\]\s*(.*)$/);
    if (taskMatch) {
      return {
        id: generateChecklistItemId(),
        text: taskMatch[2].trim(),
        isChecked: taskMatch[1].toLowerCase() === 'x',
        order: index,
      };
    }
    // Plain text line — treat as unchecked item
    // Strip leading "- " or "* " bullet markers
    const bulletStripped = trimmed.replace(/^[-*]\s+/, '');
    return {
      id: generateChecklistItemId(),
      text: bulletStripped,
      isChecked: false,
      order: index,
    };
  });
}

/**
 * Serializes checklist items back to GitHub-flavored markdown task list.
 * This is used when switching from checklist → text mode, and for
 * backward-compatible display in older app versions.
 */
export function checklistItemsToText(items: ChecklistItem[]): string {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map(item => `- [${item.isChecked ? 'x' : ' '}] ${item.text}`)
    .join('\n');
}

/**
 * Sorts checklist items based on the given sort option.
 * Returns a new array (does not mutate the input).
 */
export function sortChecklistItems(
  items: ChecklistItem[],
  sortOption: ChecklistSortOption
): ChecklistItem[] {
  const sorted = [...items];
  switch (sortOption) {
    case 'alphabetical':
      sorted.sort((a, b) => a.text.localeCompare(b.text));
      break;
    case 'checked_last':
      sorted.sort((a, b) => {
        if (a.isChecked === b.isChecked) return a.order - b.order;
        return a.isChecked ? 1 : -1;
      });
      break;
    case 'manual':
    default:
      sorted.sort((a, b) => a.order - b.order);
      break;
  }
  // Re-assign order indices after sorting
  return sorted.map((item, index) => ({ ...item, order: index }));
}
