import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui';
import { NeutralMark } from '@/assets/Logo';
import { useCurrentAccount } from '@/features/auth/useAuthStore';
import { verifyPassword } from '@/features/auth/password';
import { logout } from '@/features/auth/session';
import { NEUTRAL_NAME, usePrefsStore } from '@/store/usePrefsStore';
import { strings } from '@/lib/strings.fr';

const P = strings.privacy;

/** Écran de verrouillage du mode discret : neutre, il ne révèle rien de l'application. */
export function LockScreen() {
  const account = useCurrentAccount();
  const unlock = usePrefsStore((s) => s.unlock);
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstName = account?.name ?? '';

  useEffect(() => {
    document.title = NEUTRAL_NAME;
    inputRef.current?.focus();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!account?.password) return unlock(); // compte démo, sans code
    setBusy(true);
    const ok = await verifyPassword(code, account.password);
    setBusy(false);
    if (ok) unlock();
    else {
      setError(P.wrongCode);
      setCode('');
      inputRef.current?.focus();
    }
  };

  const switchAccount = () => {
    logout();
    usePrefsStore.getState().unlock();
    navigate('/connexion', { replace: true });
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-sm text-center">
        <NeutralMark className="mx-auto h-20 w-20" />
        <p className="mt-3 font-heading text-2xl font-extrabold">{NEUTRAL_NAME}</p>
        <h1 className="mt-6 flex items-center justify-center gap-2 text-xl">
          <Lock aria-hidden="true" className="h-5 w-5 text-plum-700" />
          {P.lockTitle}
        </h1>
        <p className="mt-1 text-ink-muted">{P.lockText(firstName)}</p>
        <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-3 text-left">
          {account?.password ? (
            <div>
              <label htmlFor="lock-code" className="font-semibold">
                {strings.auth.password}
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  id="lock-code"
                  type={visible ? 'text' : 'password'}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'lock-err' : undefined}
                  className="mt-1 block min-h-tap w-full rounded-card border-2 border-line bg-white px-4 pr-14 text-base text-ink focus:border-plum-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  aria-label={visible ? strings.auth.hidePassword : strings.auth.showPassword}
                  aria-pressed={visible}
                  className="btn-icon absolute right-1.5 top-[calc(50%+2px)] h-10 w-10 -translate-y-1/2"
                >
                  {visible ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
                </button>
              </div>
              {error && (
                <p id="lock-err" role="alert" className="mt-1 text-sm font-semibold text-plum-700">
                  {error}
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-ink-muted">{P.lockDemo}</p>
          )}
          <Button type="submit" disabled={busy || (!!account?.password && !code)} block>
            {P.unlock}
          </Button>
          <Button variant="outline" onClick={switchAccount} block>
            {P.switchAccount}
          </Button>
        </form>
      </div>
    </main>
  );
}
