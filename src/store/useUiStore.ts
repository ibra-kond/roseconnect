import { create } from 'zustand';

export type SheetId = 'notifications' | 'sponsor' | 'prepare' | 'referral' | null;

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info';
}

interface UiState {
  sheet: SheetId;
  /** Pour le formulaire de parrainage : ville pré-remplie. */
  sheetCity: string | null;
  openSheet: (sheet: Exclude<SheetId, null>, city?: string | null) => void;
  closeSheet: () => void;

  toasts: Toast[];
  toast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;

  /** Effet « cœurs » lorsqu'une action est cochée « Fait ». */
  celebrateKey: number;
  celebrate: () => void;

  disclaimerExpanded: boolean;
  setDisclaimerExpanded: (v: boolean) => void;
}

let toastId = 0;

export const useUiStore = create<UiState>()((set) => ({
  sheet: null,
  sheetCity: null,
  openSheet: (sheet, city = null) => set({ sheet, sheetCity: city }),
  closeSheet: () => set({ sheet: null }),

  toasts: [],
  toast: (message, tone = 'success') => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, tone }] }));
    window.setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  celebrateKey: 0,
  celebrate: () => set((s) => ({ celebrateKey: s.celebrateKey + 1 })),

  disclaimerExpanded: false,
  setDisclaimerExpanded: (v) => set({ disclaimerExpanded: v }),
}));
