import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { Check, FileText, HeartHandshake, Hospital } from 'lucide-react';
import { Button, Card, CardHeader, Chip } from '@/components/ui';
import { OBSTACLES, type ObstacleId } from '@/data/obstacles';
import { recommendFacility } from '@/data/recommend';
import { useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';
import { relativeDay } from '@/features/reminders/logic';
import { formatLong, toISODate, today } from '@/lib/dates';
import { strings } from '@/lib/strings.fr';

const T = strings.followUp;

function useFollowUpCenter() {
  const followUp = useAppStore((s) => s.followUp);
  const profile = useAppStore((s) => s.profile);
  const obstacles = useAppStore((s) => s.obstacles);
  const center = followUp
    ? recommendFacility({ city: profile.city, age: profile.age, symptom: followUp.symptom, obstacles })?.facility ?? null
    : null;
  return { followUp, center };
}

function useAnswers() {
  const markVisited = useAppStore((s) => s.markVisited);
  const postpone = useAppStore((s) => s.postponeFollowUp);
  const celebrate = useUiStore((s) => s.celebrate);
  const toast = useUiStore((s) => s.toast);
  const navigate = useNavigate();
  return {
    visited: () => {
      markVisited();
      celebrate();
      toast(T.visited);
    },
    notYet: (obstacle?: ObstacleId) => {
      postpone(obstacle);
      if (obstacle) {
        toast(T.postponedObstacle, 'info');
        navigate('/suivi#obstacles');
      } else toast(T.postponed, 'info');
    },
  };
}

/**
 * « Avez-vous pu aller au centre ? » : affichée sur l'accueil quelques jours après
 * la recommandation, tant que la visite n'est pas faite.
 */
export function FollowUpAskCard() {
  const { followUp, center } = useFollowUpCenter();
  const answers = useAnswers();
  const [askObstacle, setAskObstacle] = useState(false);
  if (!followUp || followUp.status !== 'pending' || followUp.checkAfter > today()) return null;

  const when = relativeDay(toISODate(new Date(followUp.ts)));
  return (
    <m.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      aria-labelledby="followup-ask-title"
      className="rounded-card border-2 border-plum-700 bg-pink-50 p-4 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-plum-700">
          <HeartHandshake className="h-5 w-5" />
        </span>
        <div>
          <h2 id="followup-ask-title" className="font-heading text-lg font-extrabold">
            {T.askTitle}
          </h2>
          {center && <p className="mt-0.5 text-ink">{T.askText(center.name, when)}</p>}
        </div>
      </div>
      {!askObstacle ? (
        <div className="mt-3 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
          <Button onClick={answers.visited} icon={<Check aria-hidden="true" className="h-5 w-5" strokeWidth={3} />}>
            {T.yes}
          </Button>
          <Button variant="outline" onClick={() => setAskObstacle(true)}>
            {T.notYet}
          </Button>
        </div>
      ) : (
        <div className="mt-3" role="group" aria-labelledby="followup-why">
          <p id="followup-why" className="font-semibold">
            {T.whatHeldYou}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {OBSTACLES.map((o) => (
              <Chip key={o.id} mode="action" onClick={() => answers.notYet(o.id)}>
                {o.label}
              </Chip>
            ))}
            <Chip mode="action" onClick={() => answers.notYet()}>
              {T.nothing}
            </Chip>
          </div>
        </div>
      )}
    </m.section>
  );
}

/** « Ma démarche de dépistage » dans Mon suivi : état de la recommandation et de la visite. */
export function FollowUpStatusCard() {
  const { followUp, center } = useFollowUpCenter();
  const openSheet = useUiStore((s) => s.openSheet);
  const answers = useAnswers();

  return (
    <Card as="section" aria-labelledby="followup-title">
      <CardHeader id="followup-title" icon={<Hospital className="h-5 w-5" />} title={T.title} />
      {!followUp ? (
        <p className="text-ink-muted">{T.empty}</p>
      ) : followUp.status === 'visited' && followUp.visitedAt ? (
        <p className="flex items-center gap-2 font-semibold text-plum-700">
          <Check aria-hidden="true" className="h-5 w-5" strokeWidth={3} />
          {T.statusVisited(formatLong(followUp.visitedAt))}
        </p>
      ) : (
        <>
          {center && <p className="font-heading text-lg font-extrabold">{center.name}</p>}
          <p className="text-ink-muted">{T.statusPending(formatLong(toISODate(new Date(followUp.ts))))}</p>
          {followUp.checkAfter > today() && <p className="mt-1 text-sm text-ink-muted">{T.nextAsk(relativeDay(followUp.checkAfter))}</p>}
          <div className="mt-3 flex flex-col gap-2">
            <Button onClick={answers.visited} icon={<Check aria-hidden="true" className="h-5 w-5" strokeWidth={3} />} block>
              {T.yes}
            </Button>
            <Button variant="outline" onClick={() => openSheet('referral')} icon={<FileText aria-hidden="true" className="h-5 w-5" />} block>
              {T.referral}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
