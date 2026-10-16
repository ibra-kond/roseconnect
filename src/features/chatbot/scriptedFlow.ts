/**
 * Mode scripté : machine à états qui reproduit tout le parcours guidé,
 * sans connexion ni clé API. Toutes les réponses sont pré-rédigées
 * (src/lib/strings.fr.ts → chatScript) et ne posent jamais de diagnostic.
 */
import { AGE_RANGES, ageToRange, rangeLabel, rangeToAge, summaryForAge, type AgeRangeId } from '@/data/screening';
import { CITIES, detectCity, isCity, normalize, type City } from '@/data/facilities';
import type { ObstacleId } from '@/data/obstacles';
import { strings } from '@/lib/strings.fr';
import type { ChatCard, ChatContext, FlowStep, QuickReply, SymptomId } from './types';

const C = strings.chatScript;

export interface BotReply {
  text: string;
  chips?: QuickReply[];
  cards?: ChatCard[];
  tone?: 'warning';
}

export interface FlowResult {
  replies: BotReply[];
  step: FlowStep;
  context: ChatContext;
  /** Obstacle à enregistrer dans « Mes obstacles ». */
  obstacle?: ObstacleId;
  /** Ville choisie, à mémoriser dans le profil. */
  city?: City;
  /** Suivi chez un professionnel jugé nécessaire : la recommandation de centre est débloquée. */
  followUp?: SymptomId | 'none';
}

/** Signes pour lesquels on recommande de consulter dans les prochains jours (règle 1.3). */
const URGENT_SYMPTOMS: SymptomId[] = ['lump', 'discharge', 'skin', 'nipple'];

/* ---------- Puces par étape ---------- */

export const FREE_CHIPS: QuickReply[] = [
  { label: C.topicWhere, value: 'topic:where' },
  { label: C.topicSelfExam, value: 'topic:selfexam' },
  { label: C.topicChange, value: 'topic:change' },
  { label: C.topicRestart, value: 'restart' },
];

const AGE_CHIPS: QuickReply[] = AGE_RANGES.map((r) => ({ label: r.label, value: `age:${r.id}` }));
const REASON_CHIPS: QuickReply[] = [
  { label: C.reasonInfo, value: 'reason:info' },
  { label: C.reasonChange, value: 'reason:change' },
];
const SYMPTOM_CHIPS: QuickReply[] = (Object.keys(C.symptoms) as SymptomId[]).map((id) => ({
  label: C.symptoms[id],
  value: `symptom:${id}`,
}));
const LAST_VISIT_CHIPS: QuickReply[] = (['lt1y', 'gt1y', 'never'] as const).map((id) => ({
  label: C.lastVisit[id],
  value: `visit:${id}`,
}));
const CITY_CHIPS: QuickReply[] = [
  ...CITIES.map((c) => ({ label: c, value: `city:${c}` })),
  { label: C.otherCity, value: 'city:other' },
];
const BARRIER_CHIPS: QuickReply[] = (['fear', 'shame', 'money', 'time', 'other'] as const).map((id) => ({
  label: C.barriers[id],
  value: `barrier:${id}`,
}));

/** Question et puces d'une étape (pour reposer la question après une réponse libre). */
export function promptForStep(step: FlowStep): BotReply {
  switch (step) {
    case 'welcome':
      return { text: C.welcome, chips: welcomeChips() };
    case 'age':
      return { text: C.askAge, chips: AGE_CHIPS };
    case 'reason':
      return { text: C.askReason, chips: REASON_CHIPS };
    case 'symptom':
      return { text: C.askSymptom, chips: SYMPTOM_CHIPS };
    case 'lastVisit':
      return { text: C.askLastVisit, chips: LAST_VISIT_CHIPS };
    case 'city':
      return { text: C.askCity, chips: CITY_CHIPS };
    case 'barrier':
      return { text: C.askBarrier, chips: BARRIER_CHIPS };
    case 'free':
      return { text: C.freeIntro, chips: FREE_CHIPS };
  }
}

