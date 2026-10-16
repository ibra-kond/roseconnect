import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Segment<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  onChange: (v: T) => void;
  segments: Segment<T>[];
  idPrefix: string;
}

/** Onglets (role="tablist"), navigables aux flèches. */
export function SegmentedControl<T extends string>({ label, value, onChange, segments, idPrefix }: SegmentedControlProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + segments.length) % segments.length;
    onChange(segments[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 rounded-pill border-2 border-plum-700 bg-white p-1 shadow-soft">
      {segments.map((s, i) => {
        const selected = s.value === value;
        return (
          <button
            key={s.value}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${s.value}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${s.value}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(s.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              'flex min-h-tap flex-1 items-center justify-center gap-2 rounded-pill px-3 font-heading font-bold transition-colors',
              selected ? 'bg-plum-700 text-white shadow-soft' : 'text-ink hover:bg-pink-50',
            )}
          >
            {s.icon}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
