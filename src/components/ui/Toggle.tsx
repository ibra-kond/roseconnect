import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

/** Interrupteur accessible (role="switch"). L'état est aussi indiqué par le texte « Activé / Désactivé ». */
export function Toggle({ checked, onChange, label, description, disabled, icon }: ToggleProps) {
  const id = useId();
  return (
    <div className={cn('flex items-center gap-3', disabled && 'opacity-60')}>
      {icon && (
        <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pink-50 text-plum-700">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block font-semibold leading-tight">
          {label}
        </label>
        {description && <div id={`${id}-d`} className="mt-0.5 text-sm text-ink-muted">{description}</div>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-d` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="group flex min-h-tap min-w-tap shrink-0 items-center justify-center disabled:cursor-not-allowed"
      >
        <span
          className={cn(
            'relative inline-flex h-8 w-14 items-center rounded-pill border-2 transition-colors',
            checked ? 'border-plum-700 bg-plum-700' : 'border-plum-700 bg-white',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'grid h-6 w-6 place-items-center rounded-full shadow transition-transform',
              checked ? 'translate-x-[26px] bg-white text-plum-700' : 'translate-x-[2px] bg-ink text-white',
            )}
          >
            {checked ? (
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </span>
        </span>
        <span className="sr-only">{checked ? 'Activé' : 'Désactivé'}</span>
      </button>
    </div>
  );
}
