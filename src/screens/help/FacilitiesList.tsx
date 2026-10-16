import { useMemo } from 'react';
import { Clock, Gift, HandCoins, MapPin, Phone, Search, SearchX, UserRound, CalendarDays, FlaskConical } from 'lucide-react';
import { AnchorButton, Badge, Button, Chip, EmptyState } from '@/components/ui';
import { CITIES, FACILITIES, FACILITY_TYPES, normalize, telHref, type City, type Facility, type FacilityType } from '@/data/facilities';
import { strings } from '@/lib/strings.fr';

const S = strings.help;

function FacilityCard({ f }: { f: Facility }) {
  return (
    <article aria-labelledby={`fac-${f.id}`} className="flex h-full flex-col rounded-card bg-white p-4 shadow-soft">
      <Badge tone={f.type === 'depistage' ? 'pink' : 'mauve'} className="self-start">
        {FACILITY_TYPES[f.type]}
      </Badge>
      <h3 id={`fac-${f.id}`} className="mt-2 font-heading text-lg font-extrabold leading-tight">
        {f.name}
      </h3>
      <ul className="mt-2 flex flex-col gap-1 text-ink-muted">
        <li className="flex items-start gap-2">
          <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {f.district}, {f.city}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Clock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{f.hours}</span>
        </li>
      </ul>
      {(f.freeScreeningOctober || f.socialRate || f.openSaturday || f.femaleStaff) && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Services">
          {f.freeScreeningOctober && (
            <li>
              <Badge tone="pink" icon={<Gift aria-hidden="true" className="h-3.5 w-3.5" />}>
                {S.freeOctober}
              </Badge>
            </li>
          )}
          {f.socialRate && (
            <li>
              <Badge tone="mauve" icon={<HandCoins aria-hidden="true" className="h-3.5 w-3.5" />}>
                {S.socialRate}
              </Badge>
            </li>
          )}
          {f.openSaturday && (
            <li>
              <Badge tone="outline" icon={<CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />}>
                {S.saturday}
              </Badge>
            </li>
          )}
          {f.femaleStaff && (
            <li>
              <Badge tone="outline" icon={<UserRound aria-hidden="true" className="h-3.5 w-3.5" />}>
                {S.femaleStaff}
              </Badge>
            </li>
          )}
        </ul>
      )}
      <div className="mt-auto pt-4">
        <AnchorButton
          href={telHref(f.phone)}
          variant="primary"
          aria-label={`${S.callLabel(f.name)} (numéro fictif ${f.phone})`}
          icon={<Phone aria-hidden="true" className="h-5 w-5" />}
          block
        >
          <span>{S.call}</span>
          <span className="whitespace-nowrap font-sans font-semibold tabular-nums">{f.phone}</span>
        </AnchorButton>
      </div>
    </article>
  );
}

interface Props {
  city: City | null;
  type: FacilityType | null;
  query: string;
  onChange: (next: { city?: City | null; type?: FacilityType | null; query?: string }) => void;
}

/** Liste filtrable des structures (données fictives). */
export function FacilitiesList({ city, type, query, onChange }: Props) {
  const results = useMemo(() => {
    const q = normalize(query.trim());
    return FACILITIES.filter(
      (f) =>
        (!city || f.city === city) &&
        (!type || f.type === type) &&
        (!q || normalize(`${f.name} ${f.district} ${f.city} ${FACILITY_TYPES[f.type]}`).includes(q)),
    );
  }, [city, type, query]);

  const hasFilters = !!city || !!type || !!query;

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-2 rounded-card border-2 border-dashed border-warning/50 bg-warning-50 px-4 py-2 font-semibold text-warning">
        <FlaskConical aria-hidden="true" className="h-5 w-5 shrink-0" />
        <span>
          {strings.app.demoData} <span className="font-normal">— {strings.app.demoDataLong}</span>
        </span>
      </p>

      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-20 lg:w-80 lg:shrink-0">
          <div className="relative">
            <label htmlFor="fac-search" className="sr-only">
              {S.searchLabel}
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
            <input
              id="fac-search"
              type="search"
              value={query}
              onChange={(e) => onChange({ query: e.target.value })}
              placeholder={S.searchPlaceholder}
              className="min-h-tap w-full rounded-pill border-2 border-line bg-white pl-12 pr-4 text-base placeholder:text-ink-muted focus:border-plum-700 focus:outline-none"
            />
          </div>
          <fieldset className="min-w-0">
            <legend className="mb-1 text-sm font-semibold text-ink-muted">{S.cityFilter}</legend>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
              <Chip selected={!city} onClick={() => onChange({ city: null })} className="shrink-0">
                {S.all}
              </Chip>
              {CITIES.map((c) => (
                <Chip key={c} selected={city === c} onClick={() => onChange({ city: city === c ? null : c })} className="shrink-0">
                  {c}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset className="min-w-0">
            <legend className="mb-1 text-sm font-semibold text-ink-muted">{S.typeFilter}</legend>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
              <Chip tone="mauve" selected={!type} onClick={() => onChange({ type: null })} className="shrink-0">
                {S.allTypes}
              </Chip>
              {(Object.keys(FACILITY_TYPES) as FacilityType[]).map((t) => (
                <Chip
                  key={t}
                  tone="mauve"
                  selected={type === t}
                  onClick={() => onChange({ type: type === t ? null : t })}
                  className="shrink-0"
                >
                  {FACILITY_TYPES[t]}
                </Chip>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-2 font-semibold" role="status" aria-live="polite">
            {S.results(results.length)}
          </p>
          {results.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-8 w-8" />}
              title={S.emptyTitle}
              text={S.emptyText}
              action={
                hasFilters && (
                  <Button variant="outline" onClick={() => onChange({ city: null, type: null, query: '' })}>
                    {S.resetFilters}
                  </Button>
                )
              }
            />
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {results.map((f) => (
                <li key={f.id}>
                  <FacilityCard f={f} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
