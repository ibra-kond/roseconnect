/**
 * Cœur du proxy Gemini, partagé par le serveur Express (server/index.ts)
 * et les fonctions serverless (api/chat.ts). S'exécute UNIQUEMENT côté serveur.
 */
import { GoogleGenAI } from '@google/genai';

export const DEFAULT_MODEL = 'gemini-flash-latest';
export const TIMEOUT_MS = 15_000;
const MAX_HISTORY = 10;
const MAX_INPUT_CHARS = 800;
const MAX_REPLY_CHARS = 600;

/* ---------- Prompt système (non modifiable par le client) ---------- */

const SYSTEM_PROMPT = `Tu es l'assistante d'orientation de ROSECONNECT, une application de sensibilisation au cancer du sein au Burkina Faso.
RÈGLES STRICTES :
- Tu ne poses JAMAIS de diagnostic, tu n'estimes jamais un risque, tu ne dis jamais qu'un symptôme est bénin ou grave.
- Tu ne prescris jamais de médicament, d'examen précis ou de traitement, ni de remède traditionnel.
- Tu encourages toujours la consultation d'un professionnel de santé (médecin généraliste, gynécologue ou centre de santé).
- Si l'utilisatrice décrit une boule, un écoulement de sang, une peau en peau d'orange, un mamelon rétracté, une rougeur ou un gonflement persistant, ou un ganglion sous l'aisselle : recommande calmement de consulter dans les prochains jours.
- Si l'utilisatrice évoque une détresse grave ou des idées de se faire du mal, réponds avec empathie et invite-la à contacter immédiatement un proche ou un service d'urgence.
- Réponds en français simple, avec bienveillance et vouvoiement, sans jargon ni culpabilisation, en 3 phrases maximum.
- Hors sujet (autre que santé du sein ou dépistage) : ramène poliment la conversation à ton rôle.
- L'application recommande un centre de santé selon le profil de l'utilisatrice, qui s'y rend elle-même pour rencontrer un professionnel. Ne propose jamais de prendre, réserver ou planifier un rendez-vous ou un créneau ; invite plutôt à se rendre au centre recommandé, aux heures d'ouverture.
- Ne cite jamais de centre de santé précis toi-même : l'application affiche une recommandation uniquement quand l'échange montre qu'un suivi chez un professionnel est nécessaire.
- Ne demande jamais le nom complet, l'adresse ou des informations d'identification.
- Termine chaque orientation par un rappel que tu ne remplaces pas un avis médical.
- N'utilise ni Markdown, ni listes, ni émojis.
Contexte de l'utilisatrice (peut être vide) : {age_range}, {symptom}, {last_visit}, {city}, {obstacle}.`;

/** Valeurs autorisées du contexte : le client ne peut rien injecter d'autre dans le prompt. */
const LABELS = {
  ageRange: { lt35: 'moins de 35 ans', '35-39': '35 à 39 ans', '40-49': '40 à 49 ans', '50+': '50 ans et plus' },
  symptom: {
    none: 'aucun changement signalé',
    lump: 'boule ou masse signalée',
    discharge: 'écoulement par le mamelon signalé',
    skin: 'changement de peau signalé',
    nipple: 'changement du mamelon signalé',
    pain: 'douleur signalée',
    other: 'autre changement signalé',
  },
  lastVisit: { lt1y: 'dernière consultation il y a moins d’un an', gt1y: 'dernière consultation il y a plus d’un an', never: 'jamais consulté' },
  city: {
    Ouagadougou: 'Ouagadougou',
    'Bobo-Dioulasso': 'Bobo-Dioulasso',
    Koudougou: 'Koudougou',
    Ouahigouya: 'Ouahigouya',
    'Fada N’Gourma': 'Fada N’Gourma',
    Banfora: 'Banfora',
  },
  obstacle: {
    fear: 'obstacle : peur',
    shame: 'obstacle : gêne',
    money: 'obstacle : argent',
    time: 'obstacle : temps',
    distance: 'obstacle : distance',
    where: 'obstacle : ne sait pas où aller',
    consent: 'obstacle : accord de la famille',
    other: 'obstacle : autre',
  },
} as const;

function pick<T extends Record<string, string>>(table: T, value: unknown, empty: string): string {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(table, value) ? table[value as keyof T] : empty;
}

export function buildSystemPrompt(ctx: unknown): string {
  const c = (ctx && typeof ctx === 'object' ? ctx : {}) as Record<string, unknown>;
  return SYSTEM_PROMPT.replace('{age_range}', pick(LABELS.ageRange, c.ageRange, 'âge inconnu'))
    .replace('{symptom}', pick(LABELS.symptom, c.symptom, 'symptôme inconnu'))
    .replace('{last_visit}', pick(LABELS.lastVisit, c.lastVisit, 'dernière consultation inconnue'))
    .replace('{city}', pick(LABELS.city, c.city, 'ville inconnue'))
    .replace('{obstacle}', pick(LABELS.obstacle, c.obstacle, 'aucun obstacle connu'));
}

/* ---------- Historique ---------- */

