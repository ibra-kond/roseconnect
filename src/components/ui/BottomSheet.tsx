import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'framer-motion';
import { X } from 'lucide-react';
import { trapFocus } from '@/lib/a11y';
import { strings } from '@/lib/strings.fr';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Feuille modale (bas de l'écran sur mobile, centrée sur desktop). */
export function BottomSheet({ open, onClose, title, description, children, footer }: BottomSheetProps) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => panelRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (panelRef.current) trapFocus(panelRef.current, e);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      lastFocused.current?.focus?.();
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <m.div
            className="absolute inset-0 bg-ink/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-t`}
            aria-describedby={description ? `${id}-d` : undefined}
            tabIndex={-1}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative z-10 flex max-h-[90dvh] w-full max-w-app flex-col rounded-t-[24px] bg-cream shadow-lift outline-none sm:m-4 sm:rounded-[24px]"
          >
            <div aria-hidden="true" className="mx-auto mt-2 h-1.5 w-10 rounded-pill bg-line sm:hidden" />
            <div className="flex items-start gap-3 px-4 pb-2 pt-3">
              <div className="flex-1">
                <h2 id={`${id}-t`} className="font-heading text-xl font-extrabold">
                  {title}
                </h2>
                {description && (
                  <p id={`${id}-d`} className="mt-1 text-ink-muted">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={strings.common.close}
                className="btn-icon"
              >
                <X aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-y-auto px-4 pb-4">{children}</div>
            {footer && <div className="border-t border-line px-4 py-3 pb-safe">{footer}</div>}
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
