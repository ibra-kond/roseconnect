import { useEffect } from 'react';
import { useUiStore } from '@/store/useUiStore';
import { strings } from '@/lib/strings.fr';
import { usePrefsStore } from '@/store/usePrefsStore';

/** Enregistre le service worker (mode hors ligne) et prévient quand l'app est prête. */
export function usePwa() {
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    let cancelled = false;
    import('virtual:pwa-register').then(({ registerSW }) => {
      if (cancelled) return;
      registerSW({
        immediate: true,
        onOfflineReady() {
          const discreet = usePrefsStore.getState().discreet;
          useUiStore.getState().toast(discreet ? strings.app.offlineReadyNeutral : strings.app.offlineReady, 'info');
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const off = () => useUiStore.getState().toast(strings.app.offline, 'info');
    window.addEventListener('offline', off);
    return () => window.removeEventListener('offline', off);
  }, []);
}
