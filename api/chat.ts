/**
 * Fonction serverless (Vercel, runtime Node) : POST /api/chat
 * Mêmes règles que le proxy Express (prompt système, filtre, timeout, débit).
 */
import { ChatError, createRateLimiter, generateReply } from '../server/chatCore.js';

interface Req {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}
interface Res {
  status(code: number): Res;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
}

// Limitation de débit « au mieux » (par instance).
const allow = createRateLimiter(20, 60_000);

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ fallback: true, reason: 'method' });
    return;
  }
  const fwd = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (!allow(ip)) {
    res.status(429).json({ fallback: true, reason: 'rate-limit' });
    return;
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { reply, filtered } = await generateReply(body);
    res.status(200).json({ reply, filtered, source: 'ai' });
  } catch (e) {
    const status = e instanceof ChatError ? e.status : 500;
    res.status(status).json({ fallback: true, reason: e instanceof ChatError ? e.message : 'error' });
  }
}
