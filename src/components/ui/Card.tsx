import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'white' | 'mauve' | 'pink' | 'warning' | 'muted';

const tones: Record<Tone, string> = {
  white: 'bg-white',
  mauve: 'bg-mauve-50',
  pink: 'bg-pink-50',
  warning: 'bg-warning-50 border border-warning/30',
  muted: 'bg-[#F6EEF2]',
};

interface CardProps extends HTMLAttributes<HTMLElement> {
  tone?: Tone;
  as?: 'section' | 'article' | 'div' | 'li';
  children: ReactNode;
}

export function Card({ tone = 'white', as: Tag = 'div', className, children, ...rest }: CardProps) {
  return (
    <Tag className={cn('rounded-card p-4 shadow-soft', tones[tone], className)} {...rest}>
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  icon?: ReactNode;
  title: string;
  id?: string;
  level?: 2 | 3;
  action?: ReactNode;
}

export function CardHeader({ icon, title, id, level = 2, action }: CardHeaderProps) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <div className="mb-3 flex items-center gap-3">
      {icon && (
        <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/80 text-plum-700">
          {icon}
        </span>
      )}
      <H id={id} className="flex-1 font-heading text-lg font-extrabold leading-tight">
        {title}
      </H>
      {action}
    </div>
  );
}
