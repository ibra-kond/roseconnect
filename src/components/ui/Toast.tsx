import { AnimatePresence, m } from 'framer-motion';
import { Bell, CircleCheck, X } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { strings } from '@/lib/strings.fr';

/** Zone d'affichage des toasts (annoncés aux lecteurs d'écran). */
export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);
  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 top-[72px] z-[60] mx-auto flex w-full max-w-app flex-col items-center gap-2 px-4"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <m.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className="pointer-events-auto flex w-full items-center gap-3 rounded-card bg-ink px-4 py-3 text-white shadow-lift"
          >
            {t.tone === 'success' ? (
              <CircleCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-[#D7A0B9]" />
            ) : (
              <Bell aria-hidden="true" className="h-5 w-5 shrink-0 text-[#F79BD1]" />
            )}
            <p className="flex-1 text-base font-medium">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label={strings.common.close}
              className="-mr-2 grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
