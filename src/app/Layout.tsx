import { Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { GlobalSheets } from './GlobalSheets';
import { DisclaimerBanner, Toaster, Celebration } from '@/components/ui';
import { useReminderChecker } from '@/features/reminders/useReminderChecker';
import { appName, AUTO_LOCK_MS, usePrefsStore } from '@/store/usePrefsStore';
import { strings } from '@/lib/strings.fr';

const TITLES: Record<string, string> = {
  '/': strings.app.slogan,
  '/comprendre': strings.nav.learn,
  '/aide': strings.nav.help,
  '/suivi': strings.nav.tracking,
  '/reglages': strings.settings.title,
  '/impact': strings.impact.title,
};

function ScreenFallback() {
  return (
    <div className="container-app py-10" aria-busy="true">
      <div className="h-40 animate-pulse rounded-card bg-white" />
      <span className="sr-only">{strings.common.loading}</span>
    </div>
  );
}

export function Layout() {
  useReminderChecker();
  const discreet = usePrefsStore((s) => s.discreet);

  // Mode discret : verrouillage après un passage en arrière-plan.
  useEffect(() => {
    if (!discreet) return;
    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt >= AUTO_LOCK_MS) usePrefsStore.getState().lock();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [discreet]);
  const { pathname, hash } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Titre de page. Mode discret : aucun nom évocateur dans l'onglet ni dans le sélecteur d'applications.
  useEffect(() => {
    const t = TITLES[pathname];
    const name = appName();
    document.title = t && pathname !== '/' ? `${t} · ${name}` : discreet ? name : `${name} — De l’inquiétude à l’action`;
  }, [pathname, discreet]);

  // Focus sur le contenu à chaque changement d'écran (lecteurs d'écran).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!hash) window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Ancre (#reperes, #obstacles…) : on attend que l'écran (chargé à la demande) soit monté.
  useEffect(() => {
    if (!hash) return;
    let tries = 0;
    const id = window.setInterval(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el || ++tries > 20) {
        window.clearInterval(id);
        el?.scrollIntoView({ block: 'start' });
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [pathname, hash]);

  // Réserve la hauteur exacte de la barre du bas (bandeau + navigation + zone sûre).
  useLayoutEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const apply = () => document.documentElement.style.setProperty('--bottom-h', `${el.offsetHeight}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only-focusable fixed left-2 top-2 z-[80] rounded-pill bg-ink px-4 py-3 font-semibold text-white"
      >
        {strings.app.skipToContent}
      </a>
      <Header />
      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="flex-1 outline-none"
        style={{ paddingBottom: 'calc(var(--bottom-h, 120px) + 24px)' }}
      >
        <Suspense fallback={<ScreenFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <div ref={bottomRef} className="fixed inset-x-0 bottom-0 z-40">
        <DisclaimerBanner />
        <BottomNav />
      </div>
      <Toaster />
      <Celebration />
      <GlobalSheets />
      <div id="a11y-live" aria-live="polite" className="sr-only" />
    </div>
  );
}
