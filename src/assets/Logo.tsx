import { cn } from '@/lib/cn';
import { NEUTRAL_NAME, usePrefsStore } from '@/store/usePrefsStore';

/** Ruban rose stylisé entrelacé d'une feuille mauve. Décoratif par défaut. */
export function RibbonMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {/* boucle + pan droit */}
      <path
        d="M20 22c-3-5-3-10 0-13 2-2 6-2 8 0 3 3 3 8 0 13L36 41"
        fill="none"
        stroke="#F26ABC"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* feuille mauve, glissée sous le pan gauche */}
      <path d="M27 31c5-6 12-7 17-4-3 6-10 8-17 4Z" fill="#D7A0B9" />
      <path d="M29 30.5c4-1.6 8-2.2 12-2" stroke="#FAF3F6" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* pan gauche, par-dessus : effet entrelacé */}
      <path d="M28 22 15 41" fill="none" stroke="#863146" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/** Marque neutre du mode discret : une feuille, sans ruban ni mot évocateur. */
export function NeutralMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#FAF3F6" stroke="#D7A0B9" strokeWidth="2" />
      <path d="M14 33c0-11 8-19 21-19 0 13-8 21-19 21-1 0-2-1-2-2Z" fill="#D7A0B9" />
      <path d="M16 32c5-5 9-9 15-14" stroke="#863146" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Favicon neutre (mode discret). */
export const NEUTRAL_FAVICON = '/favicon-neutral.svg';

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  const discreet = usePrefsStore((s) => s.discreet);
  if (discreet)
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        <NeutralMark className="h-9 w-9 shrink-0" />
        {!compact && <span className="font-heading text-[1.2rem] font-extrabold tracking-tight text-ink">{NEUTRAL_NAME}</span>}
      </span>
    );
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <RibbonMark className="h-9 w-9 shrink-0" />
      {!compact && (
        <span className="font-heading text-[1.2rem] font-extrabold tracking-tight">
          <span className="text-plum-700">ROSE</span>
          <span className="text-pink-700">CONNECT</span>
        </span>
      )}
    </span>
  );
}
