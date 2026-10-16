/**
 * Captures d'écran des 4 onglets + détection des erreurs console.
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
page.on('console', (m) => m.type() === 'error' && errors.push(`[console] ${m.text()}`));
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

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
    // Parcours démo : on commence → 35-39 → changement → boule
    for (const label of ['Oui, on commence', '35 à 39 ans', 'J’ai remarqué un changement', 'Une boule ou une masse', 'Jamais', 'Ouagadougou', 'L’argent']) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.waitForTimeout(2600);
    }
  }
  const file = `${OUT}/${name}${WIDTH > 600 ? '-desktop' : ''}.png`;
  await page.screenshot({ path: file, fullPage: FULL });
  console.log('✓', file);
}
// Overflow horizontal ?
for (const [, path] of shots) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth);
  if (overflow > WIDTH) errors.push(`[overflow] ${path} : largeur ${overflow}px > ${WIDTH}px`);
}
await browser.close();
console.log(errors.length ? `\n${errors.length} problème(s) :\n${errors.join('\n')}` : '\nAucune erreur console, aucun débordement horizontal.');