export function chipsForStep(step: FlowStep): QuickReply[] {
  return promptForStep(step).chips ?? FREE_CHIPS;
}

function welcomeChips(): QuickReply[] {
  return [
    { label: C.welcomeYes, value: 'start' },
    { label: C.welcomeQuestion, value: 'free' },
  ];
}

/**
 * Accueil. `base.ageRange` vient de la date de naissance du compte :
 * l'assistante ne redemande pas l'âge et adapte ses conseils à la tranche.
 */
export function startFlow(base: ChatContext = {}): FlowResult {
  const context: ChatContext = base.ageRange ? { ageRange: base.ageRange } : {};
  const welcome = promptForStep('welcome');
  const text = context.ageRange ? C.welcomeForRange(rangeLabel(context.ageRange).toLowerCase()) : welcome.text;
  return { replies: [{ ...welcome, text }], step: 'welcome', context };
}

/** Première question du parcours : l'âge seulement s'il est inconnu. */
function firstQuestion(context: ChatContext): FlowResult {
  return context.ageRange
    ? { replies: [promptForStep('reason')], step: 'reason', context }
    : { replies: [promptForStep('age')], step: 'age', context };
}

/* ---------- Orientation finale ---------- */

/**
 * Carte « centre recommandé ». N'est utilisée QUE lorsqu'un suivi chez un professionnel
 * est jugé nécessaire (changement signalé, contrôle en retard ou jamais fait).
 */
function reco(ctx: ChatContext, city: City | null = ctx.city ?? null, symptom = ctx.symptom): ChatCard {
  return { kind: 'recommendation', city, symptom, ageRange: ctx.ageRange };
}

/** Un suivi chez un professionnel est-il nécessaire, d'après l'échange ? */
export function needsFollowUp(ctx: ChatContext): boolean {
  return (!!ctx.symptom && ctx.symptom !== 'none') || ctx.lastVisit === 'gt1y' || ctx.lastVisit === 'never';
}

function orientation(ctx: ChatContext): BotReply[] {
  const city = ctx.city ?? null;
  const hasSymptom = ctx.symptom && ctx.symptom !== 'none';

  if (hasSymptom) {
    const urgent = URGENT_SYMPTOMS.includes(ctx.symptom as SymptomId);
    return [
      {
        text: `${C.changeNeedsCheck} ${urgent ? C.consultSoon : C.consultPlan}`,
        tone: urgent ? 'warning' : undefined,
        cards: [reco(ctx, city)],
      },
    ];
  }
  const range = ctx.ageRange ?? '35-39';
  const parts = [C.guidelinesForRange(rangeLabel(range).toLowerCase(), summaryForAge(rangeToAge(range)).toLowerCase())];
  if (needsFollowUp(ctx)) {
    parts.push(ctx.lastVisit === 'never' ? C.neverChecked : C.overdue, C.followUpCenter);
    return [{ text: parts.join(' '), cards: [reco(ctx, city), { kind: 'reminder' }] }];
  }
  // Suivi à jour : pas de recommandation de centre.
  parts.push(C.upToDate);
  return [{ text: parts.join(' '), cards: [{ kind: 'reminder' }] }];
}

function closing(): BotReply {
  return { text: `${C.encouragement} ${C.notDiagnosis}`, chips: FREE_CHIPS };
}

/* ---------- Réponses aux obstacles ---------- */

type BarrierId = 'fear' | 'shame' | 'money' | 'time' | 'other' | 'consent' | 'distance';

function barrierReply(id: BarrierId, ctx: ChatContext): BotReply {
  const city = ctx.city ?? null;
  // La recommandation n'est rappelée que si un suivi a déjà été jugé nécessaire.
  const center: ChatCard[] = ctx.followUp ? [reco(ctx, city)] : [];
  const cards: ChatCard[] =
    id === 'money'
      ? [...center, { kind: 'sponsor' }]
      : id === 'time'
        ? [...center, { kind: 'reminder' }]
        : id === 'other' || id === 'consent'
          ? [{ kind: 'obstacles' }]
          : center.length
            ? center
            : [{ kind: 'obstacles' }];
  const saved = id === 'other' ? '' : ` ${C.obstacleSaved}`;
  return { text: C.barrierReply[id] + saved, cards };
}

