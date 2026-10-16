import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/** Nom affiché à l'extérieur de l'app en mode discret (onglet, notifications, écran de verrouillage). */
export const NEUTRAL_NAME = 'Ma santé';
export const BRAND_NAME = 'ROSECONNECT';

/** Après ce délai en arrière-plan, l'app se verrouille en mode discret. */
export const AUTO_LOCK_MS = 60_000;

interface PrefsState {
  /** Mode discret : réglage de l'appareil (il protège aussi l'écran de connexion). */
  discreet: boolean;
  /** Espace verrouillé : le code secret est redemandé (non persisté). */
  locked: boolean;
  setDiscreet: (discreet: boolean) => void;
  lock: () => void;
  unlock: () => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      discreet: false,
      locked: false,
      setDiscreet: (discreet) => set({ discreet, locked: false }),
      lock: () => set((s) => (s.discreet ? { locked: true } : s)),
      unlock: () => set({ locked: false }),
    }),
    {
      name: 'roseconnect-prefs',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ discreet: s.discreet }),
    },
  ),
);

export function appName(): string {
  return usePrefsStore.getState().discreet ? NEUTRAL_NAME : BRAND_NAME;
}

export function useAppName(): string {
  return usePrefsStore((s) => (s.discreet ? NEUTRAL_NAME : BRAND_NAME));
}
