import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'saral_lekhan_biometric_enabled';

interface AuthState {
    isBiometricEnabled: boolean;
    isUnlocked: boolean;
    isSupported: boolean;

    // Actions
    setSupported: (supported: boolean) => void;
    enableBiometric: (enabled: boolean) => Promise<void>;
    unlockApp: () => void;
    lockApp: () => void;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isBiometricEnabled: false,
    isUnlocked: false, // Starts locked if biometric is enabled
    isSupported: false,

    setSupported: (supported) => set({ isSupported: supported }),

    enableBiometric: async (enabled) => {
        try {
            if (enabled) {
                await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
            } else {
                await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
            }
            set({ isBiometricEnabled: enabled });
        } catch (e) {
            console.error('Failed to save biometric preference', e);
        }
    },

    unlockApp: () => set({ isUnlocked: true }),

    lockApp: () => {
        if (get().isBiometricEnabled) {
            set({ isUnlocked: false });
        }
    },

    initialize: async () => {
        try {
            const isEnabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
            const enabled = isEnabled === 'true';
            set({
                isBiometricEnabled: enabled,
                // If it's not enabled, the app is "unlocked" by default
                isUnlocked: !enabled
            });
        } catch (e) {
            console.error('Failed to load biometric preference', e);
            set({ isUnlocked: true }); // Fallback to unlocked on error
        }
    }
}));
