/**
 * Recommandation d'UN centre de santé selon le profil de l'utilisatrice.
 * L'application ne réserve rien : l'utilisatrice se rend elle-même au centre
 * pour rencontrer un professionnel. Règles simples, transparentes et explicables.
 */
import { FACILITIES, type City, type Facility, type FacilityType } from './facilities';
import { MAMMOGRAPHY_START_AGE } from './screening';
import type { ObstacleId } from './obstacles';
import type { SymptomId } from '@/features/chatbot/types';

export interface RecommendationProfile {
  city: City | null;
  age: number | null;
  symptom?: SymptomId | 'none';
  obstacles?: ObstacleId[];
}

export interface Recommendation {
  facility: Facility;
  /** Raisons lisibles, de la plus importante à la moins importante. */
  reasons: string[];
}

/** Signes à faire examiner dans les prochains jours (mêmes que le chatbot). */
const URGENT: SymptomId[] = ['lump', 'discharge', 'skin', 'nipple'];

function typeScores(p: RecommendationProfile): { scores: Record<FacilityType, number>; reason: string } {
  if (p.symptom && p.symptom !== 'none') {
    if (URGENT.includes(p.symptom))
      return {
        scores: { gynecologue: 4, depistage: 3, 'centre-sante': 2, generaliste: 1 },
        reason: 'Peut examiner un changement du sein',
      };
    return {
      scores: { 'centre-sante': 3, generaliste: 3, gynecologue: 2, depistage: 1 },
      reason: 'Un professionnel peut vous examiner et vous conseiller',
    };
  }
  if (p.age !== null && p.age >= MAMMOGRAPHY_START_AGE)
    return {
      scores: { depistage: 4, 'centre-sante': 2, gynecologue: 2, generaliste: 1 },
      reason: 'Adapté au dépistage à votre âge',
    };
  return {
    scores: { 'centre-sante': 3, depistage: 3, generaliste: 2, gynecologue: 1 },
    reason: 'Examen clinique des seins possible',
  };
}

const MONEY_REASON = 'Gratuit en octobre ou tarif social';

const OBSTACLE_BONUS: Partial<Record<ObstacleId, { test: (f: Facility) => boolean; points: number; reason: string }>> = {
  money: { test: (f) => f.freeScreeningOctober || f.socialRate, points: 2, reason: MONEY_REASON },
  shame: { test: (f) => f.femaleStaff, points: 2, reason: 'Soignantes disponibles' },
  fear: { test: (f) => f.femaleStaff, points: 1, reason: 'Soignantes disponibles' },
  time: { test: (f) => f.openSaturday, points: 2, reason: 'Ouvert le samedi' },
  distance: { test: (f) => f.type === 'centre-sante', points: 1, reason: 'Centre de proximité' },
};

/** Meilleur centre de la ville, ou `null` si la ville est inconnue. */
export function recommendFacility(p: RecommendationProfile): Recommendation | null {
  if (!p.city) return null;
  const candidates = FACILITIES.filter((f) => f.city === p.city);
  if (candidates.length === 0) return null;
  const { scores, reason } = typeScores(p);
  const obstacles = p.obstacles ?? [];

  const ranked = candidates
    .map((f, index) => {
      let score = scores[f.type];
      const reasons = [reason];
      for (const o of obstacles) {
        const bonus = OBSTACLE_BONUS[o];
        if (bonus?.test(f)) {
          score += bonus.points;
          if (!reasons.includes(bonus.reason)) reasons.push(bonus.reason);
        }
      }
      // Petits bonus généraux : accessibilité financière et horaires.
      if (f.freeScreeningOctober) score += 0.5;
      if (f.openSaturday) score += 0.25;
      return { f, score, reasons, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const best = ranked[0];
  const extras = [
    best.f.freeScreeningOctober && 'Dépistage gratuit en octobre',
    best.f.femaleStaff && 'Soignantes disponibles',
    best.f.openSaturday && 'Ouvert le samedi',
  ].filter(
    (r): r is string =>
      !!r && !best.reasons.includes(r) && !(r.startsWith('Dépistage gratuit') && best.reasons.includes(MONEY_REASON)),
  );
  return { facility: best.f, reasons: [...best.reasons, ...extras].slice(0, 3) };
}
