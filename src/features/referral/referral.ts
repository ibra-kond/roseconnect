/**
 * Fiche de liaison : résumé de ce que la patiente a indiqué, à montrer au soignant.
 * Jamais de diagnostic, jamais d'interprétation : uniquement les déclarations.
 */
import type { Facility } from '@/data/facilities';
import { FACILITY_TYPES } from '@/data/facilities';
import type { ObstacleId } from '@/data/obstacles';
import { ageToRange, rangeLabel } from '@/data/screening';
import type { FollowUp } from '@/store/useAppStore';
import { formatBirthDate, type ISODate } from '@/lib/dates';
import { strings } from '@/lib/strings.fr';

const F = strings.referral;

/** Ce que l'équipe soignante peut faire pour bien accueillir, selon les obstacles notés. */
export const PROFESSIONAL_NOTES: Partial<Record<ObstacleId, string>> = {
  fear: 'Appréhende l’examen : merci d’expliquer chaque étape avant de commencer.',
  shame: 'Préfère être examinée par une soignante, si possible.',
  money: 'Ressources limitées : dépistage gratuit ou tarif social souhaité.',
  time: 'Peu disponible : un examen le jour même serait idéal.',
  distance: 'Vient de loin : merci de lui indiquer les prochaines étapes avant son départ.',
  consent: 'Peut souhaiter être accompagnée d’un proche.',
};

export interface ReferralInput {
  name: string | null;
  age: number | null;
  followUp: Pick<FollowUp, 'symptom' | 'lastVisit'>;
  obstacles: ObstacleId[];
  facility: Facility | null;
  date: ISODate;
}

export interface Referral {
  rows: Array<{ label: string; value: string }>;
  needs: string[];
  /** Version texte (QR code, partage, copie). */
  text: string;
}

function reason(f: ReferralInput['followUp']): string {
  if (f.symptom !== 'none') return F.reasonSymptom(strings.chatScript.symptoms[f.symptom]);
  if (f.lastVisit === 'never') return F.reasonNever;
  if (f.lastVisit === 'gt1y') return F.reasonOverdue;
  return F.reasonCheck;
}

export function buildReferral(input: ReferralInput): Referral {
  const rows: Referral['rows'] = [{ label: F.date, value: formatBirthDate(input.date) }];
  if (input.name) rows.push({ label: F.patient, value: input.name });
  if (input.age !== null)
    rows.push({ label: F.age, value: F.ageValue(input.age, rangeLabel(ageToRange(input.age)).toLowerCase()) });
  rows.push({ label: F.reason, value: reason(input.followUp) });
  rows.push({ label: F.lastVisit, value: F.lastVisitValues[input.followUp.lastVisit ?? 'unknown'] });
  if (input.facility)
    rows.push({
      label: F.center,
      value: `${input.facility.name} (${FACILITY_TYPES[input.facility.type]}), ${input.facility.district}, ${input.facility.city}`,
    });

  const needs = input.obstacles.map((o) => PROFESSIONAL_NOTES[o]).filter((n): n is string => !!n);
  const text = [
    F.heading.toUpperCase(),
    ...rows.map((r) => `${r.label} : ${r.value}`),
    `${F.needs} : ${needs.length ? needs.join(' ') : F.needsNone}`,
    F.footer,
  ].join('\n');
  return { rows, needs, text };
}
