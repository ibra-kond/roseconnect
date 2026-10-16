import { ChevronDown, Info } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { strings } from '@/lib/strings.fr';
import { cn } from '@/lib/cn';

/** Bandeau permanent « ne remplace pas un avis médical », repliable. */
export function DisclaimerBanner() {
  const expanded = useUiStore((s) => s.disclaimerExpanded);
  const setExpanded = useUiStore((s) => s.setDisclaimerExpanded);
  return (
    <aside aria-label="Avertissement médical" className="border-t border-line bg-[#FBF0F5]">
      <div className="mx-auto max-w-app px-4">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="disclaimer-more"
          onClick={() => setExpanded(!expanded)}
          className="my-1 flex min-h-[40px] w-full items-center gap-2 rounded-pill border-2 border-plum-700 bg-white px-3 py-1 text-left text-sm text-ink hover:bg-pink-50"
        >
          <Info aria-hidden="true" className="h-4 w-4 shrink-0 text-plum-700" />
          <span className="flex-1 font-medium">{strings.app.disclaimer}</span>
          <span className="sr-only">{expanded ? strings.app.disclaimerLessLabel : strings.app.disclaimerMoreLabel}</span>
          <ChevronDown aria-hidden="true" className={cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-180')} />
        </button>
        <p id="disclaimer-more" hidden={!expanded} className="pb-2 pl-6 text-sm text-ink-muted">
          {strings.app.disclaimerMore}
        </p>
      </div>
    </aside>
  );
}
