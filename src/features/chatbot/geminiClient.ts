import type { ChatContext, ChatMessage } from './types';

/**
 * Client du proxy serveur (/api/chat). La clé Gemini n'est JAMAIS côté client :
 * le navigateur ne parle qu'à notre propre serveur.
 */

const CLIENT_TIMEOUT_MS = 16_000; // le serveur coupe à 15 s

export class AiUnavailableError extends Error {}

export async function checkAiAvailable(): Promise<boolean> {
  if (!navigator.onLine) return false;
  const controller = new AbortController();
  const t = window.setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch('/api/health', { signal: controller.signal, cache: 'no-store' });
    if (!res.ok) return false;
    const data = (await res.json()) as { ai?: boolean };
    return data.ai === true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(t);
  }
}

export async function askGemini(messages: ChatMessage[], context: ChatContext): Promise<string> {
  if (!navigator.onLine) throw new AiUnavailableError('offline');
  const controller = new AbortController();
  const t = window.setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        // Seuls le rôle et le texte partent au serveur ; il garde les 10 derniers.
        messages: messages.slice(-10).map((m) => ({ role: m.role, text: m.text })),
        context,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { reply?: string; fallback?: boolean };
    if (!res.ok || data.fallback || !data.reply) throw new AiUnavailableError(`status ${res.status}`);
    return data.reply;
  } catch (e) {
    throw e instanceof AiUnavailableError ? e : new AiUnavailableError(String(e));
  } finally {
    window.clearTimeout(t);
  }
}
