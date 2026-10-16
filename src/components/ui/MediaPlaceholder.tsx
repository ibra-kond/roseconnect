import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface MediaPlaceholderProps {
  /** Texte alternatif obligatoire. */
  alt: string;
  ratio?: '16/9' | '4/3' | '1/1';
  /** Photo ou illustration réelle. Si absente, `children` (SVG) est affiché. */
  src?: string;
  /** `cover` remplit le cadre (photos), `contain` montre l'image entière (schémas). */
  fit?: 'cover' | 'contain';
  /** Point focal de l'image en mode `cover`, ex. « 50% 20% ». */
  position?: string;
  /** Charger tout de suite (image visible dès l'ouverture de l'écran). */
  eager?: boolean;
  /** Illustration SVG (décorative : l'alt est porté par le conteneur). */
  children?: ReactNode;
  className?: string;
  tone?: 'pink' | 'mauve';
}

/** Emplacement média (photo ou illustration), avec texte alternatif (role="img"). */
export function MediaPlaceholder({
  alt,
  ratio = '4/3',
  src,
  fit = 'cover',
  position,
  eager = false,
  children,
  className,
  tone = 'pink',
}: MediaPlaceholderProps) {
  const ratioCls = ratio === '16/9' ? 'aspect-video' : ratio === '1/1' ? 'aspect-square' : 'aspect-[4/3]';
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        'relative w-full overflow-hidden rounded-card',
        tone === 'pink' ? 'bg-pink-50' : 'bg-mauve-50',
        ratioCls,
        className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-0">
        {src ? (
          <img
            src={src}
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className={cn('h-full w-full', fit === 'contain' ? 'object-contain' : 'object-cover')}
            style={position ? { objectPosition: position } : undefined}
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
