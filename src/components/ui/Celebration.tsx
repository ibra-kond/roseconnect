import { useEffect, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { useUiStore } from '@/store/useUiStore';

const HEARTS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: (Math.cos((i / 12) * Math.PI * 2) * (70 + (i % 3) * 25)) | 0,
  y: (Math.sin((i / 12) * Math.PI * 2) * (70 + (i % 3) * 25) - 40) | 0,
  color: i % 3 === 0 ? '#D7A0B9' : '#F26ABC',
  size: 14 + (i % 4) * 4,
}));

/** Petite pluie de cœurs quand l'utilisatrice coche « Fait ». */
export function Celebration() {
  const key = useUiStore((s) => s.celebrateKey);
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (key === 0) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 1100);
    return () => window.clearTimeout(t);
  }, [key]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] grid place-items-center">
      <AnimatePresence>
        {visible && (
          <m.div key={key} className="relative" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <m.svg
              viewBox="0 0 24 24"
              className="h-20 w-20"
              initial={{ scale: 0.4 }}
              animate={{ scale: reduce ? 1 : [0.4, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              <path
                d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.4 3.2 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.8 0 5.9 3.9 4.5 7.2C19.5 16.4 12 21 12 21Z"
                fill="#F26ABC"
              />
            </m.svg>
            {!reduce &&
              HEARTS.map((h) => (
                <m.svg
                  key={h.id}
                  viewBox="0 0 24 24"
                  className="absolute left-1/2 top-1/2"
                  style={{ width: h.size, height: h.size, marginLeft: -h.size / 2, marginTop: -h.size / 2 }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                  animate={{ x: h.x, y: h.y, opacity: [0, 1, 0], scale: 1 }}
                  transition={{ duration: 0.95, ease: 'easeOut' }}
                >
                  <path
                    d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.4 3.2 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.8 0 5.9 3.9 4.5 7.2C19.5 16.4 12 21 12 21Z"
                    fill={h.color}
                  />
                </m.svg>
              ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
