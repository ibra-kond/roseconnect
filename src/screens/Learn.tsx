import { AlertCircle, HeartPulse, Leaf, Timer } from 'lucide-react';
import { Accordion, AccordionItem, Badge, Timeline, type TimelineItem } from '@/components/ui';
import { SelfExamCarousel } from './learn/SelfExamCarousel';
import { VideoPlayer } from './learn/VideoPlayer';
import { ReminderIcon } from '@/features/reminders/ReminderIcon';
import { SCREENING_DISCLAIMER, SCREENING_GUIDELINES, getGuidelinesForAge } from '@/data/screening';
import { FAQ } from '@/data/faq';
import { useAppStore } from '@/store/useAppStore';
import { strings } from '@/lib/strings.fr';

const L = strings.learn;

const WHY = [
  { Icon: HeartPulse, title: 'Plus de chances de guérir', text: 'Un cancer repéré tôt se soigne beaucoup mieux.' },
  { Icon: Leaf, title: 'Des soins plus légers', text: 'Plus c’est tôt, plus les traitements sont souvent simples.' },
  { Icon: Timer, title: 'Un examen rapide', text: 'Un examen clinique ne prend que quelques minutes.' },
];

function Section({ id, title, children, intro }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20">
      <h2 id={`${id}-title`} className="section-title">
        {title}
      </h2>
      {intro && <p className="mt-1 text-ink-muted">{intro}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function Learn() {
  const age = useAppStore((s) => s.profile.age);
  const forAge = age !== null ? new Set(getGuidelinesForAge(age).map((g) => g.id)) : new Set<string>();

  const timeline: TimelineItem[] = SCREENING_GUIDELINES.map((g) => ({
    id: g.id,
    marker: g.ageLabel,
    title: g.action,
    subtitle: g.frequencyLabel,
    description: g.description,
    highlight: forAge.has(g.id),
    highlightLabel: age !== null ? `Concerne vos ${age} ans` : undefined,
    icon: <ReminderIcon kind={g.kind} className="h-5 w-5" />,
  }));

  return (
    <div className="container-app flex flex-col gap-8 py-4">
      <header>
        <h1 className="text-2xl">{L.title}</h1>
        <p className="mt-1 text-ink-muted">{L.intro}</p>
      </header>

      <Section id="auto-palpation" title={L.selfExamTitle} intro={L.selfExamIntro}>
        <SelfExamCarousel />
      </Section>

      <Section id="pourquoi" title={L.whyTitle}>
        <VideoPlayer />
        <ul className="mt-3 grid gap-3">
          {WHY.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3 rounded-card bg-mauve-50 p-4">
              <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-mauve-700">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-heading font-extrabold">{title}</h3>
                <p className="text-ink-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="reperes" title={L.guidelinesTitle}>
        <p className="mb-4 flex items-start gap-2 rounded-card border-2 border-warning/40 bg-warning-50 p-3 font-semibold text-warning">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          {SCREENING_DISCLAIMER}
        </p>
        <Timeline items={timeline} label={L.guidelinesTitle} />
      </Section>

      <Section id="mythes" title={L.mythsTitle} intro={L.mythsIntro}>
        <Accordion>
          {FAQ.map((f) => (
            <AccordionItem key={f.id} title={`« ${f.statement} »`}>
              <Badge tone={f.verdict === 'myth' ? 'pink' : 'mauve'} className="mb-2">
                {f.verdict === 'myth' ? `✗ ${L.myth}` : `✓ ${L.reality}`}
              </Badge>
              <p className="text-ink">{f.answer}</p>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
    </div>
  );
}
