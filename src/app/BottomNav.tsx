import { NavLink } from 'react-router-dom';
import { BookOpen, CalendarCheck, House, MessageCircleHeart, type LucideIcon } from 'lucide-react';
import { strings } from '@/lib/strings.fr';
import { cn } from '@/lib/cn';

const TABS: Array<{ to: string; label: string; Icon: LucideIcon; end?: boolean }> = [
  { to: '/', label: strings.nav.home, Icon: House, end: true },
  { to: '/comprendre', label: strings.nav.learn, Icon: BookOpen },
  { to: '/aide', label: strings.nav.help, Icon: MessageCircleHeart },
  { to: '/suivi', label: strings.nav.tracking, Icon: CalendarCheck },
];

/** Barre du bas. Onglet actif : couleur + pastille de forme + texte en gras ; aria-current="page" (NavLink). */
export function BottomNav() {
  return (
    <nav aria-label={strings.nav.label} className="border-t border-line bg-white pb-safe">
      <ul className="mx-auto grid max-w-app grid-cols-4">
        {TABS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[64px] flex-col items-center justify-center gap-0.5 px-1 pt-1.5 text-center text-sm leading-tight',
                  isActive ? 'font-bold text-ink' : 'font-medium text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'grid h-8 w-14 place-items-center rounded-pill border-2 transition-colors',
                      isActive ? 'border-plum-700 bg-plum-700 text-white' : 'border-plum-700 bg-white text-ink hover:bg-pink-50',
                    )}
                  >
                    <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  <span className="max-w-full">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
