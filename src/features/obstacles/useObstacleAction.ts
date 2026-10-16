import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ObstacleActionType } from '@/data/obstacles';
import { useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';

/** Exécute le bouton d'action associé à un obstacle. */
export function useObstacleAction() {
  const navigate = useNavigate();
  const openSheet = useUiStore((s) => s.openSheet);
  const city = useAppStore((s) => s.profile.city);
  return useCallback(
    (type: ObstacleActionType) => {
      switch (type) {
        case 'facilities':
          navigate(`/aide?onglet=structures${city ? `&ville=${encodeURIComponent(city)}` : ''}`);
          break;
        case 'chat':
          navigate('/aide?onglet=discuter');
          break;
        case 'sponsor':
          openSheet('sponsor', city);
          break;
        case 'prepare':
          openSheet('prepare');
          break;
      }
    },
    [navigate, openSheet, city],
  );
}
