import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { Eye, EyeOff, Lock, LogIn, Sparkles, UserPlus } from 'lucide-react';
import { Button, SegmentedControl, Toaster } from '@/components/ui';
import { NeutralMark, RibbonMark } from '@/assets/Logo';
import { useAppName, usePrefsStore } from '@/store/usePrefsStore';
import { MAX_AGE, MIN_AGE } from '@/data/screening';
import { AuthError, isValidPhone, login, loginDemo, register } from '@/features/auth/session';
import { useAuthStore, type Account } from '@/features/auth/useAuthStore';
import { useUiStore } from '@/store/useUiStore';
import { announce } from '@/lib/a11y';
import { yearsAgo } from '@/lib/dates';
import { strings } from '@/lib/strings.fr';
import { cn } from '@/lib/cn';

const A = strings.auth;
type Mode = 'login' | 'register';
type Errors = Partial<Record<'name' | 'phone' | 'loginId' | 'password' | 'confirm' | 'birthDate' | 'form', string>>;

const inputCls =
  'mt-1 block min-h-tap w-full rounded-card border-2 border-line bg-white px-4 text-base text-ink placeholder:text-ink-muted focus:border-plum-700 focus:outline-none aria-[invalid=true]:border-plum-700';

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm font-semibold text-plum-700">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-err` : hint ? `${id}-hint` : undefined;
}

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  error,
  hint,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  error?: string;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(inputCls, 'pr-14')}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? A.hidePassword : A.showPassword}
        aria-pressed={visible}
        className="btn-icon absolute right-1.5 top-[calc(50%+2px)] h-10 w-10 -translate-y-1/2"
      >
        {visible ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
      </button>
    </div>
  );
}

