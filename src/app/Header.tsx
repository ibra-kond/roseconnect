import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Logo } from '@/assets/Logo';
import { useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';
import { useCurrentAccount } from '@/features/auth/useAuthStore';
import { useAppName } from '@/store/usePrefsStore';
import { strings } from '@/lib/strings.fr';

export function Header() {
  const unread = useAppStore((s) => s.notifications.filter((n) => !n.read).length);
  const openSheet = useUiStore((s) => s.openSheet);
  const name = useCurrentAccount()?.name ?? '';
  const appName = useAppName();
  return (
    <header className="pt-safe sticky top-0 z-30 border-b border-line/70 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <div className="mx-auto flex h-16 max-w-app items-center gap-2 px-4 lg:max-w-5xl">
        <Link to="/" aria-label={strings.header.homeLink(appName)} className="-ml-1 flex min-h-tap items-center rounded-pill px-1">
          <Logo />
        </Link>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => openSheet('notifications')}
          aria-label={unread ? strings.header.notificationsUnread(unread) : strings.header.notifications}
          className="btn-icon relative"
        >
          <Bell aria-hidden="true" className="h-6 w-6" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-pill bg-plum-700 px-1 text-[0.75rem] font-bold leading-none text-white ring-2 ring-cream"
            >
              {unread}
            </span>
          )}
        </button>
        <Link
          to="/reglages"
          aria-label={strings.header.mySpace(name)}
          className="btn-icon -mr-1 ml-1"
        >
          <span
            aria-hidden="true"
            className="grid h-full w-full place-items-center rounded-full bg-pink-100 font-heading text-lg font-extrabold text-ink"
          >
            {name.charAt(0).toUpperCase() || '?'}
          </span>
        </Link>
      </div>
    </header>
  );
}
