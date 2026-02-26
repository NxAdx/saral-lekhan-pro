import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontFamily = 'Hind' | 'Vesper Libre' | 'DM Mono';
export type AppLanguage = 'En' | 'Hi' | 'Bn' | 'Te' | 'Mr' | 'Ta';

interface SettingsState {
    fontFamily: FontFamily;
    language: AppLanguage;
    pureBlack: boolean;
    dynamicAccent: boolean;
    reduceMotion: boolean;

    setFontFamily: (f: FontFamily) => void;
    setLanguage: (l: AppLanguage) => void;
    setPureBlack: (b: boolean) => void;
    setDynamicAccent: (d: boolean) => void;
    setReduceMotion: (r: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            fontFamily: 'Hind',
            language: 'Hi',
            pureBlack: false,
            dynamicAccent: false,
            reduceMotion: false,
            setFontFamily: (f) => set({ fontFamily: f }),
            setLanguage: (l) => set({ language: l }),
            setPureBlack: (b) => set({ pureBlack: b }),
            setDynamicAccent: (d) => set({ dynamicAccent: d }),
            setReduceMotion: (r) => set({ reduceMotion: r }),
        }),
        {
            name: 'saral-lekhan-settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
