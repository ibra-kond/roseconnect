import { BellRing, CalendarDays, Check, ListChecks, TrendingUp } from 'lucide-react';
import { Button, Card, CardHeader, Toggle } from '@/components/ui';
import { MonthCalendar } from './tracking/MonthCalendar';
import { ObstaclesCard } from '@/features/obstacles/ObstaclesCard';
import { FollowUpStatusCard } from '@/features/followup/FollowUpCards';
import { ReminderIcon } from '@/features/reminders/ReminderIcon';
import { getUpcomingReminders, regularitySummary, relativeDay } from '@/features/reminders/logic';
import { notifyReminder } from '@/features/reminders/notify';
import { useMarkDone } from '@/features/reminders/useMarkDone';
import { MAMMOGRAPHY_START_AGE, getMammographyGuideline } from '@/data/screening';
import { useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';
import { capitalize, formatLong } from '@/lib/dates';
import { strings } from '@/lib/strings.fr';

const T = strings.tracking;

function RemindersCard() {
  const age = useAppStore((s) => s.profile.age);
  const selfExam = useAppStore((s) => s.selfExam);
  const mammography = useAppStore((s) => s.mammography);
  const setSelfExamEnabled = useAppStore((s) => s.setSelfExamEnabled);
  const setSelfExamDay = useAppStore((s) => s.setSelfExamDay);
  const setMammographyEnabled = useAppStore((s) => s.setMammographyEnabled);
  const upcoming = useAppStore((s) => getUpcomingReminders(s));
  const toast = useUiStore((s) => s.toast);
  const mammoGuideline = getMammographyGuideline(age);

  const mammoDescription =
    age === null ? T.mammoNeedAge : mammoGuideline ? T.mammoFrequency(mammoGuideline.frequencyLabel) : T.mammoNotYet;

  return (
    <Card as="section" aria-labelledby="reminders-title">
      <CardHeader id="reminders-title" icon={<BellRing className="h-5 w-5" />} title={T.remindersTitle} />
      <div className="flex flex-col gap-4">
        <Toggle
          checked={selfExam.enabled}
          onChange={setSelfExamEnabled}
          label={T.selfExamToggle}
          icon={<ReminderIcon kind="self-exam" />}
          description={selfExam.enabled ? `${strings.home.nextReminder} : ${formatLong(selfExam.nextDate)}` : T.selfExamDayHint}
        />
        {selfExam.enabled && (
          <div className="ml-[52px] flex items-center gap-3">
            <label htmlFor="self-day" className="font-semibold">
              {T.selfExamDay}
            </label>
            <select
              id="self-day"
              value={selfExam.dayOfMonth}
              onChange={(e) => setSelfExamDay(Number(e.target.value))}
              className="min-h-tap rounded-card border-2 border-plum-700 bg-white px-3 text-base text-ink focus:outline-none"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}
        <hr className="border-line" />
        <Toggle
          checked={mammography.enabled}
          onChange={setMammographyEnabled}
          disabled={!mammoGuideline}
          label={T.mammoToggle}
          icon={<ReminderIcon kind="mammography" />}
          description={
            mammography.enabled && mammography.nextDate
              ? `${mammoDescription}. ${strings.home.nextReminder} : ${formatLong(mammography.nextDate)}`
              : age !== null && age < MAMMOGRAPHY_START_AGE
                ? T.mammoNotYet
                : mammoDescription
          }
        />
        <Button
          variant="soft"
          icon={<BellRing aria-hidden="true" className="h-5 w-5" />}
          onClick={() => {
            const next = upcoming[0];
            if (next) notifyReminder(next.kind);
            else toast('Activez d’abord un rappel pour le tester.', 'info');
          }}
          block
        >
          {T.simulate}
        </Button>
      </div>
    </Card>
  );
}

function UpcomingCard() {
  const upcoming = useAppStore((s) => getUpcomingReminders(s));
  const markDone = useMarkDone();
  return (
    <Card as="section" aria-labelledby="upcoming-title">
      <CardHeader id="upcoming-title" icon={<ListChecks className="h-5 w-5" />} title={T.upcomingTitle} />
      {upcoming.length === 0 ? (
        <p className="text-ink-muted">{T.upcomingEmpty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {upcoming.map((r) => (
            <li key={r.kind} className="flex flex-wrap items-center gap-3 rounded-card bg-cream p-3">
              <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pink-50 text-plum-700">
                <ReminderIcon kind={r.kind} />
              </span>
              <div className="min-w-[9rem] flex-1">
                <p className="font-semibold leading-tight">{r.label}</p>
                <p className="text-sm text-ink-muted">
                  {capitalize(formatLong(r.date))} · {relativeDay(r.date)}
                </p>
              </div>
              <Button
                variant="outline"
                className="ml-auto px-3"
                onClick={() => markDone(r.kind)}
                aria-label={`${T.markDone} : ${r.label}, ${formatLong(r.date)}`}
                icon={<Check aria-hidden="true" className="h-5 w-5" strokeWidth={3} />}
              >
                {T.markDone}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function RegularityCard() {
  const history = useAppStore((s) => s.history);
  const { count, text } = regularitySummary(history);
  return (
    <Card as="section" tone="mauve" aria-labelledby="regularity-title">
      <CardHeader id="regularity-title" icon={<TrendingUp className="h-5 w-5" />} title={T.regularityTitle} />
      <div className="flex items-center gap-4">
        <p className="font-heading text-[2.5rem] font-extrabold leading-none text-mauve-700" aria-hidden="true">
          {count}
        </p>
        <p>{text}</p>
      </div>
    </Card>
  );
}

export default function Tracking() {
  return (
    <div className="container-app flex flex-col gap-4 py-4">
      <header>
        <h1 className="text-2xl">{T.title}</h1>
        <p className="mt-1 text-ink-muted">{T.intro}</p>
      </header>
      <FollowUpStatusCard />
      <UpcomingCard />
      <RemindersCard />
      <Card as="section" aria-labelledby="calendar-title">
        <CardHeader id="calendar-title" icon={<CalendarDays className="h-5 w-5" />} title={T.calendarTitle} />
        <MonthCalendar />
      </Card>
      <RegularityCard />
      <ObstaclesCard />
    </div>
  );
}
