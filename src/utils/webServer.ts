import { NativeModules, DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { useNotesStore } from '../store/notesStore';
import { log } from './Logger';

const { WebServerModule } = NativeModules;

export interface NetworkEndpointInfo {
  ip: string;
  url: string;
  type: 'hotspot' | 'wifi' | 'ethernet' | 'lan' | 'fallback';
  label: string;
}

export interface WebShareServerState {
  isRunning: boolean;
  primaryUrl: string | null;
  port: number;
  endpoints: NetworkEndpointInfo[];
}

let eventSubscription: EmitterSubscription | null = null;
let storeUnsubscribe: (() => void) | null = null;
let isServerRunning = false;

export const startWebShareServer = async (port: number = 8085): Promise<WebShareServerState | null> => {
  if (!WebServerModule) {
    log.warn('WebServerModule is not available on this device/environment.');
    return null;
  }

  try {
    const initialNotes = JSON.stringify(useNotesStore.getState().notes || []);
    const res: any = await WebServerModule.startServer(port, initialNotes);
    isServerRunning = true;

    // Listen to note actions from Web UI (save, create, delete, restore, permanentlyDelete, emptyTrash)
    if (!eventSubscription) {
      eventSubscription = DeviceEventEmitter.addListener('onWebShareNotesUpdated', (payloadString: string) => {
        try {
          const data = JSON.parse(payloadString);
          if (!data) return;

          const notesStore = useNotesStore.getState();

          if (data.action === 'save' && data.note && data.note.id) {
            const noteId = Number(data.note.id);
            const { title, body, tag, pinned, folder_name } = data.note;
            notesStore.updateNote(noteId, {
              title: title || '',
              body: body || '',
              tag: tag || '',
              pinned: !!pinned,
              folder_name: folder_name || null,
            });
            log.info(`Synced web edit for note #${noteId}`);
          } else if (data.action === 'create' && data.note) {
            const { title, body, tag, pinned, folder_name } = data.note;
            const newId = notesStore.addNote({
              title: title || 'Untitled',
              body: body || '',
              tag: tag || '',
              pinned: !!pinned,
              folder_name: folder_name || null,
            });
            log.info(`Created new note from web #${newId}`);
          } else if (data.action === 'delete' && data.noteId) {
            const noteId = Number(data.noteId);
            notesStore.deleteNote(noteId);
            log.info(`Moved note #${noteId} to trash from web`);
          } else if (data.action === 'restore' && data.noteId) {
            const noteId = Number(data.noteId);
            notesStore.restoreNote(noteId);
            log.info(`Restored note #${noteId} from trash from web`);
          } else if (data.action === 'permanentlyDelete' && data.noteId) {
            const noteId = Number(data.noteId);
            notesStore.permanentlyDeleteNote(noteId);
            log.info(`Permanently deleted note #${noteId} from web`);
          } else if (data.action === 'emptyTrash') {
            notesStore.emptyTrash();
            log.info(`Emptied trash from web`);
          }
        } catch (error) {
          log.error('Error processing web share notes update event', error as any);
        }
      });
    }

    // Automatically sync state changes to native server when app edits notes
    if (!storeUnsubscribe) {
      storeUnsubscribe = useNotesStore.subscribe((state) => {
        if (isServerRunning && WebServerModule) {
          WebServerModule.updateNotesData(JSON.stringify(state.notes || []));
        }
      });
    }

    const state: WebShareServerState = {
      isRunning: true,
      primaryUrl: res?.primaryUrl || `http://127.0.0.1:${port}`,
      port: res?.port || port,
      endpoints: Array.isArray(res?.endpoints) ? res.endpoints : [],
    };

    log.info('Web Share server running at: ' + state.primaryUrl);
    return state;
  } catch (error) {
    log.error('Failed starting web share server', error as any);
    return null;
  }
};

export const stopWebShareServer = async (): Promise<boolean> => {
  if (!WebServerModule) return false;
  try {
    isServerRunning = false;
    await WebServerModule.stopServer();
    if (eventSubscription) {
      eventSubscription.remove();
      eventSubscription = null;
    }
    if (storeUnsubscribe) {
      storeUnsubscribe();
      storeUnsubscribe = null;
    }
    log.info('Web Share server stopped');
    return true;
  } catch (error) {
    log.error('Failed stopping web share server', error as any);
    return false;
  }
};

export const updateWebShareNotes = async (): Promise<void> => {
  if (!isServerRunning || !WebServerModule) return;
  try {
    const currentNotes = JSON.stringify(useNotesStore.getState().notes || []);
    await WebServerModule.updateNotesData(currentNotes);
  } catch (error) {
    log.error('Failed updating web share notes data', error as any);
  }
};

export const getWebShareServerStatus = async (): Promise<WebShareServerState | null> => {
  if (!WebServerModule) return null;
  try {
    const res: any = await WebServerModule.getServerUrl();
    if (!res) return null;
    return {
      isRunning: !!res.isRunning,
      primaryUrl: res.primaryUrl || null,
      port: res.port || 8085,
      endpoints: Array.isArray(res.endpoints) ? res.endpoints : [],
    };
  } catch (error) {
    return null;
  }
};
