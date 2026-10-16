import { useRef, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Captions, Pause, Play, RotateCcw } from 'lucide-react';
import { strings } from '@/lib/strings.fr';
import { cn } from '@/lib/cn';

const L = strings.learn;

/**
 * Vidéo de sensibilisation (montage de 4 plans libres de droits, Pexels) avec sous-titres.
 * Chaque plan dure SCENE_MS : le titre et le sous-titre affichés suivent le plan en cours.
 * La même transcription est fournie en piste <track> pour le plein écran et les lecteurs d'écran.
 */
const SCENES = [
  { headline: 'Un cancer fréquent', caption: 'Le cancer du sein est l’un des cancers les plus fréquents chez la femme, ici comme ailleurs.' },
  { headline: 'Tôt, c’est mieux', caption: 'Détecté tôt, il se soigne beaucoup mieux, avec des traitements souvent plus légers.' },
  { headline: 'Des repères simples', caption: 'Auto-palpation chaque mois, et examen par un professionnel selon votre âge.' },
  { headline: 'Un doute ? On consulte', caption: 'Au moindre changement, parlez-en à un professionnel. ROSECONNECT vous aide à trouver où aller.' },
];
const SCENE_MS = 7000;
const TOTAL_MS = SCENES.length * SCENE_MS;
const VIDEO_SRC = '/media/video-sensibilisation.mp4';
const POSTER_SRC = '/media/video-poster.webp';
const CAPTIONS_SRC = '/media/video-sensibilisation.fr.vtt';

function fmt(ms: number) {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function VideoPlayer() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ended, setEnded] = useState(false);
  const [subs, setSubs] = useState(true);

  const sceneIndex = Math.min(SCENES.length - 1, Math.floor(elapsed / SCENE_MS));
  const scene = SCENES[sceneIndex];
  const started = elapsed > 0 || playing;

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused || v.ended) {
      if (v.ended) v.currentTime = 0;
      void v.play();
    } else {
      v.pause();
    }
  };

  return (
    <figure className="overflow-hidden rounded-card bg-white shadow-soft">
      <div className="relative aspect-video w-full overflow-hidden bg-pink-50">
        <video
          ref={video}
          className="absolute inset-0 h-full w-full object-cover"
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          preload="metadata"
          playsInline
          muted
          aria-label={`${L.videoTitle}. ${started ? scene.caption : ''}`}
          onPlay={() => {
            setPlaying(true);
            setEnded(false);
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setEnded(true);
          }}
          onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime * 1000)}
        >
          <track kind="captions" srcLang="fr" label="Français" src={CAPTIONS_SRC} />
        </video>

        <AnimatePresence mode="wait" initial={false}>
          {started && (
            <m.p
              key={sceneIndex}
              aria-hidden="true"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-3 top-3 rounded-pill bg-white/90 px-3 py-1 font-heading text-sm font-extrabold text-plum-700"
            >
              {scene.headline}
            </m.p>
          )}
        </AnimatePresence>

        {!playing && (
          <button
            type="button"
            onClick={toggle}
            aria-label={ended ? L.videoReplay : L.videoPlay}
            className="absolute inset-0 grid place-items-center bg-ink/10"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-plum-700 text-white shadow-lift">
              {ended ? <RotateCcw aria-hidden="true" className="h-7 w-7" /> : <Play aria-hidden="true" className="ml-1 h-8 w-8" fill="currentColor" />}
            </span>
          </button>
        )}

        {subs && started && (
          <p
            aria-live="polite"
            className="absolute inset-x-3 bottom-3 rounded-lg bg-ink/85 px-3 py-2 text-center text-[0.95rem] font-medium leading-snug text-white"
          >
            {scene.caption}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 px-2 py-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? L.videoPause : ended ? L.videoReplay : L.videoPlay}
          className="btn-icon"
        >
          {playing ? <Pause aria-hidden="true" className="h-6 w-6" /> : <Play aria-hidden="true" className="h-6 w-6" />}
        </button>
        <div
          className="h-2 flex-1 overflow-hidden rounded-pill bg-pink-50"
          role="progressbar"
          aria-label="Progression de la vidéo"
          aria-valuemin={0}
          aria-valuemax={Math.round(TOTAL_MS / 1000)}
          aria-valuenow={Math.round(elapsed / 1000)}
        >
          <div className="h-full rounded-pill bg-plum-700" style={{ width: `${Math.min(100, (elapsed / TOTAL_MS) * 100)}%` }} />
        </div>
        <span className="w-[5.5rem] text-center text-sm tabular-nums text-ink-muted">
          <span className="sr-only">{L.videoDuration} : </span>
          {fmt(elapsed)} / {fmt(TOTAL_MS)}
        </span>
        <button
          type="button"
          onClick={() => setSubs((s) => !s)}
          aria-pressed={subs}
          aria-label={L.videoSubtitles}
          className={cn(
            'btn-icon',
            subs && 'bg-pink-500 hover:bg-pink-600',
          )}
        >
          <Captions aria-hidden="true" className="h-6 w-6" />
        </button>
      </div>
      <figcaption className="px-4 pb-4 font-heading font-extrabold">{L.videoTitle}</figcaption>
    </figure>
  );
}