export default function Auth() {
  const loggedIn = useAuthStore((s) => s.currentUserId !== null);
  const discreet = usePrefsStore((s) => s.discreet);
  const name_ = useAppName();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useUiStore((s) => s.toast);
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [mode, setMode] = useState<Mode>(() =>
    useAuthStore.getState().accounts.some((a) => !a.demo) ? 'login' : 'register',
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = discreet ? name_ : `${A.title} · ${name_}`;
  }, [discreet, name_]);

  if (loggedIn && !busy) return <Navigate to={from} replace />;

  // Bornes du champ date : entre 15 et 99 ans aujourd'hui.
  const maxBirth = yearsAgo(MIN_AGE);
  const minBirth = yearsAgo(MAX_AGE + 1);

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
  };

  const fail = (errs: Errors) => {
    setErrors(errs);
    const first = Object.keys(errs)[0];
    announce(Object.values(errs)[0] ?? '');
    if (first && first !== 'form') document.getElementById(`auth-${first}`)?.focus();
  };

  const enter = (account: Account, isNew: boolean) => {
    toast(isNew ? A.welcome(account.name) : A.welcomeBack(account.name));
    navigate(from, { replace: true });
  };

  const validateRegister = (): Errors => {
    const errs: Errors = {};
    if (!name.trim()) errs.name = A.required;
    if (!phone.trim()) errs.phone = A.required;
    else if (!isValidPhone(phone)) errs.phone = A.phoneInvalid;
    if (!password) errs.password = A.required;
    else if (password.length < 4) errs.password = A.passwordTooShort;
    if (!errs.password && confirm !== password) errs.confirm = A.passwordMismatch;
    if (!birthDate) errs.birthDate = A.required;
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || birthDate > maxBirth || birthDate < minBirth)
      errs.birthDate = A.birthDateInvalid;
    return errs;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const errs: Errors =
      mode === 'register'
        ? validateRegister()
        : { ...(!loginId.trim() && { loginId: A.required }), ...(!password && { password: A.required }) };
    if (Object.keys(errs).length) return fail(errs);

    setBusy(true);
    try {
      const account =
        mode === 'register' ? await register({ name, phone, birthDate, password }) : await login(loginId, password);
      enter(account, mode === 'register');
    } catch (err) {
      setBusy(false);
      if (err instanceof AuthError && err.code === 'phoneTaken') fail({ phone: A.phoneTaken });
      else fail({ form: A.badCredentials });
    }
  };

  const demo = async () => {
    setBusy(true);
    const account = await loginDemo();
    enter(account, false);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="pt-safe relative overflow-hidden bg-plum-700 px-4 pb-16 pt-10 text-center text-white">
        <span aria-hidden="true" className="absolute -left-16 -top-10 h-48 w-48 rounded-full bg-pink-500/40 blur-2xl" />
        <span aria-hidden="true" className="absolute -right-10 top-16 h-40 w-40 rounded-full bg-mauve-300/40 blur-2xl" />
        <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white shadow-lift">
            {discreet ? <NeutralMark className="h-14 w-14" /> : <RibbonMark className="h-14 w-14" />}
          </span>
          <p className="mt-3 font-heading text-[1.75rem] font-extrabold tracking-tight">{name_}</p>
          {!discreet && <p className="mt-1 text-white/90">{strings.app.slogan}</p>}
        </m.div>
      </header>

      <main id="main" className="relative -mt-8 flex-1 rounded-t-[28px] bg-cream px-4 pb-10 pt-6">
        <div className="mx-auto flex max-w-app flex-col gap-4">
          <div>
            <h1 className="text-2xl">{discreet ? A.titleDiscreet : A.title}</h1>
            <p className="mt-1 text-ink-muted">{A.intro}</p>
          </div>

          <SegmentedControl<Mode>
            idPrefix="auth"
            label={A.tabsLabel}
            value={mode}
            onChange={switchMode}
            segments={[
              { value: 'login', label: A.tabLogin },
              { value: 'register', label: A.tabRegister },
            ]}
          />

          <form
            role="tabpanel"
            id={`auth-panel-${mode}`}
            aria-labelledby={`auth-tab-${mode}`}
            onSubmit={submit}
            noValidate
            className="flex flex-col gap-4 rounded-card bg-white p-4 shadow-soft"
          >
            {errors.form && (
              <p role="alert" className="rounded-card border-l-4 border-plum-700 bg-pink-50 p-3 font-semibold text-plum-700">
                {errors.form}
              </p>
            )}
            {mode === 'login' ? (
              <Field id="auth-loginId" label={A.loginId} hint={A.loginIdHint} error={errors.loginId}>
                <input
                  id="auth-loginId"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="words"
                  spellCheck={false}
                  maxLength={80}
                  aria-invalid={!!errors.loginId}
                  aria-describedby={describedBy('auth-loginId', errors.loginId, A.loginIdHint)}
                  className={inputCls}
                />
              </Field>
            ) : (
              <>
                <Field id="auth-name" label={A.name} error={errors.name}>
                  <input
                    id="auth-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    autoCapitalize="words"
                    maxLength={60}
                    aria-invalid={!!errors.name}
                    aria-describedby={describedBy('auth-name', errors.name)}
                    className={inputCls}
                  />
                </Field>
                <Field id="auth-phone" label={A.phone} hint={A.phoneHint} error={errors.phone}>
                  <input
                    id="auth-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    maxLength={20}
                    aria-invalid={!!errors.phone}
                    aria-describedby={describedBy('auth-phone', errors.phone, A.phoneHint)}
                    className={inputCls}
                  />
                </Field>
              </>
            )}
            <Field
              id="auth-password"
              label={A.password}
              hint={mode === 'register' ? A.passwordHint : undefined}
              error={errors.password}
            >
              <PasswordInput
                id="auth-password"
                value={password}
                onChange={setPassword}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                error={errors.password}
                hint={mode === 'register' ? A.passwordHint : undefined}
              />
            </Field>
            {mode === 'register' && (
              <>
                <Field id="auth-confirm" label={A.passwordConfirm} error={errors.confirm}>
                  <PasswordInput id="auth-confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" error={errors.confirm} />
                </Field>
                <Field id="auth-birthDate" label={A.birthDate} hint={A.birthDateHint} error={errors.birthDate}>
                  <input
                    id="auth-birthDate"
                    type="date"
                    value={birthDate}
                    min={minBirth}
                    max={maxBirth}
                    onChange={(e) => setBirthDate(e.target.value)}
                    autoComplete="bday"
                    aria-invalid={!!errors.birthDate}
                    aria-describedby={describedBy('auth-birthDate', errors.birthDate, A.birthDateHint)}
                    className={inputCls}
                  />
                </Field>
              </>
            )}
            <Button
              type="submit"
              disabled={busy}
              icon={
                mode === 'login' ? <LogIn aria-hidden="true" className="h-5 w-5" /> : <UserPlus aria-hidden="true" className="h-5 w-5" />
              }
              block
            >
              {busy ? A.working : mode === 'login' ? A.submitLogin : A.submitRegister}
            </Button>
          </form>

          <div className="flex items-center gap-3 text-sm text-ink-muted" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            {A.or}
            <span className="h-px flex-1 bg-line" />
          </div>

          <div>
            <Button variant="secondary" onClick={demo} disabled={busy} icon={<Sparkles aria-hidden="true" className="h-5 w-5" />} block>
              {A.demo}
            </Button>
            <p className="mt-1 text-center text-sm text-ink-muted">{A.demoHint}</p>
          </div>

          <p className="flex gap-2 rounded-card bg-mauve-50 p-3 text-sm text-ink-muted">
            <Lock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-plum-700" />
            <span>{A.privacy}</span>
          </p>
          <p className="text-center text-sm text-ink-muted">{discreet ? strings.app.disclaimerNeutral : strings.app.disclaimer}</p>
        </div>
      </main>
      <Toaster />
      <div id="a11y-live" aria-live="polite" className="sr-only" />
    </div>
  );
}
