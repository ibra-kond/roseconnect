import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Filter, FlaskConical, Lock, Mountain, Users } from 'lucide-react';
import { Card, CardHeader, Toggle } from '@/components/ui';
import { computeImpact, SAMPLE_IMPACT, type ImpactStats } from '@/features/impact/impact';
import { collectDeviceSpaces } from '@/features/impact/deviceSpaces';
import { strings } from '@/lib/strings.fr';

const I = strings.impact;
const pct = (v: number) => `${Math.round(v * 100)} %`;

/** Tuile chiffre-clé. */
function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border-2 border-line bg-white p-3">
      <p className="text-sm font-semibold text-ink-muted">{label}</p>
      <p className="font-heading text-[1.75rem] font-extrabold leading-tight tabular-nums text-ink">{value}</p>
      {hint && <p className="text-sm text-ink-muted">{hint}</p>}
    </div>
  );
}

/**
 * Barres horizontales à une seule série (bordeaux) : libellé et valeur en texte,
 * barre décorative ; l'infobulle donne la valeur exacte.
 */
function BarList({ items, max, label }: { items: Array<{ key: string; label: string; value: number; display: string }>; max: number; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-col gap-3">
      {items.map((it) => (
        <li key={it.key} title={`${it.label} : ${it.display}`}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-ink">{it.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-ink">{it.display}</span>
          </div>
          <div aria-hidden="true" className="mt-1 h-3 w-full rounded-r bg-pink-50">
            <div
              className="h-3 rounded-r bg-plum-700 transition-[width] duration-500"
              style={{ width: `${max ? Math.max(it.value ? 2 : 0, (it.value / max) * 100) : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Dashboard({ s }: { s: ImpactStats }) {
  const funnel = [
    { key: 'spaces', label: I.spaces, value: s.spaces, display: String(s.spaces) },
    { key: 'oriented', label: I.oriented, value: s.oriented, display: `${s.oriented}${s.spaces ? ` (${pct(s.oriented / s.spaces)})` : ''}` },
    { key: 'visited', label: I.visited, value: s.visited, display: `${s.visited}${s.spaces ? ` (${pct(s.visited / s.spaces)})` : ''}` },
  ];
  const maxObstacle = Math.max(0, ...s.obstacles.map((o) => o.count));
  const maxAge = Math.max(0, ...s.ages.map((a) => a.count));

  return (
    <>
      <section aria-label={I.actionRate} className="rounded-card bg-plum-700 p-4 text-white shadow-soft">
        <p className="font-semibold">{I.actionRate}</p>
        <p className="font-heading text-[3rem] font-extrabold leading-none tabular-nums">
          {s.actionRate === null ? I.noData : pct(s.actionRate)}
        </p>
        <p className="mt-1 text-white/90">{I.actionRateHint}</p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Stat label={I.spaces} value={String(s.spaces)} />
        <Stat label={I.oriented} value={String(s.oriented)} />
        <Stat label={I.visited} value={String(s.visited)} />
        <Stat label={I.medianDelay} value={s.medianDelayDays === null ? I.noData : I.days(s.medianDelayDays)} />
      </div>

      <Card as="section" aria-labelledby="funnel-title">
        <CardHeader id="funnel-title" icon={<Filter className="h-5 w-5" />} title={I.funnelTitle} />
        <BarList items={funnel} max={s.spaces} label={I.funnelTitle} />
        <p className="mt-3 text-sm text-ink-muted">{I.funnelHint}</p>
      </Card>

      <Card as="section" aria-labelledby="obstacles-impact-title">
        <CardHeader id="obstacles-impact-title" icon={<Mountain className="h-5 w-5" />} title={I.obstaclesTitle} />
        {s.obstacles.length ? (
          <BarList
            items={s.obstacles.map((o) => ({ key: o.id, label: o.label, value: o.count, display: String(o.count) }))}
            max={maxObstacle}
            label={I.obstaclesTitle}
          />
        ) : (
          <p className="text-ink-muted">{I.obstaclesEmpty}</p>
        )}
      </Card>

      <Card as="section" aria-labelledby="ages-title">
        <CardHeader id="ages-title" icon={<Users className="h-5 w-5" />} title={I.agesTitle} />
        <BarList
          items={s.ages.map((a) => ({ key: a.id, label: a.label, value: a.count, display: String(a.count) }))}
          max={maxAge}
          label={I.agesTitle}
        />
        <p className="mt-3 text-ink">
          {I.selfExams} : <strong className="tabular-nums">{s.selfExams90}</strong>
        </p>
      </Card>
    </>
  );
}

export default function Impact() {
  const navigate = useNavigate();
  const [sample, setSample] = useState(false);
  const device = useMemo(() => computeImpact(collectDeviceSpaces()), []);

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
        <h1 className="text-2xl">{I.title}</h1>
      </div>
      <p className="text-ink-muted">{I.intro}</p>

      <Card>
        <Toggle checked={sample} onChange={setSample} label={I.sampleToggle} icon={<FlaskConical className="h-5 w-5" />} />
      </Card>
      <p
        className={
          sample
            ? 'rounded-card border-2 border-dashed border-warning/60 bg-warning-50 p-3 font-semibold text-warning'
            : 'text-sm text-ink-muted'
        }
        role="status"
      >
        {sample ? I.scopeSample : I.scopeDevice}
      </p>

      <Dashboard s={sample ? SAMPLE_IMPACT : device} />

      <p className="flex gap-2 rounded-card bg-mauve-50 p-3 text-sm text-ink-muted">
        <Lock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-plum-700" />
        <span>{I.privacy}</span>
      </p>
    </div>
  );
}
