/**
 * REPÈRES DE DÉPISTAGE — SOURCE UNIQUE DE VÉRITÉ
 *
 * // À VALIDER PAR UN PROFESSIONNEL DE SANTÉ
 *
 * Toutes les pages (Accueil, Comprendre, Mon suivi, chatbot) lisent ce fichier.
 * Pour modifier un repère (âge, fréquence, libellé), changez UNIQUEMENT les valeurs
 * ci-dessous : aucune modification de l'interface n'est nécessaire.
 */

export type ScreeningKind = 'self-exam' | 'mammography';

export interface ScreeningGuideline {
  id: string;
  kind: ScreeningKind;
  /** Âge à partir duquel le repère s'applique (inclus). */
  fromAge: number;
  /** Âge jusqu'auquel le repère s'applique (inclus). `null` = sans limite. */
  toAge: number | null;
  /** Libellé de la frise : « Dès le plus jeune âge », « 35 ans »… */
  ageLabel: string;
  /** Geste recommandé. */
  action: string;
  /** Fréquence lisible : « chaque mois », « chaque année »… */
  frequencyLabel: string;
  /** Intervalle entre deux rappels, en mois. */
  intervalMonths: number;
  /** Explication courte (1 phrase). */
  description: string;
}

// À VALIDER PAR UN PROFESSIONNEL DE SANTÉ
export const SCREENING_GUIDELINES: ScreeningGuideline[] = [
  {
    id: 'self-exam',
    kind: 'self-exam',
    fromAge: 0,
    toAge: null,
    ageLabel: 'Dès le plus jeune âge',
    action: 'Auto-palpation',
    frequencyLabel: 'chaque mois',
    intervalMonths: 1,
    description: 'Apprendre à connaître ses seins pour repérer tout changement.',
  },
  {
    id: 'mammo-35',
    kind: 'mammography',
    fromAge: 35,
    toAge: 39,
    ageLabel: '35 ans',
    action: 'Mammographie',
    frequencyLabel: 'chaque année',
    intervalMonths: 12,
    description: 'Une radio des seins, rapide, pour repérer ce que les doigts ne sentent pas.',
  },
  {
    id: 'mammo-40',
    kind: 'mammography',
    fromAge: 40,
    toAge: null,
    ageLabel: '40 ans',
    action: 'Mammographie',
    frequencyLabel: 'tous les 2 ans',
    intervalMonths: 24,
    description: 'Le dépistage régulier continue, à un rythme adapté.',
  },
];

export const SCREENING_DISCLAIMER = 'Repères indicatifs, à confirmer avec un professionnel de santé.';

/** Âge minimal pour pouvoir saisir un âge dans l'application. */
export const MIN_AGE = 15;
export const MAX_AGE = 99;

function applies(g: ScreeningGuideline, age: number) {
  return age >= g.fromAge && (g.toAge === null || age <= g.toAge);
}

/** Repères qui s'appliquent à un âge donné. */
export function getGuidelinesForAge(age: number): ScreeningGuideline[] {
  return SCREENING_GUIDELINES.filter((g) => applies(g, age));
}

export function getSelfExamGuideline(): ScreeningGuideline {
  return SCREENING_GUIDELINES.find((g) => g.kind === 'self-exam')!;
}

/** Repère mammographie pour cet âge, ou `null` s'il n'y en a pas. */
export function getMammographyGuideline(age: number | null): ScreeningGuideline | null {
  if (age === null) return null;
  return SCREENING_GUIDELINES.find((g) => g.kind === 'mammography' && applies(g, age)) ?? null;
}

/** Âge à partir duquel la mammographie est proposée. */
export const MAMMOGRAPHY_START_AGE = Math.min(
  ...SCREENING_GUIDELINES.filter((g) => g.kind === 'mammography').map((g) => g.fromAge),
);

/** Phrase de synthèse pour un âge : « Auto-palpation chaque mois et mammographie chaque année. » */
export function summaryForAge(age: number): string {
  const parts = getGuidelinesForAge(age).map((g, i) => {
    const action = i === 0 ? g.action : g.action.toLowerCase();
    return `${action} ${g.frequencyLabel}`;
  });
  return parts.join(' et ') + '.';
}

/** Tranches d'âge utilisées par le chatbot, avec un âge représentatif. */
export const AGE_RANGES = [
  { id: 'lt35', label: 'Moins de 35 ans', representativeAge: 30 },
  { id: '35-39', label: '35 à 39 ans', representativeAge: 37 },
  { id: '40-49', label: '40 à 49 ans', representativeAge: 45 },
  { id: '50+', label: '50 ans et plus', representativeAge: 55 },
] as const;

export type AgeRangeId = (typeof AGE_RANGES)[number]['id'];

export function ageToRange(age: number): AgeRangeId {
  if (age < 35) return 'lt35';
  if (age < 40) return '35-39';
  if (age < 50) return '40-49';
  return '50+';
}

export function rangeLabel(id: AgeRangeId): string {
  return AGE_RANGES.find((r) => r.id === id)!.label;
}

export function rangeToAge(id: AgeRangeId): number {
  return AGE_RANGES.find((r) => r.id === id)!.representativeAge;
}
