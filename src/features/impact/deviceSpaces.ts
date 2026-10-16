import { APP_STORE_NAME, useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { SpaceSnapshot } from './impact';

/** Tous les espaces de ce téléphone (l'espace ouvert est lu en mémoire, les autres dans le stockage). */
export function collectDeviceSpaces(): SpaceSnapshot[] {
  const { accounts, currentUserId } = useAuthStore.getState();
  return accounts.map((a) => {
    if (a.id === currentUserId) return { birthDate: a.birthDate, data: useAppStore.getState() };
    try {
      const raw = localStorage.getItem(`${APP_STORE_NAME}:${a.id}`);
      return { birthDate: a.birthDate, data: raw ? (JSON.parse(raw) as { state: SpaceSnapshot['data'] }).state : null };
    } catch {
      return { birthDate: a.birthDate, data: null };
    }
  });
}
