import JSZip from 'jszip';
import * as FileSystem from 'expo-file-system';
import { useNotesStore } from '../store/notesStore';
import { log } from './Logger';

interface KeepLabel {
  name: string;
}

interface KeepListItem {
  text: string;
  isChecked: boolean;
}

interface KeepNoteJSON {
  title?: string;
  textContent?: string;
  listContent?: KeepListItem[];
  labels?: KeepLabel[];
  isTrashed?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  createdTimestampUsec?: number;
  userEditedTimestampUsec?: number;
}

export interface ImportResult {
  success: number;
  skipped: number;
  failed: number;
  error?: string;
}

/**
 * Parses a Google Keep Takeout ZIP file and imports notes into the store.
 * Expects a standard Takeout ZIP where each note is represented by a JSON file.
 * (HTML and other attachments are ignored in this initial implementation).
 */
export async function importGoogleKeepZip(zipUri: string): Promise<ImportResult> {
  const result: ImportResult = { success: 0, skipped: 0, failed: 0 };
  
  try {
    // Read the zip file as base64
    const zipBase64 = await FileSystem.readAsStringAsync(zipUri, { encoding: FileSystem.EncodingType.Base64 });
    
    const jszip = new JSZip();
    const loadedZip = await jszip.loadAsync(zipBase64, { base64: true });
    
    const files = Object.keys(loadedZip.files);
    
    // We only process .json files which hold the core note data
    const jsonFiles = files.filter(f => f.endsWith('.json') && !f.includes('__MACOSX'));
    
    const store = useNotesStore.getState();
    
    for (const filePath of jsonFiles) {
      try {
        const fileData = await loadedZip.files[filePath].async('string');
        const keepNote: KeepNoteJSON = JSON.parse(fileData);
        
        // Skip trashed notes
        if (keepNote.isTrashed) {
          result.skipped++;
          continue;
        }
        
        let title = keepNote.title || '';
        let body = '';
        // Determine type and extract content
        if (keepNote.listContent && keepNote.listContent.length > 0) {
          body = keepNote.listContent.map(item => `- [${item.isChecked ? 'x' : ' '}] ${item.text || ''}`).join('\n');
        } else if (keepNote.textContent) {
          body = keepNote.textContent;
          // Basic conversion to markdown if needed, but textContent is usually plain text
        } else if (!title) {
          // Empty note (no title, no content)
          result.skipped++;
          continue;
        }
        
        // Extract labels
        const tag = keepNote.labels && keepNote.labels.length > 0 ? keepNote.labels[0].name.replace(/\s+/g, '') : '';
        const allLabels = keepNote.labels ? keepNote.labels.map(l => l.name) : [];
        
        store.addNote({
          title,
          body,
          tag,
          pinned: keepNote.isPinned || false,
          labels: allLabels.length > 0 ? allLabels : null
        });
        
        result.success++;
      } catch (parseErr) {
        log.warn(`Failed to parse keep note JSON: ${filePath}`, parseErr);
        result.failed++;
      }
    }
    
    return result;
  } catch (err: any) {
    log.error('Failed to import Google Keep ZIP', err);
    result.error = err.message || 'Failed to read ZIP file';
    return result;
  }
}
