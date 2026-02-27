import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: UIState['theme']) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}));
