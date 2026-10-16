import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock, FileText, Hospital, MapPin, Phone, Sparkles } from 'lucide-react';
import { AnchorButton, Button, Card, CardHeader } from '@/components/ui';
import { useUiStore } from '@/store/useUiStore';
import { FACILITY_TYPES, telHref } from '@/data/facilities';
import { recommendFacility, type RecommendationProfile } from '@/data/recommend';
import { useAppStore } from '@/store/useAppStore';
import { strings } from '@/lib/strings.fr';
import { cn } from '@/lib/cn';

const R = strings.recommend;

const facilitiesHref = (city: string | null) =>
  `/aide?onglet=structures${city ? `&ville=${encodeURIComponent(city)}` : ''}`;

/** Corps commun : nom, adresse, horaires, raisons, appel. */
function RecommendationBody({ profile, compact }: { profile: RecommendationProfile; compact?: boolean }) {
  const openSheet = useUiStore((s) => s.openSheet);
  const hasFollowUp = useAppStore((s) => s.followUp !== null);
  const rec = recommendFacility(profile);
  if (!rec) return null;
  const f = rec.facility;
  return (
    <>
      <h3 className={cn('font-heading font-extrabold leading-tight', compact ? 'text-lg' : 'text-xl')}>{f.name}</h3>
      <p className="mt-0.5 text-sm font-semibold text-pink-700">{FACILITY_TYPES[f.type]}</p>
      <ul className="mt-2 flex flex-col gap-1 text-ink-muted">
        <li className="flex items-start gap-2">
          <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {f.district}, {f.city}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Clock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{f.hours}</span>
        </li>
      </ul>
      <p className="mt-3 text-sm font-semibold">{R.why}</p>
      <ul className="mt-1 flex flex-col gap-1">
        {rec.reasons.map((r) => (
          <li key={r} className="flex items-start gap-2">
            <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-mauve-100 p-0.5 text-plum-700" strokeWidth={3} />
            <span>{r}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-card bg-pink-50 p-3 text-sm">{R.goThere}</p>
      <div className="mt-3 flex flex-col gap-2">
        <AnchorButton
          href={telHref(f.phone)}
          variant="primary"
          aria-label={`${strings.help.callLabel(f.name)} (numéro fictif ${f.phone})`}
          icon={<Phone aria-hidden="true" className="h-5 w-5" />}
          block
        >
          <span>{strings.help.call}</span>
          <span className="whitespace-nowrap font-sans font-semibold tabular-nums">{f.phone}</span>
        </AnchorButton>
        {hasFollowUp && (
          <Button variant="secondary" onClick={() => openSheet('referral')} icon={<FileText aria-hidden="true" className="h-5 w-5" />} block>
            {strings.followUp.referral}
          </Button>
        )}
        <Link
          to={facilitiesHref(f.city)}
          className="inline-flex min-h-tap items-center justify-center gap-1 rounded-pill border-2 border-plum-700 bg-white px-5 font-heading font-bold text-ink hover:bg-pink-50"
        >
          {R.others}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}

/** Version insérée dans la discussion avec l'assistante. */
export function RecommendedFacilityChatCard({ profile }: { profile: RecommendationProfile }) {
  if (!recommendFacility(profile)) {
    return (
      <Link
        to={facilitiesHref(null)}
        className="flex min-h-tap w-full items-center gap-3 rounded-card border-2 border-plum-700 bg-white px-3 py-2 text-left font-semibold text-ink shadow-soft hover:bg-pink-50"
      >
        <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pink-50 text-plum-700">
          <Hospital className="h-5 w-5" />
        </span>
        <span className="flex-1">{R.noCity}</span>
        <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
      </Link>
    );
  }
  return (
    <article aria-label={R.title} className="rounded-card border-2 border-pink-500/60 bg-white p-4 shadow-soft">
      <p className="mb-1 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-pink-700">
        <Sparkles aria-hidden="true" className="h-4 w-4" />
        {R.title}
      </p>
      <RecommendationBody profile={profile} compact />
    </article>
  );
}

/**
 * Version « Accueil ». N'apparaît QU'APRÈS un échange où l'assistante a jugé
 * un suivi chez un professionnel nécessaire (`followUp`).
 */
export function RecommendedFacilityHomeCard() {
  const followUp = useAppStore((s) => s.followUp);
  const age = useAppStore((s) => s.profile.age);
  const city = useAppStore((s) => s.profile.city);
  const obstacles = useAppStore((s) => s.obstacles);
  const profile: RecommendationProfile = { age, city, obstacles, symptom: followUp?.symptom };
  if (!followUp || followUp.status === 'visited' || !recommendFacility(profile)) return null;

  return (
    <Card as="section" id="centre-recommande" aria-labelledby="reco-title" className="scroll-mt-20 border-2 border-pink-500/40">
      <CardHeader id="reco-title" icon={<Hospital className="h-5 w-5" />} title={R.homeTitle} />
      <p className="mb-2 text-sm text-ink-muted">{R.basedOn}</p>
      <RecommendationBody profile={profile} />
    </Card>
  );
}
