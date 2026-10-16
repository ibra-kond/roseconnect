/** Fonction serverless (Vercel) : GET /api/health — indique si Gemini est configuré. */
import { aiConfig } from '../server/chatCore.js';

interface Res {
  status(code: number): Res;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
}

export default function handler(_req: unknown, res: Res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, ai: aiConfig().enabled });
}
