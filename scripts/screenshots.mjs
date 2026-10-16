/**
 * Captures d'écran (connexion, onglets, fiche de liaison, impact) + détection des erreurs console.
 * Se connecte avec le compte démo (Awa, 38 ans, Ouagadougou).
 * Prérequis : `npm run build` puis `npm run preview` (ou BASE_URL=...).
 * Lancer : node scripts/screenshots.mjs [--full] [--width=360]
 */
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const FULL = process.argv.includes('--full');
const WIDTH = Number(process.argv.find((a) => a.startsWith('--width='))?.split('=')[1] || 390);
const OUT = process.env.OUT_DIR || 'docs/screenshots';
const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => p && existsSync(p));

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: 844 },
  deviceScaleFactor: 2,
  isMobile: WIDTH < 600,
  hasTouch: WIDTH < 600,
  locale: 'fr-FR',
  serviceWorkers: 'block',
});
const page = await ctx.newPage();
const errors = [];
// Sans le proxy API (npm run preview seul), /api/health échoue : c'est attendu (mode hors ligne).
page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(`[console] ${m.text()}`));
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

const suffix = WIDTH > 600 ? '-desktop' : '';
const snap = async (name) => {
  // Ferme les notifications passagères (toasts) pour qu'elles ne masquent pas l'écran.
  for (const close of await page.locator('[role="status"] button[aria-label="Fermer"]').all()) await close.click().catch(() => {});
  await page.waitForTimeout(400);
  const file = `${OUT}/${name}${suffix}.png`;
  await page.screenshot({ path: file, fullPage: FULL });
  console.log('✓', file);
};

// Connexion, puis compte démo
await page.goto(BASE + '/connexion', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await snap('00-connexion');
await page.getByRole('button', { name: 'Découvrir avec le compte démo' }).click();
await page.waitForURL(BASE + '/');

const shots = [
  ['01-accueil', '/'],
  ['02-comprendre', '/comprendre'],
  ['03-chatbot', '/aide'],
  ['04-structures', '/aide?onglet=structures&ville=Ouagadougou'],
  ['05-suivi', '/suivi'],
  ['06-reglages', '/reglages'],
];
for (const [name, path] of shots) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(name === '03-chatbot' ? 2500 : 900);
  if (name === '03-chatbot') {
    // Parcours démo (l'âge vient de la date de naissance) : changement → boule → jamais → Ouagadougou → argent
    for (const label of ['Oui, on commence', 'J’ai remarqué un changement', 'Une boule ou une masse', 'Jamais', 'Ouagadougou', 'L’argent']) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.waitForTimeout(2600);
    }
  }
  await snap(name);
}

// Fiche de liaison (depuis Mon suivi)
await page.goto(BASE + '/suivi', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Ma fiche de liaison' }).click();
await page.waitForTimeout(900);
await snap('07-fiche-liaison');

// Tableau d'impact, avec l'exemple de campagne (données fictives)
await page.goto(BASE + '/impact', { waitUntil: 'networkidle' });
await page.getByRole('switch').click();
await page.waitForTimeout(900);
await snap('08-impact');
// Overflow horizontal ?
for (const [, path] of shots) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth);
  if (overflow > WIDTH) errors.push(`[overflow] ${path} : largeur ${overflow}px > ${WIDTH}px`);
}
await browser.close();
console.log(errors.length ? `\n${errors.length} problème(s) :\n${errors.join('\n')}` : '\nAucune erreur console, aucun débordement horizontal.');
