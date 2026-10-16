import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { today } from '@/lib/dates';
import { getUpcomingReminders } from './logic';
import { notifyReminder } from './notify';

/** Au lancement et au retour sur l'app : notifie les rappels arrivés à échéance. */
export function useReminderChecker() {
  useEffect(() => {
    const check = () => {
      const t = today();
      getUpcomingReminders(useAppStore.getState())
        .filter((r) => r.date <= t)
        .forEach((r) => notifyReminder(r.kind, `${r.kind}:${r.date}`));
      // Boucle de suivi : « Êtes-vous allée au centre recommandé ? »
      const f = useAppStore.getState().followUp;
      if (f?.status === 'pending' && f.checkAfter <= t) notifyReminder('followup', `followup:${f.checkAfter}`);
    };
    const timer = window.setTimeout(check, 1200);
    const onVisible = () => document.visibilityState === 'visible' && check();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