/* ---------- Puces ---------- */

export function handleChip(step: FlowStep, ctx: ChatContext, value: string): FlowResult {
  const [key, arg] = value.split(/:(.*)/s);

  switch (key) {
    case 'restart':
      return firstQuestion(ctx.ageRange ? { ageRange: ctx.ageRange } : {});
    case 'start':
      return firstQuestion(ctx);
    case 'free':
      return { replies: [promptForStep('free')], step: 'free', context: ctx };
    case 'age': {
      const context = { ...ctx, ageRange: arg as AgeRangeId };
      return { replies: [promptForStep('reason')], step: 'reason', context };
    }
    case 'reason':
      if (arg === 'change') return { replies: [promptForStep('symptom')], step: 'symptom', context: ctx };
      return { replies: [promptForStep('lastVisit')], step: 'lastVisit', context: { ...ctx, symptom: 'none' } };
    case 'symptom': {
      const context = { ...ctx, symptom: arg as SymptomId };
      return { replies: [{ text: C.symptomAck }, promptForStep('lastVisit')], step: 'lastVisit', context };
    }
    case 'visit': {
      const context = { ...ctx, lastVisit: arg as ChatContext['lastVisit'] };
      return { replies: [promptForStep('city')], step: 'city', context };
    }
    case 'city': {
      const city = isCity(arg) ? arg : undefined;
      const followUp = needsFollowUp(ctx);
      const context: ChatContext = { ...ctx, city, followUp: ctx.followUp || followUp };
      const replies = orientation(context);
      const extra = followUp ? { followUp: context.symptom ?? 'none' } : {};
      if (context.lastVisit === 'never') {
        return { replies: [...replies, promptForStep('barrier')], step: 'barrier', context, city, ...extra };
      }
      return { replies: [...replies, closing()], step: 'free', context, city, ...extra };
    }
    case 'barrier': {
      const id = arg as BarrierId;
      const obstacle = id === 'other' ? undefined : (id as ObstacleId);
      const context = { ...ctx, obstacle: (obstacle ?? 'other') as ChatContext['obstacle'] };
      return { replies: [barrierReply(id, context), closing()], step: 'free', context, obstacle };
    }
    case 'topic':
      if (arg === 'change') return { replies: [promptForStep('symptom')], step: 'symptom', context: ctx };
      return keywordReply(arg === 'where' ? 'où me faire dépister ?' : 'palpation', step, ctx);
    default:
      return keywordReply(value, step, ctx);
  }
}

/* ---------- Saisie libre ---------- */

const has = (t: string, ...words: string[]) => words.some((w) => t.includes(w));

function detectSymptom(t: string): SymptomId | null {
  if (has(t, 'boule', 'masse', 'grosseur', 'bosse', 'nodule', 'ganglion')) return 'lump';
  if (has(t, 'ecoulement', 'coule', 'sang', 'liquide')) return 'discharge';
  if (has(t, 'peau d orange', 'rougeur', 'rouge', 'gonfle', 'gonflement', 'peau')) return 'skin';
  if (has(t, 'mamelon', 'teton', 'retract', 'rentre')) return 'nipple';
  if (has(t, 'douleur', 'mal au sein', 'j ai mal', 'fait mal')) return 'pain';
  return null;
}

