/**
 * Enriched Note types — inspired by simple-notes-sync Note.kt
 *
 * These types extend our existing note model with:
 * - syncStatus: WebDAV sync state tracking
 * - labels: multi-label tagging (future, alongside existing single `tag`)
 *
 * All new fields have safe defaults so existing notes work without migration issues.
 */

/** Sync status for WebDAV integration */
export type SyncStatus = 'local_only' | 'synced' | 'pending' | 'conflict' | 'deleted_on_server';


