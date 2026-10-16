import type { AgeRangeId } from '@/data/screening';
import type { City } from '@/data/facilities';
import type { ObstacleId } from '@/data/obstacles';

export type ChatRole = 'assistant' | 'user';

export interface QuickReply {
  label: string;
  value: string;
}

export type ChatCard =
  | { kind: 'facilities'; city: City | null }
  /** Centre de santé recommandé selon le profil (l'utilisatrice s'y rend elle-même). */
  | { kind: 'recommendation'; city: City | null; symptom?: SymptomId | 'none'; ageRange?: AgeRangeId }
  | { kind: 'reminder' }
  | { kind: 'sponsor' }
  | { kind: 'obstacles' }
  | { kind: 'learn' };

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  chips?: QuickReply[];
  cards?: ChatCard[];
  /** Origine de la réponse de l'assistante. */
  source?: 'scripted' | 'ai';
  /** Mise en avant douce (« consultez dans les prochains jours »). */
  tone?: 'warning';
  ts: number;
}

export type FlowStep =
  | 'welcome'
  | 'age'
  | 'reason'
  | 'symptom'
  | 'lastVisit'
  | 'city'
  | 'barrier'
  | 'free';

export type SymptomId = 'lump' | 'discharge' | 'skin' | 'nipple' | 'pain' | 'other';

export interface ChatContext {
  ageRange?: AgeRangeId;
  symptom?: SymptomId | 'none';
  lastVisit?: 'lt1y' | 'gt1y' | 'never';
  city?: City;
  obstacle?: ObstacleId | 'other';
  /** Vrai dès que l'assistante juge un suivi chez un professionnel nécessaire. */
  followUp?: boolean;
}
