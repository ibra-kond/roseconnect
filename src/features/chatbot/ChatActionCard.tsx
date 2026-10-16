import { Link } from 'react-router-dom';
import { ArrowRight, BellRing, BookOpen, Check, HandHeart, Hospital, Mountain } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { rangeToAge } from '@/data/screening';
import { RecommendedFacilityChatCard } from '@/features/recommendation/RecommendedFacility';
import { useUiStore } from '@/store/useUiStore';
import { strings } from '@/lib/strings.fr';
import type { ChatCard } from './types';

const cls =
  'flex min-h-tap w-full items-center gap-3 rounded-card border-2 border-plum-700 bg-white px-3 py-2 text-left font-semibold text-ink shadow-soft hover:bg-pink-50';

/** Carte d'action insérée dans la discussion. */
export function ChatActionCard({ card }: { card: ChatCard }) {
  const selfExamEnabled = useAppStore((s) => s.selfExam.enabled);
  const setSelfExamEnabled = useAppStore((s) => s.setSelfExamEnabled);
  const openSheet = useUiStore((s) => s.openSheet);
  const toast = useUiStore((s) => s.toast);
  const profileCity = useAppStore((s) => s.profile.city);
  const profileAge = useAppStore((s) => s.profile.age);
  const obstacles = useAppStore((s) => s.obstacles);

  const icon = (node: React.ReactNode) => (
    <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pink-50 text-plum-700">
      {node}
    </span>
  );
  const arrow = <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />;

  switch (card.kind) {
    case 'recommendation':
      return (
        <RecommendedFacilityChatCard
          profile={{
            city: card.city ?? profileCity,
            age: card.ageRange ? rangeToAge(card.ageRange) : profileAge,
            symptom: card.symptom,
            obstacles,
          }}
        />
      );
    case 'facilities': {
      const href = `/aide?onglet=structures${card.city ? `&ville=${encodeURIComponent(card.city)}` : ''}`;
      return (
        <Link to={href} className={cls}>
          {icon(<Hospital className="h-5 w-5" />)}
          <span className="flex-1">{card.city ? strings.common.seeFacilitiesIn(card.city) : strings.common.seeFacilities}</span>
          {arrow}
        </Link>
      );
    }
    case 'reminder':
      return selfExamEnabled ? (
        <p className={`${cls} cursor-default hover:bg-white`} role="status">
          {icon(<Check className="h-5 w-5" strokeWidth={3} />)}
          <span className="flex-1">{strings.chatScript.reminderCardDone}</span>
        </p>
      ) : (
        <button
          type="button"
          className={cls}
          onClick={() => {
            setSelfExamEnabled(true);
            toast(strings.chatScript.reminderActivated);
          }}
        >
          {icon(<BellRing className="h-5 w-5" />)}
          <span className="flex-1">{strings.common.activateReminder}</span>
          {arrow}
        </button>
      );
    case 'sponsor':
      return (
        <button type="button" className={cls} onClick={() => openSheet('sponsor', profileCity)}>
          <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pink-50 text-plum-700">
            <HandHeart className="h-5 w-5" />
          </span>
          <span className="flex-1">{strings.common.requestSponsor}</span>
          {arrow}
        </button>
      );
    case 'obstacles':
      return (
        <Link to="/suivi#obstacles" className={cls}>
          {icon(<Mountain className="h-5 w-5" />)}
          <span className="flex-1">{strings.common.seeObstacles}</span>
          {arrow}
        </Link>
      );
    case 'learn':
      return (
        <Link to="/comprendre#auto-palpation" className={cls}>
          {icon(<BookOpen className="h-5 w-5" />)}
          <span className="flex-1">{strings.learn.selfExamTitle}</span>
          {arrow}
        </Link>
      );
  }
}
