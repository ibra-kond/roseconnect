import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, BellRing, BookMarked, Camera, ChevronLeft, EyeOff, Info, Lock, LogOut, RefreshCw, Trash, UserRound, UserX } from 'lucide-react';
import { BottomSheet, Button, Card, CardHeader, LinkButton, Toggle } from '@/components/ui';
import { usePrefsStore } from '@/store/usePrefsStore';
import { useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';
import { useCurrentAccount } from '@/features/auth/useAuthStore';
import { deleteCurrentAccount, logout, setAccountBirthDate, updateAccountName } from '@/features/auth/session';
import {
  browserNotificationState,
  requestBrowserNotifications,
  type BrowserNotifState,
} from '@/features/reminders/notify';
import { CITIES, isCity } from '@/data/facilities';
import { ageToRange, MAX_AGE, MIN_AGE, rangeLabel } from '@/data/screening';
import { formatBirthDate, yearsAgo } from '@/lib/dates';
import { strings } from '@/lib/strings.fr';

const S = strings.settings;

const inputCls =
  'mt-1 block min-h-tap w-full rounded-card border-2 border-line bg-white px-4 text-base text-ink focus:border-plum-700 focus:outline-none';

function ProfileCard() {
  const account = useCurrentAccount();
  const age = useAppStore((s) => s.profile.age);
  const profileCity = useAppStore((s) => s.profile.city);
  const setCity = useAppStore((s) => s.setCity);
  const toast = useUiStore((s) => s.toast);
  const [name, setName] = useState(account?.name ?? '');
  const [city, setCityValue] = useState<string>(profileCity ?? '');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const maxBirth = yearsAgo(MIN_AGE);
  const minBirth = yearsAgo(MAX_AGE + 1);

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError(strings.auth.required);
    if (!account?.birthDate && birthDate) {
      if (birthDate > maxBirth || birthDate < minBirth) return setError(strings.auth.birthDateInvalid);
      setAccountBirthDate(birthDate);
    }
    setError('');
    updateAccountName(name);
    setCity(isCity(city) ? city : null);
    toast(S.profileSaved);
  };

  return (
    <Card as="section" aria-labelledby="profile-title">
      <CardHeader id="profile-title" icon={<UserRound className="h-5 w-5" />} title={S.profileTitle} />
      <form onSubmit={save} noValidate className="flex flex-col gap-3">
        <div>
          <label htmlFor="pf-name" className="font-semibold">
            {S.profileName}
          </label>
          <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={inputCls} />
        </div>
        {account && !account.demo && (
          <p className="text-sm text-ink-muted">
            {S.profilePhone} : <strong className="font-semibold text-ink">{account.phone}</strong>
          </p>
        )}
        {account?.birthDate ? (
          <div className="rounded-card bg-mauve-50 p-3">
            <p className="font-semibold">
              {S.profileBirthDate} : {formatBirthDate(account.birthDate)}
            </p>
            {age !== null && <p className="text-plum-700">{S.profileRange(age, rangeLabel(ageToRange(age)).toLowerCase())}</p>}
            <p className="mt-1 text-sm text-ink-muted">{S.profileBirthDateLocked}</p>
          </div>
        ) : (
          <div>
            <label htmlFor="pf-birth" className="font-semibold">
              {S.profileBirthDate}
            </label>
            <input
              id="pf-birth"
              type="date"
              min={minBirth}
              max={maxBirth}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              aria-describedby="pf-birth-hint"
              className={inputCls}
            />
            <p id="pf-birth-hint" className="mt-1 text-sm text-ink-muted">
              {strings.auth.birthDateHint}
            </p>
          </div>
        )}
        <div>
          <label htmlFor="pf-city" className="font-semibold">
            {S.profileCity}
          </label>
          <select id="pf-city" value={city} onChange={(e) => setCityValue(e.target.value)} className={inputCls.replace('border-line', 'border-plum-700')}>
            <option value="">—</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p role="alert" className="text-sm font-semibold text-plum-700">
            {error}
          </p>
        )}
        <Button type="submit" block>
          {S.profileSave}
        </Button>
      </form>
    </Card>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const clearData = useAppStore((s) => s.clearData);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const toast = useUiStore((s) => s.toast);
  const [confirm, setConfirm] = useState<'clear' | 'delete' | null>(null);
  const [notif, setNotif] = useState<BrowserNotifState>(browserNotificationState);
  const discreet = usePrefsStore((s) => s.discreet);
  const setDiscreet = usePrefsStore((s) => s.setDiscreet);

  const notifLabel: Record<BrowserNotifState, string> = {
    granted: S.notifGranted,
    denied: S.notifDenied,
    unsupported: S.notifUnsupported,
    default: S.notifEnable,
  };

  const signOut = () => {
    logout();
    toast(strings.auth.loggedOut, 'info');
    navigate('/connexion', { replace: true });
  };

  return (
    <div className="container-app flex flex-col gap-4 py-4">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          aria-label={strings.header.back}
          className="btn-icon mr-2"
        >
          <ChevronLeft aria-hidden="true" className="h-6 w-6" />
        </button>
        <h1 className="text-2xl">{S.title}</h1>
      </div>

      <ProfileCard />

      <Button variant="outline" icon={<LogOut aria-hidden="true" className="h-5 w-5" />} onClick={signOut} block>
        {S.logout}
      </Button>

      <Card as="section" aria-labelledby="privacy-title">
        <CardHeader id="privacy-title" icon={<Lock className="h-5 w-5" />} title={S.privacyTitle} />
        <p className="text-ink-muted">{S.privacyText}</p>
        <div className="mt-4 flex flex-col gap-3">
          <Button variant="outline" icon={<Trash aria-hidden="true" className="h-5 w-5" />} onClick={() => setConfirm('clear')} block>
            {S.clearData}
          </Button>
          {account?.demo && (
            <Button
              variant="soft"
              icon={<RefreshCw aria-hidden="true" className="h-5 w-5" />}
              onClick={() => {
                resetDemo();
                toast(S.resetDone);
              }}
              block
            >
              {S.resetDemo}
            </Button>
          )}
          <Button variant="ghost" icon={<UserX aria-hidden="true" className="h-5 w-5" />} onClick={() => setConfirm('delete')} block>
            {S.deleteAccount}
          </Button>
        </div>
      </Card>

      <Card as="section" aria-labelledby="discreet-title">
        <CardHeader id="discreet-title" icon={<EyeOff className="h-5 w-5" />} title={strings.privacy.title} />
        <Toggle
          checked={discreet}
          onChange={(v) => {
            setDiscreet(v);
            toast(v ? strings.privacy.on : strings.privacy.off, 'info');
          }}
          label={strings.privacy.toggle}
          description={strings.privacy.text}
        />
        <ul className="mt-3 list-disc space-y-1 pl-5 text-ink">
          {strings.privacy.effects.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-ink-muted">{strings.privacy.limit}</p>
      </Card>

      <Card as="section" aria-labelledby="impact-link-title">
        <CardHeader id="impact-link-title" icon={<BarChart3 className="h-5 w-5" />} title={strings.impact.title} />
        <p className="text-ink-muted">{strings.impact.openHint}</p>
        <LinkButton to="/impact" variant="outline" className="mt-3" block>
          {strings.impact.open}
        </LinkButton>
      </Card>

      <Card as="section" aria-labelledby="notif-title">
        <CardHeader id="notif-title" icon={<BellRing className="h-5 w-5" />} title={S.notifPermission} />
        <p className="text-ink-muted">{S.notifPermissionText}</p>
        <Button
          className="mt-3"
          variant={notif === 'granted' ? 'soft' : 'primary'}
          disabled={notif !== 'default'}
          onClick={async () => setNotif(await requestBrowserNotifications())}
          block
        >
          {notifLabel[notif]}
        </Button>
      </Card>

      <Card as="section" aria-labelledby="about-title">
        <CardHeader id="about-title" icon={<Info className="h-5 w-5" />} title={S.aboutTitle} />
        <p className="text-ink-muted">{S.aboutText}</p>
        <p className="mt-2 text-sm text-ink-muted">
          {S.version} · {strings.app.demoDataLong}
        </p>
      </Card>

      <Card as="section" aria-labelledby="sources-title">
        <CardHeader id="sources-title" icon={<BookMarked className="h-5 w-5" />} title={S.sourcesTitle} />
        <ul className="list-disc space-y-1 pl-5 text-ink-muted">
          {S.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="mt-3 rounded-card bg-warning-50 p-3 text-sm font-medium text-warning">{S.sourcesNote}</p>
      </Card>

      <Card as="section" aria-labelledby="credits-title">
        <CardHeader id="credits-title" icon={<Camera className="h-5 w-5" />} title={S.mediaCreditsTitle} />
        <ul className="list-disc space-y-1 pl-5 text-ink-muted">
          {S.mediaCredits.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Card>

      <BottomSheet
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === 'delete' ? S.deleteConfirmTitle : S.clearConfirmTitle}
        description={confirm === 'delete' ? S.deleteConfirmText : S.clearConfirmText}
      >
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() => {
              if (confirm === 'delete') {
                deleteCurrentAccount();
                toast(S.deleted);
                navigate('/connexion', { replace: true });
              } else {
                clearData();
                toast(S.cleared);
              }
              setConfirm(null);
            }}
            block
          >
            {confirm === 'delete' ? S.deleteConfirm : S.clearConfirm}
          </Button>
          <Button variant="ghost" onClick={() => setConfirm(null)} block>
            {S.cancel}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