function detectBarrier(t: string): BarrierId | null {
  if (has(t, 'peur', 'angoiss', 'inquiet', 'stress', 'effray')) return 'fear';
  if (has(t, 'honte', 'gene', 'pudeur', 'pudique', 'timide')) return 'shame';
  if (has(t, 'argent', 'prix', 'cher', 'payer', 'cout', 'tarif', 'gratuit', 'moyens', 'sous', 'fcfa')) return 'money';
  if (has(t, 'pas le temps', 'manque de temps', 'le temps', 'occupee', 'occupe', 'travail', 'debordee')) return 'time';
  if (has(t, 'mari', 'conjoint', 'famille', 'accord', 'permission', 'belle-mere', 'belle mere')) return 'consent';
  if (has(t, 'loin', 'distance', 'transport', 'trajet', 'village')) return 'distance';
  return null;
}

function detectAgeRange(t: string): AgeRangeId | null {
  const n = t.match(/\b(\d{2})\b/);
  if (n) {
    const age = Number(n[1]);
    if (age >= 15 && age <= 99) return ageToRange(age);
  }
  if (has(t, 'moins de 35')) return 'lt35';
  if (has(t, '50 ans et plus', 'plus de 50')) return '50+';
  return null;
}

/**
 * Essaie d'interpréter une réponse libre comme la réponse à l'étape en cours.
 * Renvoie `null` si ce n'est pas le cas (l'appelant peut alors interroger Gemini).
 */
export function parseFreeTextForStep(step: FlowStep, ctx: ChatContext, raw: string): FlowResult | null {
  const t = normalize(raw);
  switch (step) {
    case 'welcome':
      if (has(t, 'oui', 'ok', 'd accord', 'commence', 'vas-y', 'allons')) return handleChip(step, ctx, 'start');
      return null;
    case 'age': {
      const r = detectAgeRange(t);
      return r ? handleChip(step, ctx, `age:${r}`) : null;
    }
    case 'reason': {
      const s = detectSymptom(t);
      if (s) return handleChip('symptom', ctx, `symptom:${s}`);
      if (has(t, 'rien', 'informer', 'savoir', 'renseign', 'comprendre')) return handleChip(step, ctx, 'reason:info');
      if (has(t, 'changement', 'remarque', 'bizarre')) return handleChip(step, ctx, 'reason:change');
      return null;
    }
    case 'symptom': {
      const s = detectSymptom(t);
      return handleChip(step, ctx, `symptom:${s ?? 'other'}`);
    }
    case 'lastVisit':
      if (has(t, 'jamais', 'pas encore', 'aucun')) return handleChip(step, ctx, 'visit:never');
      if (has(t, 'moins', 'cette annee', 'recemment', 'mois')) return handleChip(step, ctx, 'visit:lt1y');
      if (has(t, 'plus', 'longtemps', 'ans', 'annees')) return handleChip(step, ctx, 'visit:gt1y');
      return null;
    case 'city': {
      const c = detectCity(raw);
      if (c) return handleChip(step, ctx, `city:${c}`);
      if (has(t, 'autre', 'ailleurs', 'village')) return handleChip(step, ctx, 'city:other');
      return null;
    }
    case 'barrier': {
      const b = detectBarrier(t);
      if (b === 'consent' || b === 'distance') {
        const context = { ...ctx, obstacle: b };
        return { replies: [barrierReply(b, context), closing()], step: 'free', context, obstacle: b };
      }
      return handleChip(step, ctx, `barrier:${b ?? 'other'}`);
    }
    default:
      return null;
  }
}

