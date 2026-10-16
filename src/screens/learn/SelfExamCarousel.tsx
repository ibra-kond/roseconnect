import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { BellRing, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, MediaPlaceholder } from '@/components/ui';
import { SelfExamIllustration } from '@/assets/illustrations';
import { SELF_EXAM_STEPS } from '@/data/selfExamSteps';
import { useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';
import { strings } from '@/lib/strings.fr';
import { cn } from '@/lib/cn';

const L = strings.learn;

export function SelfExamCarousel() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const touchX = useRef<number | null>(null);
  const enabled = useAppStore((s) => s.selfExam.enabled);
  const setEnabled = useAppStore((s) => s.setSelfExamEnabled);
  const toast = useUiStore((s) => s.toast);
  const total = SELF_EXAM_STEPS.length;
  const step = SELF_EXAM_STEPS[index];

  const go = (i: number) => {
    const next = Math.max(0, Math.min(total - 1, i));
    setDir(next > index ? 1 : -1);
    setIndex(next);
  };

  return (
    <div>
      <div
        role="group"
        aria-roledescription="carrousel"
        aria-label={L.selfExamTitle}
        className="overflow-hidden rounded-card bg-white shadow-soft"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <m.div
            key={step.id}
            role="group"
            aria-roledescription="étape"
            aria-label={L.step(index + 1, total)}
            initial={{ opacity: 0, x: dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -24 }}
            transition={{ duration: 0.22 }}
          >
            <MediaPlaceholder
              alt={step.alt}
              ratio="4/3"
              src={step.image}
              fit="contain"
              eager
              className={cn('rounded-none', step.image && 'bg-white')}
            >
              <SelfExamIllustration step={step.id} />
            </MediaPlaceholder>
            <div className="p-4" aria-live="polite">
              <p className="text-sm font-semibold text-plum-700">{L.step(index + 1, total)}</p>
              <h3 className="mt-1 font-heading text-lg font-extrabold">{step.title}</h3>
              <p className="mt-1 text-ink-muted">{step.text}</p>
            </div>
          </m.div>
        </AnimatePresence>
        <div className="flex items-center gap-2 px-2 pb-3">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label={L.prev}
            className="btn-icon"
          >
            <ChevronLeft aria-hidden="true" className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-center">
            {SELF_EXAM_STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={L.goToStep(i + 1)}
                aria-current={i === index ? 'step' : undefined}
                className="grid h-tap w-8 place-items-center"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'block rounded-pill transition-all',
                    i === index ? 'h-2.5 w-6 bg-plum-700' : 'h-3 w-3 border-2 border-plum-700 bg-white',
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === total - 1}
            aria-label={L.next}
            className="btn-icon"
          >
            <ChevronRight aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
      </div>

      {enabled ? (
        <p className="mt-3 flex min-h-tap items-center justify-center gap-2 rounded-pill bg-mauve-50 px-4 py-1 font-semibold text-ink">
          <Check aria-hidden="true" className="h-5 w-5" strokeWidth={3} />
          {L.remindActive} ·{' '}
          <Link to="/suivi" className="rounded-pill border-2 border-plum-700 bg-white px-3 py-1 text-ink hover:bg-pink-50">
            {strings.nav.tracking}
          </Link>
        </p>
      ) : (
        <Button
          className="mt-3"
          variant="secondary"
          icon={<BellRing aria-hidden="true" className="h-5 w-5" />}
          onClick={() => {
            setEnabled(true);
            toast(L.remindActivated);
          }}
          block
        >
          {L.remindMonthly}
        </Button>
      )}
    </div>
  );
}
