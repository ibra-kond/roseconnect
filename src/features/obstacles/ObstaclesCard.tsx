import { AnimatePresence, m } from 'framer-motion';
import { ArrowRight, CircleCheck, Mountain } from 'lucide-react';
import { Button, Card, CardHeader, Chip } from '@/components/ui';
import { OBSTACLES } from '@/data/obstacles';
import { useAppStore } from '@/store/useAppStore';
import { useObstacleAction } from './useObstacleAction';
import { strings } from '@/lib/strings.fr';

const T = strings.tracking;

/** « Mes obstacles » : sélection multiple + solutions concrètes et bouton d'action. */
export function ObstaclesCard() {
  const selected = useAppStore((s) => s.obstacles);
  const toggle = useAppStore((s) => s.toggleObstacle);
  const runAction = useObstacleAction();
  const chosen = OBSTACLES.filter((o) => selected.includes(o.id));

  return (
    <Card as="section" id="obstacles" aria-labelledby="obstacles-title" className="scroll-mt-20">
      <CardHeader id="obstacles-title" icon={<Mountain className="h-5 w-5" />} title={T.obstaclesTitle} />
      <p className="text-ink-muted">{T.obstaclesIntro}</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={T.obstaclesTitle}>
        {OBSTACLES.map((o) => (
          <Chip key={o.id} selected={selected.includes(o.id)} onClick={() => toggle(o.id)}>
            {o.label}
          </Chip>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3" aria-live="polite">
        <AnimatePresence initial={false}>
          {chosen.map((o) => (
            <m.article
              key={o.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              aria-labelledby={`obs-${o.id}`}
              className="rounded-card bg-pink-50 p-4"
            >
              <h3 id={`obs-${o.id}`} className="font-heading text-lg font-extrabold text-plum-700">
                {o.label}
              </h3>
              <p className="mt-1 font-medium">{o.intro}</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {o.solutions.map((s) => (
                  <li key={s} className="flex gap-2">
                    <CircleCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-mauve-700" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-3"
                variant="secondary"
                onClick={() => runAction(o.action.type)}
                iconRight={<ArrowRight aria-hidden="true" className="h-5 w-5" />}
                block
              >
                {o.action.label}
              </Button>
            </m.article>
          ))}
        </AnimatePresence>
        {chosen.length === 0 && <p className="text-ink-muted">{T.obstaclesEmpty}</p>}
      </div>
    </Card>
  );
}
