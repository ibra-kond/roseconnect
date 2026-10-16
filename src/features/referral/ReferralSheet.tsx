import { useState } from 'react';
import { Copy, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { recommendFacility } from '@/data/recommend';
import { useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';
import { useCurrentAccount } from '@/features/auth/useAuthStore';
import { today } from '@/lib/dates';
import { strings } from '@/lib/strings.fr';
import { buildReferral } from './referral';
import { QrCode } from './QrCode';

const F = strings.referral;

/** Contenu de la feuille « Fiche de liaison » (imprimable, partageable, avec QR code). */
export function ReferralSheet() {
  const account = useCurrentAccount();
  const followUp = useAppStore((s) => s.followUp);
  const profile = useAppStore((s) => s.profile);
  const obstacles = useAppStore((s) => s.obstacles);
  const toast = useUiStore((s) => s.toast);
  const [showName, setShowName] = useState(true);

  if (!followUp) return <p className="text-ink-muted">{strings.followUp.empty}</p>;

  const facility =
    recommendFacility({ city: profile.city, age: profile.age, symptom: followUp.symptom, obstacles })?.facility ?? null;
  const referral = buildReferral({
    name: showName ? (account?.name ?? null) : null,
    age: profile.age,
    followUp,
    obstacles,
    facility,
    date: today(),
  });

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: F.heading, text: referral.text });
      else {
        await navigator.clipboard.writeText(referral.text);
        toast(F.copied);
      }
    } catch {
      /* partage annulé */
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={showName}
          onChange={(e) => setShowName(e.target.checked)}
          className="h-6 w-6 shrink-0 accent-plum-700"
        />
        <span>{F.showName}</span>
      </label>

      <article aria-labelledby="referral-heading" className="rounded-card border-2 border-plum-700 bg-white p-4 text-ink">
        <h3 id="referral-heading" className="font-heading text-lg font-extrabold uppercase tracking-wide">
          {F.heading}
        </h3>
        <dl className="mt-3 flex flex-col gap-2">
          {referral.rows.map((r) => (
            <div key={r.label}>
              <dt className="text-sm font-semibold text-ink-muted">{r.label}</dt>
              <dd className="font-semibold">{r.value}</dd>
            </div>
          ))}
          <div>
            <dt className="text-sm font-semibold text-ink-muted">{F.needs}</dt>
            <dd>
              {referral.needs.length ? (
                <ul className="list-disc pl-5 font-semibold">
                  {referral.needs.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              ) : (
                <span className="font-semibold">{F.needsNone}</span>
              )}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex items-center gap-3 border-t border-line pt-3">
          <QrCode value={referral.text} label={F.qrLabel} className="print-qr h-28 w-28 shrink-0" />
          <p className="text-sm text-ink-muted">{F.qrLabel}</p>
        </div>
        <p className="mt-3 rounded-card bg-pink-50 p-2 text-sm font-semibold">{F.footer}</p>
      </article>

      <div className="flex flex-col gap-2">
        <Button onClick={() => window.print()} icon={<Printer aria-hidden="true" className="h-5 w-5" />} block>
          {F.print}
        </Button>
        <Button
          variant="outline"
          onClick={share}
          icon={'share' in navigator ? <Share2 aria-hidden="true" className="h-5 w-5" /> : <Copy aria-hidden="true" className="h-5 w-5" />}
          block
        >
          {'share' in navigator ? F.share : F.copy}
        </Button>
      </div>
    </div>
  );
}
