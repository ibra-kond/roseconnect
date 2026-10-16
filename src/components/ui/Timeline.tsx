import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TimelineItem {
  id: string;
  marker: string;
  title: string;
  subtitle?: string;
  description?: string;
  highlight?: boolean;
  highlightLabel?: string;
  icon?: ReactNode;
}

/** Frise verticale. L'élément mis en avant porte un libellé texte en plus de la couleur. */
export function Timeline({ items, label }: { items: TimelineItem[]; label: string }) {
  return (
    <ol aria-label={label} className="relative ml-5 border-l-2 border-dashed border-pink-500/50">
      {items.map((item) => (
        <li key={item.id} className="relative pb-6 pl-8 last:pb-0">
          <span
            aria-hidden="true"
            className={cn(
              'absolute -left-[21px] top-0 grid h-10 w-10 place-items-center rounded-full border-4 border-cream',
              item.highlight ? 'bg-plum-700 text-white' : 'bg-pink-100 text-plum-700',
            )}
          >
            {item.icon}
          </span>
          <div className={cn('rounded-card p-4 shadow-soft', item.highlight ? 'bg-pink-50 ring-2 ring-plum-700' : 'bg-white')}>
            <p className="text-sm font-semibold uppercase tracking-wide text-plum-700">{item.marker}</p>
            <h3 className="mt-1 font-heading text-lg font-extrabold">
              {item.title}
              {item.subtitle && <span className="font-sans text-base font-semibold text-ink-muted"> · {item.subtitle}</span>}
            </h3>
            {item.description && <p className="mt-1 text-ink-muted">{item.description}</p>}
            {item.highlight && item.highlightLabel && (
              <p className="mt-2 inline-flex items-center gap-1 rounded-pill bg-white px-3 py-1 text-sm font-semibold text-plum-700">
                ★ {item.highlightLabel}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
