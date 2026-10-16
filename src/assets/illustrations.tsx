/**
 * Illustrations SVG inline : formes organiques, silhouettes féminines stylisées
 * (peaux noires et métissées), aucune nudité réaliste. Toutes décoratives :
 * le texte alternatif est porté par le conteneur (MediaPlaceholder).
 */

const SKIN = { deep: '#5A3420', brown: '#7B4A2D', warm: '#9C6640', light: '#B97E52' };

interface BustProps {
  cx: number;
  skin: string;
  outfit: string;
  hair: 'wrap' | 'afro' | 'bun';
  accent: string;
  scale?: number;
}

function Bust({ cx, skin, outfit, hair, accent, scale = 1 }: BustProps) {
  return (
    <g transform={`translate(${cx} 0) scale(${scale}) translate(${-cx} 0)`}>
      {hair === 'afro' && <circle cx={cx} cy={98} r={33} fill="#24150F" />}
      {hair === 'bun' && <circle cx={cx} cy={70} r={13} fill="#24150F" />}
      <path d={`M${cx - 48} 200 C${cx - 48} 160 ${cx - 30} 146 ${cx} 146 C${cx + 30} 146 ${cx + 48} 160 ${cx + 48} 200 Z`} fill={outfit} />
      <path d={`M${cx - 20} 150 Q${cx} 168 ${cx + 20} 150`} fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      <rect x={cx - 8} y={124} width={16} height={26} rx={7} fill={skin} />
      <ellipse cx={cx} cy={106} rx={22} ry={26} fill={skin} />
      {hair === 'bun' && <path d={`M${cx - 23} 104 C${cx - 24} 82 ${cx + 24} 80 ${cx + 23} 104 C${cx + 18} 88 ${cx - 18} 88 ${cx - 23} 104Z`} fill="#24150F" />}
      {hair === 'wrap' && (
        <>
          <path d={`M${cx - 25} 104 C${cx - 30} 74 ${cx + 30} 70 ${cx + 25} 102 C${cx + 34} 86 ${cx + 22} 64 ${cx} 64 C${cx - 26} 64 ${cx - 36} 86 ${cx - 25} 104Z`} fill={accent} />
          <circle cx={cx + 16} cy={68} r={9} fill={accent} />
        </>
      )}
      <ellipse cx={cx - 8} cy={106} rx={2.2} ry={2.8} fill="#1A0F0A" />
      <ellipse cx={cx + 8} cy={106} rx={2.2} ry={2.8} fill="#1A0F0A" />
      <path d={`M${cx - 7} 116 Q${cx} 121 ${cx + 7} 116`} fill="none" stroke="#1A0F0A" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

export function HeroIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" preserveAspectRatio="xMidYMax meet">
      <path d="M20 150C10 90 60 30 140 34c70 4 90-20 140 10 40 24 30 90 10 120-30 44-250 50-270-14Z" fill="#FCDDEF" />
      <path d="M232 52c26-10 56 6 60 32 4 24-18 40-40 34-28-8-46-54-20-66Z" fill="#F3E3EA" />
      <circle cx="56" cy="58" r="10" fill="#FAF3F6" />
      <Bust cx={92} skin={SKIN.warm} outfit="#D7A0B9" hair="bun" accent="#FAF3F6" scale={0.92} />
      <Bust cx={228} skin={SKIN.deep} outfit="#F26ABC" hair="afro" accent="#FEF1F8" scale={0.92} />
      <Bust cx={160} skin={SKIN.brown} outfit="#863146" hair="wrap" accent="#D7A0B9" />
      {/* petit ruban */}
      <g transform="translate(262 22) scale(0.9)">
        <path d="M14 18c-3-5-3-10 0-13 2-2 6-2 8 0 3 3 3 8 0 13l9 18" fill="none" stroke="#F26ABC" strokeWidth="5" strokeLinecap="round" />
        <path d="M22 18 11 36" fill="none" stroke="#863146" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ---------- Auto-palpation ---------- */

const STEP_SKIN = SKIN.brown;
const STEP_SKIN_SHADE = '#5E3720';

/** Buste stylisé debout, bras paramétrables. */
function StandingFigure({ leftArm, rightArm }: { leftArm: 'down' | 'up' | 'chest'; rightArm: 'down' | 'up' | 'chest' }) {
  const arm = (side: 'l' | 'r', pos: 'down' | 'up' | 'chest') => {
    const sx = side === 'l' ? 92 : 148;
    const dir = side === 'l' ? -1 : 1;
    if (pos === 'down') return `M${sx} 74 Q${sx + dir * 12} 110 ${sx + dir * 8} 150`;
    if (pos === 'up') return `M${sx} 74 Q${sx + dir * 18} 48 ${sx + dir * 6} 14`;
    // main sur la poitrine opposée
    return `M${sx} 74 Q${sx + dir * 10} 120 ${side === 'l' ? 132 : 108} 100`;
  };
  return (
    <g>
      <path d={arm('l', leftArm)} stroke={STEP_SKIN} strokeWidth="15" strokeLinecap="round" fill="none" />
      <path d={arm('r', rightArm)} stroke={STEP_SKIN} strokeWidth="15" strokeLinecap="round" fill="none" />
      {/* torse */}
      <path d="M90 72c0-8 10-14 30-14s30 6 30 14l4 58c0 10-14 16-34 16s-34-6-34-16Z" fill={STEP_SKIN} />
      {/* poitrine schématique : simples arcs */}
      <path d="M96 100c4 12 18 14 22 2M122 102c4 12 18 10 22-2" stroke={STEP_SKIN_SHADE} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".7" />
      {/* pagne */}
      <path d="M84 130c10 8 62 8 72 0l8 50H76Z" fill="#F26ABC" />
      <path d="M84 146h72M80 162h80" stroke="#FEF1F8" strokeWidth="3" strokeDasharray="6 6" />
      {/* tête */}
      <rect x="113" y="42" width="14" height="18" rx="6" fill={STEP_SKIN} />
      <ellipse cx="120" cy="30" rx="15" ry="18" fill={STEP_SKIN} />
      <path d="M104 28c-2-18 34-20 32 0 5-12-3-24-16-24s-21 12-16 24Z" fill="#D7A0B9" />
      {/* mains (au-dessus du torse si posées sur la poitrine) */}
      {leftArm === 'chest' && <circle cx="132" cy="100" r="9" fill={STEP_SKIN_SHADE} />}
      {rightArm === 'chest' && <circle cx="108" cy="100" r="9" fill={STEP_SKIN_SHADE} />}
    </g>
  );
}

function Arrow({ d }: { d: string }) {
  return <path d={d} stroke="#863146" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
}

export function SelfExamIllustration({ step }: { step: number }) {
  return (
    <svg viewBox="0 0 240 180" className="h-full w-full">
      <circle cx="120" cy="92" r="84" fill="#FCDDEF" opacity=".55" />
      {step === 1 && (
        <>
          <StandingFigure leftArm="down" rightArm="down" />
          <rect x="182" y="30" width="44" height="120" rx="20" fill="#FAF3F6" stroke="#D7A0B9" strokeWidth="4" />
          <path d="M194 52l20-10M194 70l20-10" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <g transform="translate(24 30)">
            <path d="M0 12C8 0 30 0 38 12 30 24 8 24 0 12Z" fill="#fff" stroke="#863146" strokeWidth="3" />
            <circle cx="19" cy="12" r="5" fill="#863146" />
          </g>
        </>
      )}
      {step === 2 && (
        <>
          <StandingFigure leftArm="up" rightArm="up" />
          <Arrow d="M40 96c-10-14-10-28 0-42m-6 4 6-4 4 7" />
          <Arrow d="M200 96c10-14 10-28 0-42m6 4-6-4-4 7" />
        </>
      )}
      {step === 3 && (
        <>
          <StandingFigure leftArm="down" rightArm="chest" />
          <circle cx="108" cy="100" r="18" fill="none" stroke="#863146" strokeWidth="3" strokeDasharray="5 5" />
          <circle cx="108" cy="100" r="28" fill="none" stroke="#F26ABC" strokeWidth="2" strokeDasharray="3 6" />
          <Arrow d="M136 82a28 28 0 0 1 0 36m4-8-4 8-8-2" />
        </>
      )}
      {step === 4 && (
        <>
          <StandingFigure leftArm="up" rightArm="down" />
          <path
            d="M112 120c-16-4-22-20-12-32 8-10 24-6 30 2 6 10 2 22-8 22M100 88c-6-8-2-16 6-18"
            stroke="#863146"
            strokeWidth="3"
            strokeDasharray="5 5"
            fill="none"
            strokeLinecap="round"
          />
          <Arrow d="M106 70 L90 62m2 8-2-8 8-2" />
          <circle cx="88" cy="64" r="9" fill="none" stroke="#D7A0B9" strokeWidth="3" />
        </>
      )}
      {step === 5 && (
        <>
          <ellipse cx="46" cy="118" rx="30" ry="14" fill="#FAF3F6" stroke="#D7A0B9" strokeWidth="3" />
          <rect x="20" y="132" width="200" height="10" rx="5" fill="#EED9E3" />
          <ellipse cx="54" cy="104" rx="15" ry="13" fill={STEP_SKIN} />
          <path d="M46 96c4-12 22-10 22 2-6-6-16-6-22-2Z" fill="#D7A0B9" />
          <path d="M70 96h70c18 0 24 8 24 18s-6 18-24 18H70Z" fill={STEP_SKIN} />
          <path d="M96 100c10 2 12 14 2 18" stroke={STEP_SKIN_SHADE} strokeWidth="2.5" fill="none" opacity=".7" />
          <path d="M150 96h50c8 0 12 6 12 18s-4 18-12 18h-50Z" fill="#F26ABC" />
          <path d="M84 126c10-14 18-22 24-22" stroke={STEP_SKIN_SHADE} strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="110" cy="104" r="16" fill="none" stroke="#863146" strokeWidth="3" strokeDasharray="5 5" />
        </>
      )}
      {step === 6 && (
        <>
          <circle cx="104" cy="92" r="50" fill="#fff" stroke="#863146" strokeWidth="6" />
          <path d="M140 128l34 34" stroke="#863146" strokeWidth="12" strokeLinecap="round" />
          <circle cx="104" cy="92" r="38" fill={STEP_SKIN} />
          <circle cx="104" cy="92" r="9" fill={STEP_SKIN_SHADE} opacity=".6" />
          <path d="M184 44c8 12 12 18 12 24a12 12 0 0 1-24 0c0-6 4-12 12-24Z" fill="#D7A0B9" />
          <path d="M180 66a4 4 0 0 0 4 4" stroke="#FAF3F6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      )}
    </svg>
  );
}
