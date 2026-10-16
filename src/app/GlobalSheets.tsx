import { useEffect } from 'react';
import { Bell, BellRing, Hospital, Info } from 'lucide-react';
import { BottomSheet, Button, EmptyState } from '@/components/ui';
import { SponsorForm } from '@/features/obstacles/SponsorForm';
import { PreparePhrases } from '@/features/obstacles/PreparePhrases';
import { ReferralSheet } from '@/features/referral/ReferralSheet';
import { useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';
import { formatShort, formatTime, toISODate } from '@/lib/dates';
import { strings } from '@/lib/strings.fr';

function NotificationsList() {
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationsRead);
  const clear = useAppStore((s) => s.clearNotifications);

  // Ouvrir le centre = tout marquer comme lu (après affichage).
  useEffect(() => {
    const t = window.setTimeout(markRead, 1500);
    return () => window.clearTimeout(t);
  }, [markRead]);

  if (notifications.length === 0)
    return (
      <EmptyState
        icon={<Bell className="h-8 w-8" />}
        title={strings.notifications.empty}
        text={strings.notifications.emptyHint}
      />
    );

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {notifications.map((n) => (
          <li key={n.id} className="flex gap-3 rounded-card bg-white p-3 shadow-soft">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pink-50 text-plum-700"
            >
              {n.kind === 'info' ? <Info className="h-5 w-5" /> : n.kind === 'followup' ? <Hospital className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">
                {!n.read && (
                  <span className="mr-1.5 inline-block rounded-pill bg-plum-700 px-2 py-0.5 align-middle text-[0.75rem] font-bold text-white">
                    Nouveau
                  </span>
                )}
                {n.title}
              </p>
              <p className="mt-0.5 text-ink-muted">{n.body}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {formatShort(toISODate(new Date(n.ts)))} · {formatTime(n.ts)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <Button variant="ghost" onClick={clear}>
        {strings.notifications.clear}
      </Button>
    </div>
  );
}

/** Feuilles modales ouvrables depuis n'importe quel écran (chatbot, obstacles, en-tête). */
export function GlobalSheets() {
  const sheet = useUiStore((s) => s.sheet);
  const city = useUiStore((s) => s.sheetCity);
  const close = useUiStore((s) => s.closeSheet);

  return (
    <>
      <BottomSheet open={sheet === 'notifications'} onClose={close} title={strings.notifications.title}>
        <NotificationsList />
      </BottomSheet>
      <BottomSheet open={sheet === 'sponsor'} onClose={close} title={strings.sponsor.title} description={strings.sponsor.intro}>
        <SponsorForm defaultCity={city} onDone={close} />
      </BottomSheet>
      <BottomSheet
        open={sheet === 'prepare'}
        onClose={close}
        title={strings.tracking.prepareTitle}
        description={strings.tracking.prepareIntro}
      >
        <PreparePhrases />
      </BottomSheet>
      <BottomSheet open={sheet === 'referral'} onClose={close} title={strings.referral.title} description={strings.referral.intro}>
        <ReferralSheet />
      </BottomSheet>
    </>
  );
}
