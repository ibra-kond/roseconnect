/**
 * Génère les icônes PWA (PNG) à partir du logo SVG, avec le Chrome installé.
 * Lancer : node scripts/generate-icons.mjs
 */
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync } from 'node:fs';

const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => p && existsSync(p));

const mark = (scale) => `
  <g transform="translate(256 256) scale(${scale}) translate(-24 -24)">
    <path d="M20 22c-3-5-3-10 0-13 2-2 6-2 8 0 3 3 3 8 0 13L36 41" fill="none" stroke="#F26ABC" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M27 31c5-6 12-7 17-4-3 6-10 8-17 4Z" fill="#D7A0B9"/>
    <path d="M28 22 15 41" fill="none" stroke="#863146" stroke-width="6" stroke-linecap="round"/>
  </g>`;
const svg = (maskable) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  ${maskable ? '<rect width="512" height="512" fill="#FEF1F8"/>' : '<rect width="512" height="512" rx="112" fill="#FEF1F8"/>'}
  ${mark(maskable ? 6.4 : 8.6)}
</svg>`;

mkdirSync('public/icons', { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage();
for (const [name, size, maskable] of [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
  ['apple-touch-icon.png', 180, true],
]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg(maskable).replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`);
  await page.screenshot({ path: `public/icons/${name}`, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  console.log('✓', name);
}
await browser.close();
