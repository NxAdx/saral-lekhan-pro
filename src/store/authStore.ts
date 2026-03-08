import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { log } from '../utils/Logger';

const BIOMETRIC_ENABLED_KEY = 'saral_lekhan_biometric_enabled';

interface AuthState {
    isBiometricEnabled: boolean;
    isUnlocked: boolean;
    isSupported: boolean;

    // Actions
    setSupported: (supported: boolean) => void;
    enableBiometric: (enabled: boolean) => Promise<void>;
    unlockApp: () => void;
    forceUnlock: () => void;
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

    forceUnlock: () => {
        log.warn("AuthStore: Force Unlock triggered (Bypassing biometrics)");
        set({ isUnlocked: true, isBiometricEnabled: false });
    },

    lockApp: () => {
        if (get().isBiometricEnabled) {
            set({ isUnlocked: false });
        }
    },

    initialize: async () => {
        log.info("AuthStore: Initializing...");
        
        // Safety: If SecureStore hangs, we must not block the app
        const authTimeout = setTimeout(() => {
            if (!get().isUnlocked && !get().isBiometricEnabled) {
                log.warn("AuthStore: Initialization timeout - defaulting to unlocked");
                set({ isUnlocked: true });
            }
        }, 3000);

        try {
            const isEnabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
            const enabled = isEnabled === 'true';
            set({
                isBiometricEnabled: enabled,
                isUnlocked: !enabled
            });
            log.info(`AuthStore: Ready (Enabled: ${enabled})`);
        } catch (e) {
            log.error('AuthStore: Failed to load biometric preference', e as any);
            set({ isUnlocked: true }); // Fallback to unlocked on error
        } finally {
            clearTimeout(authTimeout);
        }
    }
}));
