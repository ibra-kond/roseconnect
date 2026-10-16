import { ArrowRight, BookOpen, CalendarCheck, Check, Lock, MessageCircleHeart, Ribbon, Sparkles, UserRound } from 'lucide-react';
import { m } from 'framer-motion';
import { Badge, Button, Card, CardHeader, LinkButton, MediaPlaceholder } from '@/components/ui';
import { HeroIllustration } from '@/assets/illustrations';
import { ReminderIcon } from '@/features/reminders/ReminderIcon';
import { getUpcomingReminders, relativeDay } from '@/features/reminders/logic';
import { useMarkDone } from '@/features/reminders/useMarkDone';
import { RecommendedFacilityHomeCard } from '@/features/recommendation/RecommendedFacility';
import { FollowUpAskCard } from '@/features/followup/FollowUpCards';
import { usePrefsStore } from '@/store/usePrefsStore';
import { useCurrentAccount } from '@/features/auth/useAuthStore';
import { ageToRange, getGuidelinesForAge, rangeLabel, SCREENING_DISCLAIMER } from '@/data/screening';
import { useAppStore } from '@/store/useAppStore';
import { capitalize, formatLong } from '@/lib/dates';
import { strings } from '@/lib/strings.fr';

const H = strings.home;

function ScreeningCard() {
  const age = useAppStore((s) => s.profile.age);
  const reminders = useAppStore((s) => getUpcomingReminders(s));
  const next = reminders[0];

  return (
    <Card as="section" tone="mauve" aria-labelledby="screening-title">
      <CardHeader id="screening-title" icon={<CalendarCheck className="h-5 w-5" />} title={H.screeningTitle} />
      {age === null ? (
        <>
          <p>{H.birthDateMissing}</p>
          <LinkButton to="/reglages" className="mt-3" block>
            {H.birthDateAdd}
          </LinkButton>
        </>
      ) : (
        <>
          <p className="font-semibold text-plum-700">{H.forYourAge(age, rangeLabel(ageToRange(age)).toLowerCase())}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {getGuidelinesForAge(age).map((g) => (
              <li key={g.id} className="flex items-center gap-3 rounded-card bg-white p-3">
                <ReminderIcon kind={g.kind} className="h-5 w-5 shrink-0 text-plum-700" />
                <span>
                  <strong className="font-semibold">{g.action}</strong> {g.frequencyLabel}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            <span className="text-ink-muted">{H.nextReminder} : </span>
            {next ? (
              <strong className="font-semibold">
                {capitalize(formatLong(next.date))} <span className="font-normal text-ink-muted">({relativeDay(next.date)})</span>
              </strong>
            ) : (
              <span>{H.noReminder}</span>
            )}
          </p>
          <p className="mt-1 text-sm text-ink-muted">{SCREENING_DISCLAIMER}</p>
          <LinkButton
            to="/comprendre#reperes"
            className="mt-3"
            iconRight={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
            block
          >
            {H.seeAllGuidelines}
          </LinkButton>
        </>
      )}
    </Card>
  );
}

function NextActionCard() {
  const reminders = useAppStore((s) => getUpcomingReminders(s));
  const markDone = useMarkDone();
  const next = reminders[0];
  return (
    <Card as="section" aria-labelledby="next-title">
      <CardHeader id="next-title" icon={<Sparkles className="h-5 w-5" />} title={H.nextActionTitle} />
      {next ? (
        <div className="flex flex-wrap items-center gap-3">
          <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pink-50 text-plum-700">
            <ReminderIcon kind={next.kind} className="h-6 w-6" />
          </span>
          <div className="min-w-[9rem] flex-1">
            <p className="font-semibold leading-tight">{next.label}</p>
            <p className="text-ink-muted">
              {capitalize(formatLong(next.date))} · {relativeDay(next.date)}
            </p>
          </div>
          <Button
            variant="primary"
            className="ml-auto px-4"
            onClick={() => markDone(next.kind)}
            aria-label={`${H.done} : ${next.label}, ${formatLong(next.date)}`}
            icon={<Check aria-hidden="true" className="h-5 w-5" strokeWidth={3} />}
          >
            {H.done}
          </Button>
        </div>
      ) : (
        <>
          <p className="text-ink-muted">{H.nextActionEmpty}</p>
          <LinkButton to="/suivi" variant="outline" className="mt-3" block>
            {H.nextActionActivate}
          </LinkButton>
        </>
      )}
    </Card>
  );
}

export default function Home() {
  const name = useCurrentAccount()?.name;
  const age = useAppStore((s) => s.profile.age);
  const discreet = usePrefsStore((s) => s.discreet);
  return (
    <div className="container-app flex flex-col gap-4 py-4">
      {name && (
        <div>
          <p className="font-heading text-xl font-extrabold text-plum-700">{H.greeting(name)}</p>
          {age !== null && (
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              <Badge tone="pink" icon={<UserRound aria-hidden="true" className="h-3.5 w-3.5" />}>
                {H.spaceFor(rangeLabel(ageToRange(age)))}
              </Badge>
              <span>{H.spaceHint}</span>
            </p>
          )}
        </div>
      )}
      <FollowUpAskCard />
      <m.section
        aria-labelledby="hero-title"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-[24px] bg-gradient-to-b from-pink-50 to-white shadow-soft"
      >
        {!discreet && (
          <MediaPlaceholder
            alt="Femme souriante sur fond rose, qui tient devant sa poitrine une affiche de sensibilisation au cancer du sein."
            ratio="16/9"
            src="/media/accueil-ruban-rose.webp"
            position="50% 0%"
            eager
            className="rounded-none bg-transparent"
          >
            <HeroIllustration />
          </MediaPlaceholder>
        )}
        <div className="px-5 pb-5 pt-1">
          <h1 id="hero-title" className="text-2xl text-plum-700">
            {H.heroTitle}
          </h1>
          <p className="mt-2 text-ink-muted">{H.heroText}</p>
          <div className="mt-4 flex flex-col gap-3">
            <LinkButton to="/comprendre" variant="primary" icon={<BookOpen aria-hidden="true" className="h-5 w-5" />} block>
              {H.ctaLearn}
            </LinkButton>
            <LinkButton to="/aide" variant="secondary" icon={<MessageCircleHeart aria-hidden="true" className="h-5 w-5" />} block>
              {H.ctaHelp}
            </LinkButton>
          </div>
        </div>
      </m.section>

      <ScreeningCard />
      <RecommendedFacilityHomeCard />
      <NextActionCard />

      <Card as="section" tone="pink" aria-labelledby="fact-title" className="relative overflow-hidden">
        <Ribbon aria-hidden="true" className="absolute -right-4 -top-2 h-28 w-28 rotate-12 text-pink-500/20" />
        <h2 id="fact-title" className="text-sm font-semibold uppercase tracking-wide text-plum-700">
          {H.keyFactTitle}
        </h2>
        <p className="relative mt-1 font-heading text-xl font-extrabold leading-snug">{H.keyFact}</p>
        <p className="relative mt-2 text-sm text-ink-muted">{H.keyFactSource}</p>
      </Card>

      <section
        aria-labelledby="soon-title"
        aria-disabled="true"
        className="flex cursor-not-allowed select-none items-center gap-3 rounded-card border-2 border-dashed border-line bg-[#F6EEF2] p-4 text-ink-muted"
      >
        <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/70">
          <Ribbon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="soon-title" className="font-heading text-lg font-extrabold text-ink-muted">
            {H.soonTitle}
          </h2>
          <p className="text-sm">{H.soonText}</p>
        </div>
        <Badge tone="neutral" icon={<Lock aria-hidden="true" className="h-3.5 w-3.5" />}>
          {H.soonBadge}
        </Badge>
      </section>
    </div>
  );
}
