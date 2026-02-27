import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const G_TOKEN_KEY = 'sal_plus_g_token';
const G_EMAIL_KEY = 'sal_plus_g_email';
const LAST_SYNC_KEY = 'sal_plus_last_sync';

interface SyncState {
    googleToken: string | null;
    googleEmail: string | null;
    lastSync: number | null;
    isSyncing: boolean;

    loadSyncState: () => Promise<void>;
    setGoogleTokens: (token: string, email: string) => Promise<void>;
    clearGoogleTokens: () => Promise<void>;
    setLastSync: (time: number) => Promise<void>;
    setIsSyncing: (val: boolean) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
    googleToken: null,
    googleEmail: null,
    lastSync: null,
    isSyncing: false,

    loadSyncState: async () => {
        try {
            const token = await SecureStore.getItemAsync(G_TOKEN_KEY);
            const email = await SecureStore.getItemAsync(G_EMAIL_KEY);
            const last = await SecureStore.getItemAsync(LAST_SYNC_KEY);

            set({
                googleToken: token,
                googleEmail: email,
                lastSync: last ? parseInt(last, 10) : null
            });
        } catch (e) {
            console.warn("Failed to load sync state");
        }
    },

    setGoogleTokens: async (token, email) => {
        try {
            await SecureStore.setItemAsync(G_TOKEN_KEY, token);
            await SecureStore.setItemAsync(G_EMAIL_KEY, email);
            set({ googleToken: token, googleEmail: email });
        } catch (e) {
            console.warn("Failed to save tokens");
        }
    },

    clearGoogleTokens: async () => {
        try {
            await SecureStore.deleteItemAsync(G_TOKEN_KEY);
            await SecureStore.deleteItemAsync(G_EMAIL_KEY);
            await SecureStore.deleteItemAsync(LAST_SYNC_KEY);
            set({ googleToken: null, googleEmail: null, lastSync: null });
        } catch (e) {
            console.warn("Failed to clear sync tokens");
        }
    },

    setLastSync: async (time) => {
        try {
            await SecureStore.setItemAsync(LAST_SYNC_KEY, time.toString());
            set({ lastSync: time });
        } catch (e) {
            console.warn("Failed to set last sync");
        }
    },

    setIsSyncing: (val) => set({ isSyncing: val })
}));
