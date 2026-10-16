import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { addMonths, formatLong, formatMonth, fromISODate, toISODate, today, type ISODate } from '@/lib/dates';
import { reminderLabel } from '@/features/reminders/logic';
import { strings } from '@/lib/strings.fr';
import { cn } from '@/lib/cn';

const T = strings.tracking;
const WEEKDAYS = [
  ['L', 'lundi'],
  ['M', 'mardi'],
  ['M', 'mercredi'],
  ['J', 'jeudi'],
  ['V', 'vendredi'],
  ['S', 'samedi'],
  ['D', 'dimanche'],
];

/** Vue mensuelle légère : rappels prévus (point rose) et gestes faits (coche verte). */
export function MonthCalendar() {
  const selfExam = useAppStore((s) => s.selfExam);
  const mammography = useAppStore((s) => s.mammography);
  const history = useAppStore((s) => s.history);
  const [offset, setOffset] = useState(0);
  const t = today();

  const monthStart = fromISODate(addMonths(t.slice(0, 8) + '01', offset));
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();

  const { planned, done } = useMemo(() => {
    const planned = new Map<ISODate, string[]>();
    const add = (d: ISODate, label: string) => planned.set(d, [...(planned.get(d) ?? []), label]);
    if (selfExam.enabled) {
      // occurrences mensuelles à partir du prochain rappel
      for (let i = 0; i < 14; i++) {
        const d = i === 0 ? selfExam.nextDate : addMonths(selfExam.nextDate, i, selfExam.dayOfMonth);
        add(d, reminderLabel['self-exam']);
      }
    }
    if (mammography.enabled && mammography.nextDate) add(mammography.nextDate, reminderLabel.mammography);
    const done = new Map<ISODate, string[]>();
    history.forEach((h) => done.set(h.date, [...(done.get(h.date) ?? []), reminderLabel[h.kind]]));
    return { planned, done };
  }, [selfExam, mammography, history]);

  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<ISODate | null> = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISODate(new Date(year, month, i + 1))),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOffset((o) => o - 1)}
          aria-label={T.prevMonth}
          className="btn-icon"
        >
          <ChevronLeft aria-hidden="true" className="h-6 w-6" />
        </button>
        <p className="font-heading text-lg font-extrabold" aria-live="polite">
          {formatMonth(monthStart)}
        </p>
        <button
          type="button"
          onClick={() => setOffset((o) => o + 1)}
          aria-label={T.nextMonth}
          className="btn-icon"
        >
          <ChevronRight aria-hidden="true" className="h-6 w-6" />
        </button>
      </div>
      <table className="w-full table-fixed border-separate border-spacing-y-1 text-center">
        <caption className="sr-only">{formatMonth(monthStart)}</caption>
        <thead>
          <tr>
            {WEEKDAYS.map(([short, long]) => (
              <th key={long} scope="col" abbr={long} className="pb-1 text-sm font-semibold text-ink-muted">
                {short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((d, di) => {
                if (!d) return <td key={di} />;
                const p = planned.get(d);
                const dn = done.get(d);
                const isToday = d === t;
                const label = [
                  formatLong(d),
                  isToday ? T.legendToday : null,
                  p ? `${T.legendReminder} : ${p.join(', ')}` : null,
                  dn ? `${T.legendDone} : ${dn.join(', ')}` : null,
                ]
                  .filter(Boolean)
                  .join('. ');
                return (
                  <td key={di} className="p-0">
                    <span
                      aria-label={label}
                      role="img"
                      className={cn(
                        'relative mx-auto grid h-10 w-10 place-items-center rounded-full text-[0.95rem]',
                        isToday && 'font-bold ring-2 ring-ink',
                        p && !dn && 'bg-plum-700 font-bold text-white',
                        dn && 'bg-mauve-50 font-semibold text-mauve-700',
                      )}
                    >
                      {Number(d.slice(8))}
                      {dn && (
                        <Check aria-hidden="true" className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-mauve-700 p-0.5 text-white" strokeWidth={3} />
                      )}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted" aria-label="Légende">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-4 w-4 rounded-full bg-plum-700" /> {T.legendReminder}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="grid h-4 w-4 place-items-center rounded-full bg-mauve-700">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </span>
          {T.legendDone}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-4 w-4 rounded-full ring-2 ring-ink" /> {T.legendToday}
        </li>
      </ul>
    </div>
  );
}
