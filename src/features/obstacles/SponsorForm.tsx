import { useState, type FormEvent } from 'react';
import { CircleCheck, HandHeart } from 'lucide-react';
import { Button } from '@/components/ui';
import { CITIES } from '@/data/facilities';
import { useAppStore } from '@/store/useAppStore';
import { strings } from '@/lib/strings.fr';
import { announce } from '@/lib/a11y';

const S = strings.sponsor;

const inputCls =
  'mt-1 block min-h-tap w-full rounded-card border-2 border-line bg-white px-4 text-base text-ink placeholder:text-ink-muted focus:border-plum-700 focus:outline-none';

/** Formulaire « Demander un parrainage » — stockage local uniquement. */
export function SponsorForm({ defaultCity, onDone }: { defaultCity?: string | null; onDone: () => void }) {
  const addSponsorRequest = useAppStore((s) => s.addSponsorRequest);
  const profileCity = useAppStore((s) => s.profile.city);
  const [name, setName] = useState('');
  const [city, setCity] = useState<string>(defaultCity ?? profileCity ?? '');
  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = S.required;
    if (!city) errs.city = S.required;
    if (!consent) errs.consent = S.consentRequired;
    setErrors(errs);
    if (Object.keys(errs).length) {
      announce(Object.values(errs)[0]);
      document.getElementById(`sp-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    addSponsorRequest({ name: name.trim(), city, contact: contact.trim() });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center py-4 text-center" role="status">
        <span aria-hidden="true" className="mb-3 grid h-16 w-16 place-items-center rounded-full bg-mauve-50 text-mauve-700">
          <CircleCheck className="h-9 w-9" />
        </span>
        <p className="font-heading text-xl font-extrabold">{S.successTitle}</p>
        <p className="mt-2 text-ink-muted">{S.successText}</p>
        <Button className="mt-5" onClick={onDone} block>
          {S.close}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor="sp-name" className="font-semibold">
          {S.name}
        </label>
        <input
          id="sp-name"
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="nickname"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'sp-name-err' : undefined}
        />
        {errors.name && <p id="sp-name-err" className="mt-1 text-sm font-semibold text-plum-700">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="sp-city" className="font-semibold">
          {S.city}
        </label>
        <select
          id="sp-city"
          className={inputCls.replace('border-line', 'border-plum-700')}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          aria-invalid={!!errors.city}
          aria-describedby={errors.city ? 'sp-city-err' : undefined}
        >
          <option value="">—</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.city && <p id="sp-city-err" className="mt-1 text-sm font-semibold text-plum-700">{errors.city}</p>}
      </div>
      <div>
        <label htmlFor="sp-contact" className="font-semibold">
          {S.contact}
        </label>
        <input
          id="sp-contact"
          className={inputCls}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          inputMode="tel"
          aria-describedby="sp-contact-hint"
        />
        <p id="sp-contact-hint" className="mt-1 text-sm text-ink-muted">
          {S.contactHint}
        </p>
      </div>
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            id="sp-consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-6 w-6 shrink-0 accent-mauve-700"
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? 'sp-consent-err' : undefined}
          />
          <span>{S.consent}</span>
        </label>
        {errors.consent && <p id="sp-consent-err" className="mt-1 text-sm font-semibold text-plum-700">{errors.consent}</p>}
      </div>
      <Button type="submit" variant="secondary" icon={<HandHeart aria-hidden="true" className="h-5 w-5" />} block>
        {S.submit}
      </Button>
    </form>
  );
}
