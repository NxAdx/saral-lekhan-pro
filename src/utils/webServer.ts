import { NativeModules, DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { useNotesStore } from '../store/notesStore';
import { log } from './Logger';

const { WebServerModule } = NativeModules;

let eventSubscription: EmitterSubscription | null = null;
let storeUnsubscribe: (() => void) | null = null;
let isServerRunning = false;

export const startWebShareServer = async (port: number = 8085): Promise<string | null> => {
  if (!WebServerModule) {
    log.warn('WebServerModule is not available on this device/environment.');
    return null;
  }

  try {
    const initialNotes = JSON.stringify(useNotesStore.getState().notes || []);
    const url: string = await WebServerModule.startServer(port, initialNotes);
    isServerRunning = true;

    // Listen to note edits from Web UI
    if (!eventSubscription) {
      eventSubscription = DeviceEventEmitter.addListener('onWebShareNotesUpdated', (payloadString: string) => {
        try {
          const data = JSON.parse(payloadString);
          if (data && data.action === 'save' && data.note && data.note.id) {
            const noteId = Number(data.note.id);
            const { title, body, tag } = data.note;
            useNotesStore.getState().updateNote(noteId, {
              title: title || '',
              body: body || '',
              tag: tag || '',
            });
            log.info(`Synced web edit for note #${noteId}`);
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

    log.info('Web Share server running at: ' + url);
    return url;
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

export const getWebShareServerUrl = async (): Promise<string | null> => {
  if (!WebServerModule) return null;
  try {
    return await WebServerModule.getServerUrl();
  } catch (error) {
    return null;
  }
};
