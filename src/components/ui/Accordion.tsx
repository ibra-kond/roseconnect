import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  headingLevel?: 3 | 4;
}

/** Accordéon accessible : bouton avec aria-expanded + aria-controls, région associée. */
export function AccordionItem({ title, children, defaultOpen = false, headingLevel = 3 }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const H = headingLevel === 3 ? 'h3' : 'h4';
  return (
    <div className="rounded-card border-2 border-plum-700 bg-white shadow-soft">
      <H className="font-sans text-base font-semibold">
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-tap w-full items-center gap-3 rounded-card px-4 py-3 text-left"
        >
          <span className="flex-1">{title}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn('h-5 w-5 shrink-0 text-ink-muted transition-transform', open && 'rotate-180')}
          />
        </button>
      </H>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        hidden={!open}
        className="px-4 pb-4"
      >
        {children}
      </div>
    </div>
  );
}

export function Accordion({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}
