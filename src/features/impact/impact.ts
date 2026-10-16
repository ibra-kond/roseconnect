/**
 * Indicateurs d'impact, anonymes : aucun nom, uniquement des comptes.
 * « De l'inquiétude à l'action » : combien de femmes orientées vers un centre y sont allées.
 */
import { OBSTACLES, type ObstacleId } from '@/data/obstacles';
import { AGE_RANGES, ageToRange, type AgeRangeId } from '@/data/screening';
import type { AppData } from '@/store/useAppStore';
import { ageFromBirthDate, daysBetween, toISODate, today, type ISODate } from '@/lib/dates';

/** Un espace (compte), réduit aux seules données utiles au tableau. */
export interface SpaceSnapshot {
  birthDate: ISODate | null;
  data: Partial<Pick<AppData, 'followUp' | 'obstacles' | 'history'>> | null;
}

export interface ImpactStats {
  spaces: number;
  oriented: number;
  visited: number;
  /** Part des orientées allées au centre (0–1), `null` si personne n'a été orientée. */
  actionRate: number | null;
  medianDelayDays: number | null;
  selfExams90: number;
  obstacles: Array<{ id: ObstacleId; label: string; count: number }>;
  ages: Array<{ id: AgeRangeId; label: string; count: number }>;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const v = [...values].sort((a, b) => a - b);
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : Math.round((v[mid - 1] + v[mid]) / 2);
}

export function computeImpact(spaces: SpaceSnapshot[], ref: ISODate = today()): ImpactStats {
  let oriented = 0;
  let visited = 0;
  let selfExams90 = 0;
  const delays: number[] = [];
  const obstacleCounts = new Map<ObstacleId, number>();
  const ageCounts = new Map<AgeRangeId, number>();

  for (const { birthDate, data } of spaces) {
    if (birthDate) {
      const range = ageToRange(ageFromBirthDate(birthDate, ref));
      ageCounts.set(range, (ageCounts.get(range) ?? 0) + 1);
    }
    const f = data?.followUp;
    if (f) {
      oriented++;
      if (f.status === 'visited' && f.visitedAt) {
        visited++;
        delays.push(Math.max(0, daysBetween(toISODate(new Date(f.ts)), f.visitedAt)));
      }
    }
    for (const o of data?.obstacles ?? []) obstacleCounts.set(o, (obstacleCounts.get(o) ?? 0) + 1);
    selfExams90 += (data?.history ?? []).filter((h) => h.kind === 'self-exam' && daysBetween(h.date, ref) <= 90).length;
  }

  return {
    spaces: spaces.length,
    oriented,
    visited,
    actionRate: oriented ? visited / oriented : null,
    medianDelayDays: median(delays),
    selfExams90,
    obstacles: OBSTACLES.map((o) => ({ id: o.id, label: o.label, count: obstacleCounts.get(o.id) ?? 0 }))
      .filter((o) => o.count > 0)
      .sort((a, b) => b.count - a.count),
    ages: AGE_RANGES.map((r) => ({ id: r.id, label: r.label, count: ageCounts.get(r.id) ?? 0 })),
  };
}

/** Exemple de campagne Octobre Rose : DONNÉES FICTIVES, pour illustrer un déploiement. */
export const SAMPLE_IMPACT: ImpactStats = {
  spaces: 248,
  oriented: 97,
  visited: 61,
  actionRate: 61 / 97,
  medianDelayDays: 6,
  selfExams90: 412,
  obstacles: [
    { id: 'fear', label: 'Peur du résultat', count: 74 },
    { id: 'money', label: 'Manque d’argent', count: 58 },
    { id: 'shame', label: 'Honte ou gêne', count: 41 },
    { id: 'time', label: 'Manque de temps', count: 33 },
    { id: 'distance', label: 'Centre trop loin', count: 27 },
    { id: 'consent', label: 'Besoin de l’accord du conjoint ou de la famille', count: 19 },
    { id: 'where', label: 'Je ne sais pas où aller', count: 12 },
  ],
  ages: [
    { id: 'lt35', label: 'Moins de 35 ans', count: 86 },
    { id: '35-39', label: '35 à 39 ans', count: 52 },
    { id: '40-49', label: '40 à 49 ans', count: 71 },
    { id: '50+', label: '50 ans et plus', count: 39 },
  ],
};
