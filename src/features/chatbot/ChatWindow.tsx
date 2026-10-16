import { useEffect, useRef, useState, type FormEvent } from 'react';
import { m } from 'framer-motion';
import { RotateCcw, Send, Sparkles, WifiOff } from 'lucide-react';
import { ChatBubble, Chip, TypingBubble } from '@/components/ui';
import { RibbonMark } from '@/assets/Logo';
import { ChatActionCard } from './ChatActionCard';
import { useChat } from './useChat';
import { useUiStore } from '@/store/useUiStore';
import { strings } from '@/lib/strings.fr';

const S = strings.chat;

export function ChatWindow() {
  const { messages, typing, offline, aiAvailable, sendChip, sendText, restart } = useChat();
  const toast = useUiStore((s) => s.toast);
  const [draft, setDraft] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Défilement automatique vers le dernier message.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length, typing]);

  const last = messages[messages.length - 1];
  const chips = !typing && last?.role === 'assistant' ? last.chips ?? [] : [];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    void sendText(draft);
    setDraft('');
  };

  return (
    <section aria-labelledby="chat-title" className="flex flex-col overflow-hidden rounded-[24px] bg-white shadow-soft">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pink-50">
          <RibbonMark className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="chat-title" className="font-heading text-lg font-extrabold leading-tight">
            {S.title}
          </h2>
          <p className="text-sm text-ink-muted">{S.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            void restart();
            toast(S.restartConfirm, 'info');
          }}
          aria-label={S.restart}
          className="flex min-h-tap min-w-tap shrink-0 items-center justify-center gap-1.5 rounded-pill border-2 border-plum-700 bg-white px-2 text-sm font-semibold text-ink hover:bg-pink-50 min-[420px]:px-3"
        >
          <RotateCcw aria-hidden="true" className="h-5 w-5 min-[420px]:h-4 min-[420px]:w-4" />
          <span aria-hidden="true" className="hidden min-[420px]:inline">{S.restart}</span>
        </button>
      </header>

      {aiAvailable !== null && (
        <p className="flex items-center gap-2 bg-cream px-4 py-1.5 text-sm text-ink-muted" title={offline ? S.offlineModeHint : undefined}>
          {offline ? (
            <>
              <WifiOff aria-hidden="true" className="h-4 w-4 text-warning" />
              <span>
                <strong className="font-semibold text-warning">{S.offlineMode}</strong> · {S.offlineModeHint}
              </span>
            </>
          ) : (
            <>
              <Sparkles aria-hidden="true" className="h-4 w-4 text-mauve-700" />
              <span>Réponses libres assistées par IA, encadrées par des règles de sécurité.</span>
            </>
          )}
        </p>
      )}

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Discussion"
        tabIndex={-1}
        className="flex h-[min(56dvh,560px)] min-h-[320px] flex-col gap-3 overflow-y-auto px-3 py-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-plum-700"
      >
        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          return (
            <m.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2"
            >
              <ChatBubble role={msg.role} tone={msg.tone} showAvatar={!prev || prev.role !== msg.role}>
                {msg.text}
              </ChatBubble>
              {msg.cards && msg.cards.length > 0 && (
                <div className="ml-11 flex max-w-[85%] flex-col gap-2">
                  {msg.cards.map((c, ci) => (
                    <ChatActionCard key={ci} card={c} />
                  ))}
                </div>
              )}
            </m.div>
          );
        })}
        {typing && <TypingBubble />}
      </div>

      {chips.length > 0 && (
        <div role="group" aria-label={S.quickReplies} className="flex flex-wrap gap-2 border-t border-line px-3 py-3">
          {chips.map((c) => (
            <Chip key={c.value} mode="action" tone="mauve" onClick={() => {
                logRef.current?.focus({ preventScroll: true });
                void sendChip(c);
              }} className="text-[0.95rem]">
              {c.label}
            </Chip>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-line p-3">
        <label htmlFor="chat-input" className="sr-only">
          {S.inputLabel}
        </label>
        <input
          ref={inputRef}
          id="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={S.inputPlaceholder}
          maxLength={500}
          autoComplete="off"
          enterKeyHint="send"
          className="min-h-tap min-w-0 flex-1 rounded-pill border-2 border-line bg-cream px-4 text-base placeholder:text-ink-muted focus:border-plum-700 focus:outline-none"
        />
        <button
          type="submit"
          aria-label={S.send}
          disabled={!draft.trim() || typing}
          className="grid h-tap w-tap shrink-0 place-items-center rounded-full bg-plum-700 text-white shadow-soft hover:bg-plum-800 disabled:opacity-40"
        >
          <Send aria-hidden="true" className="h-5 w-5" />
        </button>
      </form>
    </section>
  );
}
