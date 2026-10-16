import { strings } from '@/lib/strings.fr';
import { daysBetween, today, type ISODate } from '@/lib/dates';
import type { AppData, ReminderKind } from '@/store/useAppStore';

export interface UpcomingReminder {
  kind: ReminderKind;
  date: ISODate;
  label: string;
}

export const reminderLabel: Record<ReminderKind, string> = {
  'self-exam': strings.reminders.selfExam,
  mammography: strings.reminders.mammography,
};

/** Rappels actifs, du plus proche au plus lointain. */
export function getUpcomingReminders(s: Pick<AppData, 'selfExam' | 'mammography'>): UpcomingReminder[] {
  const list: UpcomingReminder[] = [];
  if (s.selfExam.enabled) list.push({ kind: 'self-exam', date: s.selfExam.nextDate, label: reminderLabel['self-exam'] });
  if (s.mammography.enabled && s.mammography.nextDate)
    list.push({ kind: 'mammography', date: s.mammography.nextDate, label: reminderLabel.mammography });
  return list.sort((a, b) => a.date.localeCompare(b.date));
}

/** « aujourd'hui », « demain », « dans 3 jours »… */
export function relativeDay(date: ISODate): string {
  const d = daysBetween(today(), date);
  if (d === 0) return strings.reminders.today;
  if (d === 1) return strings.reminders.tomorrow;
  if (d > 1) return strings.reminders.inDays(d);
  return strings.reminders.daysAgo(-d);
}

export function notificationFor(kind: ReminderKind | 'followup'): { title: string; body: string } {
  const r = strings.reminders;
  if (kind === 'followup') return { title: r.followUpNotifTitle, body: r.followUpNotifBody };
  if (kind === 'self-exam') return { title: r.selfExamNotifTitle, body: r.selfExamNotifBody };
  return { title: r.mammoNotifTitle, body: r.mammoNotifBody };
}

/** Résumé de régularité, jamais culpabilisant. */
export function regularitySummary(history: AppData['history']): { count: number; text: string } {
  const t = today();
  const count = history.filter((h) => h.kind === 'self-exam' && daysBetween(h.date, t) <= 90).length;
  if (count === 0)
    return { count, text: 'Votre première auto-palpation vous attend. Chaque geste compte.' };
  return {
    count,
    text: `${count} auto-palpation${count > 1 ? 's' : ''} ces 3 derniers mois. Bravo, continuez à votre rythme !`,
  };
}
