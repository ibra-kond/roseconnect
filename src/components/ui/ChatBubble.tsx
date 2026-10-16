import type { ReactNode } from 'react';
import { RibbonMark } from '@/assets/Logo';
import { cn } from '@/lib/cn';
import { strings } from '@/lib/strings.fr';

interface ChatBubbleProps {
  role: 'assistant' | 'user';
  children: ReactNode;
  tone?: 'warning';
  /** Masquer l'avatar quand plusieurs bulles se suivent. */
  showAvatar?: boolean;
}

/** Bulle de discussion : assistante à gauche (fond mauve doux), utilisatrice à droite (fond rose doux). */
export function ChatBubble({ role, children, tone, showAvatar = true }: ChatBubbleProps) {
  const isBot = role === 'assistant';
  return (
    <div className={cn('flex items-end gap-2', isBot ? 'justify-start' : 'justify-end')}>
      {isBot && (
        <span
          aria-hidden="true"
          className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white shadow-soft', !showAvatar && 'invisible')}
        >
          <RibbonMark className="h-6 w-6" />
        </span>
      )}
      <div
        className={cn(
          'max-w-[85%] whitespace-pre-line rounded-[20px] px-4 py-3 text-base leading-snug',
          isBot ? 'rounded-bl-md bg-mauve-50 text-ink' : 'rounded-br-md bg-pink-50 text-ink',
          tone === 'warning' && 'border-l-4 border-warning bg-warning-50',
        )}
      >
        <span className="sr-only">{isBot ? strings.chat.assistant : strings.chat.you} : </span>
        {children}
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white shadow-soft">
        <RibbonMark className="h-6 w-6" />
      </span>
      <div className="flex items-center gap-1 rounded-[20px] rounded-bl-md bg-mauve-50 px-4 py-4">
        <span className="sr-only">{strings.chat.typing}</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="typing-dot h-2 w-2 rounded-full bg-mauve-700"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
