/**
 * Proxy Express local : /api/health et /api/chat.
 * En production (`npm run build && npm start`), sert aussi l'application compilée (dist/).
 */
import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { aiConfig, ChatError, createRateLimiter, generateReply } from './chatCore.js';

try {
  process.loadEnvFile('.env');
} catch {
  /* pas de .env : variables d'environnement système ou mode scripté */
}

const app = express();
const PORT = Number(process.env.PORT) || 8787;
const allow = createRateLimiter(20, 60_000);

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (_req, res) => {
  res.set('Cache-Control', 'no-store').json({ ok: true, ai: aiConfig().enabled });
});

app.post('/api/chat', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!allow(req.ip ?? 'unknown')) {
    res.status(429).json({ fallback: true, reason: 'rate-limit' });
    return;
  }
  try {
    const { reply, filtered } = await generateReply(req.body);
    res.json({ reply, filtered, source: 'ai' });
  } catch (e) {
    const status = e instanceof ChatError ? e.status : 500;
    const reason = e instanceof ChatError ? e.message : 'error';
    if (reason !== 'no-key') console.warn(`[chat] bascule en mode scripté (${reason})`);
    res.status(status).json({ fallback: true, reason });
  }
});

// Application compilée (production).
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => {
  const { enabled, model } = aiConfig();
  console.log(`ROSECONNECT API → http://localhost:${PORT}`);
  console.log(enabled ? `Gemini actif (modèle : ${model})` : 'Aucune GEMINI_API_KEY : le chatbot fonctionne en mode scripté.');
});
