import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ChipProps {
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
  /** `toggle` : sélection (aria-pressed). `action` : simple bouton (réponses rapides). */
  mode?: 'toggle' | 'action';
  tone?: 'pink' | 'mauve';
  className?: string;
}

/**
 * Puce sélectionnable : contour bordeaux et texte noir. Sélectionnée : fond rose + coche (l'état n'est pas indiqué que par la couleur).
 * `tone` est conservé pour compatibilité ; les deux tons ont le même rendu.
 */
export function Chip({ selected = false, onClick, children, mode = 'toggle', className }: ChipProps) {
  const selectedCls = 'border-plum-700 bg-pink-500 text-ink';
  const idleCls = 'border-plum-700 bg-white text-ink hover:bg-pink-50';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={mode === 'toggle' ? selected : undefined}
      className={cn(
        'inline-flex min-h-tap items-center gap-1.5 rounded-pill border-2 px-4 text-left text-base font-semibold leading-tight transition-colors',
        selected ? selectedCls : idleCls,
        className,
      )}
    >
      {mode === 'toggle' && selected && <Check aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={3} />}
      {children}
    </button>
  );
}
