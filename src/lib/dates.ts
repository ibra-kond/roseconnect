/** Dates locales au format ISO court « AAAA-MM-JJ » (pas de fuseau horaire). */
export type ISODate = string;

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function today(): ISODate {
  return toISODate(new Date());
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Ajoute des mois en restant sur un jour valide (31 janv. + 1 mois → 28/29 févr.). */
export function addMonths(iso: ISODate, months: number, dayOfMonth?: number): ISODate {
  const d = fromISODate(iso);
  const targetDay = dayOfMonth ?? d.getDate();
  const first = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  first.setDate(Math.min(targetDay, lastDay));
  return toISODate(first);
}

/** Prochaine occurrence (aujourd'hui inclus) du jour `day` du mois. */
export function nextMonthlyDate(day: number, from: ISODate = today()): ISODate {
  const thisMonth = addMonths(from, 0, day);
  return thisMonth >= from ? thisMonth : addMonths(from, 1, day);
}

export function daysBetween(a: ISODate, b: ISODate): number {
  return Math.round((fromISODate(b).getTime() - fromISODate(a).getTime()) / 86_400_000);
}

/** Âge révolu à la date `ref` (anniversaire compris). */
export function ageFromBirthDate(birth: ISODate, ref: ISODate = today()): number {
  const [by, bm, bd] = birth.split('-').map(Number);
  const [ry, rm, rd] = ref.split('-').map(Number);
  return ry - by - (rm < bm || (rm === bm && rd < bd) ? 1 : 0);
}

/** Date il y a `years` ans (pour les bornes du champ date de naissance). */
export function yearsAgo(years: number, from: ISODate = today()): ISODate {
  return addMonths(from, -12 * years);
}

const birthFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/** « 12 mars 1987 » */
export function formatBirthDate(iso: ISODate): string {
  return birthFmt.format(fromISODate(iso));
}

const longFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const shortFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const monthFmt = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });

/** « lundi 3 novembre » */
export function formatLong(iso: ISODate): string {
  return longFmt.format(fromISODate(iso));
}

/** « 3 nov. » */
export function formatShort(iso: ISODate): string {
  return shortFmt.format(fromISODate(iso));
}

/** « novembre 2026 » */
export function formatMonth(d: Date): string {
  const s = monthFmt.format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatTime(ts: number): string {
  return timeFmt.format(new Date(ts));
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
