import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'mauve' | 'pink' | 'neutral' | 'warning' | 'outline';

const tones: Record<Tone, string> = {
  mauve: 'bg-mauve-50 text-mauve-700 ring-1 ring-mauve-700/20',
  pink: 'bg-pink-50 text-plum-700 ring-1 ring-plum-700/20',
  neutral: 'bg-[#F1E6EC] text-ink-muted',
  warning: 'bg-warning-50 text-warning ring-1 ring-warning/30',
  outline: 'bg-white text-ink ring-1 ring-line',
};

export function Badge({ tone = 'neutral', icon, children, className }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-sm font-semibold leading-none',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
