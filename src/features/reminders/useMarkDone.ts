import { useCallback } from 'react';
import { useAppStore, type ReminderKind } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';
import { strings } from '@/lib/strings.fr';

/** Coche « Fait » : historique + rappel suivant + petite célébration. */
export function useMarkDone() {
  const markDone = useAppStore((s) => s.markDone);
  const celebrate = useUiStore((s) => s.celebrate);
  const toast = useUiStore((s) => s.toast);
  return useCallback(
    (kind: ReminderKind) => {
      markDone(kind);
      celebrate();
      toast(strings.tracking.markedDone);
    },
    [markDone, celebrate, toast],
  );
}