/** Réponse par mots-clés (mode hors ligne ou si Gemini échoue). Renvoie toujours une réponse sûre. */
export function keywordReply(raw: string, step: FlowStep, ctx: ChatContext): FlowResult {
  const t = normalize(raw);
  const city = detectCity(raw) ?? ctx.city ?? null;
  const context: ChatContext = city ? { ...ctx, city } : ctx;
  const chips = step === 'free' ? FREE_CHIPS : chipsForStep(step);
  const reply = (r: BotReply, extra: Partial<FlowResult> = {}): FlowResult => ({
    replies: [{ chips, ...r }],
    step,
    context,
    ...extra,
  });

  if (has(t, 'suicide', 'me tuer', 'en finir', 'me faire du mal', 'envie de mourir', 'plus envie de vivre')) {
    return reply({ text: C.distress, tone: 'warning' });
  }
  if (has(t, 'pas consulte', 'jamais consulte', 'jamais fait', 'jamais ete')) {
    // Jamais de contrôle : un premier examen est conseillé.
    const never: ChatContext = { ...context, lastVisit: 'never', followUp: true };
    return { replies: [promptForStep('barrier')], step: 'barrier', context: never, followUp: never.symptom ?? 'none' };
  }

  const symptom = detectSymptom(t);
  if (symptom) {
    const withSymptom: ChatContext = { ...context, symptom, followUp: true };
    const text =
      symptom === 'pain' ? `${C.painAnswer} ${C.notDiagnosis}` : `${C.changeNeedsCheck} ${C.consultSoon} ${C.notDiagnosis}`;
    return {
      replies: [{ chips, text, tone: symptom === 'pain' ? undefined : 'warning', cards: [reco(withSymptom, city, symptom)] }],
      step,
      context: withSymptom,
      followUp: symptom,
    };
  }

  const barrier = detectBarrier(t);
  if (barrier) {
    return reply(barrierReply(barrier, context), { obstacle: barrier as ObstacleId });
  }

  if (has(t, 'mammo', 'radio')) {
    const age = ctx.ageRange ? rangeToAge(ctx.ageRange) : 40;
    return reply({ text: C.mammoAnswer(summaryForAge(age)), cards: [{ kind: 'learn' }] });
  }
  if (has(t, 'palpation', 'palper', 'auto-examen', 'toucher', 'examiner moi', 'comment verifier')) {
    return reply({ text: C.selfExamAnswer, cards: [{ kind: 'learn' }, { kind: 'reminder' }] });
  }
  if (has(t, 'ou ', 'ou?', 'structure', 'centre', 'hopital', 'clinique', 'medecin', 'adresse', 'csps', 'cma', 'gyneco', 'depist')) {
    // Pas de recommandation « à froid » : l'assistante échange d'abord pour savoir si un suivi est utile.
    if (context.followUp) return reply({ text: C.whereAnswer, cards: [reco(context, city)] });
    return reply({ text: C.whereNeedsChat, chips: [{ label: C.welcomeYes, value: 'start' }, ...FREE_CHIPS.slice(1)] });
  }
  if (has(t, 'homme', 'mari aussi', 'garcon')) {
    return reply({ text: C.menAnswer });
  }
  if (has(t, 'age', 'repere', 'quand', 'frequence')) {
    const age = ctx.ageRange ? rangeToAge(ctx.ageRange) : 35;
    return reply({ text: `${summaryForAge(age)} À confirmer avec un professionnel de santé.`, cards: [{ kind: 'learn' }] });
  }
  if (has(t, 'merci')) return reply({ text: C.thanks });
  if (/^(bonjour|bonsoir|salut|coucou|hello)\b/.test(t)) return reply({ text: C.hello });

  return reply({ text: C.fallback });
}

/** Cartes d'action à ajouter à une réponse de Gemini, selon le message de l'utilisatrice. */
export function cardsForUserText(
  raw: string,
  ctx: ChatContext,
): { cards: ChatCard[]; obstacle?: ObstacleId; warning: boolean; followUp?: SymptomId | 'none' } {
  const t = normalize(raw);
  const city = detectCity(raw) ?? ctx.city ?? null;
  const symptom = detectSymptom(t);
  const barrier = detectBarrier(t);
  const cards: ChatCard[] = [];
  if (barrier === 'money') cards.push({ kind: 'sponsor' });
  // Centre recommandé seulement si un suivi est nécessaire (changement signalé ou déjà établi).
  if (symptom || ctx.followUp) cards.unshift(reco(ctx, city, symptom ?? ctx.symptom));
  return {
    cards,
    obstacle: barrier ? (barrier as ObstacleId) : undefined,
    warning: !!symptom && URGENT_SYMPTOMS.includes(symptom),
    followUp: symptom ?? undefined,
  };
}