interface Turn {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export function sanitizeHistory(messages: unknown): Turn[] {
  if (!Array.isArray(messages)) return [];
  const turns: Turn[] = messages
    .filter((m): m is { role: string; text: string } => !!m && typeof m === 'object' && typeof (m as { text?: unknown }).text === 'string')
    .slice(-MAX_HISTORY)
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text.slice(0, MAX_INPUT_CHARS) }],
    }));
  // L'échange doit commencer par l'utilisatrice et finir par elle.
  while (turns.length && turns[0].role !== 'user') turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== 'user') return [];
  return turns;
}

/* ---------- Filtre de sortie ---------- */

export const SAFE_FALLBACK =
  'Je ne peux pas répondre à cette question, mais un professionnel de santé pourra le faire. Un médecin généraliste, un gynécologue ou un centre de santé peut vous recevoir. Je ne remplace pas un avis médical.';

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’]/g, "'")
    .toLowerCase();

/** Formulations de diagnostic, d'estimation de risque ou de prescription : la réponse est remplacée. */
const FORBIDDEN: RegExp[] = [
  /\bvous (avez|souffrez|etes atteinte)\b[^.]{0,30}\b(cancer|tumeur|kyste|fibrome|adenome|mastose|mastite|infection|abces)/,
  /\b(c'est|ce n'est|ca ressemble a|il s'agit|probablement|surement|sans doute|certainement)\b[^.]{0,40}\b(un cancer|une tumeur|un kyste|un fibrome|benin|benigne|malin|maligne|rien de grave|pas grave|grave|normal|sans danger)/,
  /\b(benin|benigne|bénin|maligne|malin)\b/,
  /\b(risque|probabilite|chances?)\b[^.]{0,15}\b(faible|eleve|importante?|minime|nul|tres bas|tres haut)/,
  /\b(prenez|prendre|appliquez|appliquer|buvez|boire|utilisez)\b[^.]{0,40}\b(comprime|medicament|antibiotique|paracetamol|ibuprofene|doliprane|tisane|plante|creme|pommade|decoction|feuilles|traitement)/,
  /\b(paracetamol|ibuprofene|doliprane|aspirine|antibiotique|tamoxifene|anti-inflammatoire|\d+\s?mg)\b/,
  /\bje (diagnostique|pense que vous avez|crois que vous avez)\b/,
  /\b(pas besoin|inutile) de (consulter|voir un medecin|vous inquieter)/,
];

export function filterOutput(raw: string): { text: string; filtered: boolean } {
  const cleaned = raw
    .replace(/[*_#`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return { text: SAFE_FALLBACK, filtered: true };
  const n = norm(cleaned);
  if (FORBIDDEN.some((re) => re.test(n))) return { text: SAFE_FALLBACK, filtered: true };

  // 3 phrases maximum, rappel « avis médical » garanti.
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [cleaned];
  const mentionsDisclaimer = /avis medical|remplace pas|professionnel de sante/.test(n);
  let kept = sentences.slice(0, mentionsDisclaimer ? 3 : 2);
  if (!mentionsDisclaimer || !/avis medical|remplace pas|professionnel de sante/.test(norm(kept.join(' ')))) {
    kept = [...kept.slice(0, 2), 'Je ne remplace pas un avis médical.'];
  }
  let text = kept.join(' ');
  if (text.length > MAX_REPLY_CHARS) text = text.slice(0, MAX_REPLY_CHARS - 1).replace(/\s\S*$/, '') + '…';
  return { text, filtered: false };
}

/* ---------- Appel Gemini ---------- */

export function aiConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  return { apiKey, model, enabled: apiKey.length > 0 };
}

let client: GoogleGenAI | null = null;
let clientKey = '';

export class ChatError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function generateReply(body: unknown): Promise<{ reply: string; filtered: boolean }> {
  const { apiKey, model, enabled } = aiConfig();
  if (!enabled) throw new ChatError('no-key', 503);

  const b = (body && typeof body === 'object' ? body : {}) as { messages?: unknown; context?: unknown };
  const contents = sanitizeHistory(b.messages);
  if (!contents.length) throw new ChatError('bad-request', 400);

  if (!client || clientKey !== apiKey) {
    client = new GoogleGenAI({ apiKey });
    clientKey = apiKey;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await Promise.race([
      client.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: buildSystemPrompt(b.context),
          temperature: 0.4,
          maxOutputTokens: 1024,
          abortSignal: controller.signal,
        },
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new ChatError('timeout', 504)), TIMEOUT_MS + 200)),
    ]);
    const out = filterOutput(res.text ?? '');
    return { reply: out.text, filtered: out.filtered };
  } catch (e) {
    if (e instanceof ChatError) throw e;
    throw new ChatError(controller.signal.aborted ? 'timeout' : 'upstream', controller.signal.aborted ? 504 : 502);
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- Limitation de débit (mémoire, par IP) ---------- */

export function createRateLimiter(limit = 20, windowMs = 60_000) {
  const hits = new Map<string, number[]>();
  return (key: string): boolean => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear();
    return recent.length <= limit;
  };
}
