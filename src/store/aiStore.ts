import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const AI_KEY_STORE = 'saral_lekhan_gemini_api_key';

interface AiState {
    geminiApiKey: string | null;
    isKeyLoaded: boolean;
    setGeminiApiKey: (key: string) => Promise<void>;
    initialize: () => Promise<void>;
    removeKey: () => Promise<void>;
}

export const useAiStore = create<AiState>((set) => ({
    geminiApiKey: null,
    isKeyLoaded: false,

    setGeminiApiKey: async (key: string) => {
        try {
            await SecureStore.setItemAsync(AI_KEY_STORE, key);
            set({ geminiApiKey: key, isKeyLoaded: true });
        } catch (e) {
            console.error('Failed to save Gemini API key', e);
        }
    },

    removeKey: async () => {
        try {
            await SecureStore.deleteItemAsync(AI_KEY_STORE);
            set({ geminiApiKey: null, isKeyLoaded: true });
        } catch (e) {
            console.error('Failed to remove Gemini API key', e);
        }
    },

    initialize: async () => {
        try {
            const key = await SecureStore.getItemAsync(AI_KEY_STORE);
            set({
                geminiApiKey: key,
                isKeyLoaded: true
            });
        } catch (e) {
            console.error('Failed to load Gemini API key', e);
            set({ isKeyLoaded: true });
        }
    }
}));
