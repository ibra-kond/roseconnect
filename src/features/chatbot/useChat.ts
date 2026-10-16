import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore, uid } from '@/store/useAppStore';
import { useOnline } from '@/lib/a11y';
import type { ChatMessage, QuickReply } from './types';
import {
  cardsForUserText,
  chipsForStep,
  handleChip,
  keywordReply,
  parseFreeTextForStep,
  startFlow,
  type BotReply,
  type FlowResult,
} from './scriptedFlow';
import { askGemini, checkAiAvailable } from './geminiClient';
import { ageToRange } from '@/data/screening';

/** Contexte de départ : la tranche d'âge vient de la date de naissance du compte. */
function baseContext() {
  const age = useAppStore.getState().profile.age;
  return age !== null ? { ageRange: ageToRange(age) } : {};
}

const TYPING_MS = 550;
const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

function toMessage(r: BotReply, source: ChatMessage['source']): ChatMessage {
  return { id: uid(), role: 'assistant', text: r.text, chips: r.chips, cards: r.cards, tone: r.tone, source, ts: Date.now() };
}

/**
 * Logique du chatbot : parcours guidé local + Gemini pour la saisie libre,
 * avec bascule automatique sur le mode scripté (hors ligne, sans clé, erreur, délai dépassé).
 */
export function useChat() {
  const chat = useAppStore((s) => s.chat);
  const setChat = useAppStore((s) => s.setChat);
  const append = useAppStore((s) => s.appendChatMessages);
  const resetChat = useAppStore((s) => s.resetChat);
  const addObstacle = useAppStore((s) => s.addObstacle);
  const setCity = useAppStore((s) => s.setCity);
  const setFollowUp = useAppStore((s) => s.setFollowUp);
  const online = useOnline();
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [typing, setTyping] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    let cancelled = false;
    if (!online) {
      setAiAvailable(false);
      return;
    }
    checkAiAvailable().then((ok) => !cancelled && setAiAvailable(ok));
    return () => {
      cancelled = true;
    };
  }, [online]);

  const offline = !online || aiAvailable === false;

  /** Affiche les réponses une par une avec l'indicateur « écrit… ». */
  const playReplies = useCallback(
    async (replies: BotReply[], source: ChatMessage['source']) => {
      for (const r of replies) {
        setTyping(true);
        await wait(TYPING_MS + Math.min(r.text.length * 6, 700));
        setTyping(false);
        append([toMessage(r, source)]);
      }
    },
    [append],
  );

  const applyResult = useCallback(
    async (result: FlowResult) => {
      setChat({ step: result.step, context: result.context });
      if (result.obstacle) addObstacle(result.obstacle);
      if (result.city) setCity(result.city);
      if (result.followUp) setFollowUp(result.followUp, result.context.lastVisit ?? null);
      await playReplies(result.replies, 'scripted');
    },
    [setChat, addObstacle, setCity, setFollowUp, playReplies],
  );

  // Premier affichage : message d'accueil.
  useEffect(() => {
    if (useAppStore.getState().chat.messages.length === 0 && !busy.current) {
      busy.current = true;
      const r = startFlow(baseContext());
      applyResult(r).finally(() => (busy.current = false));
    }
  }, [applyResult]);

  const userSays = (text: string) =>
    append([{ id: uid(), role: 'user', text, ts: Date.now() }]);

  const sendChip = useCallback(
    async (chip: QuickReply) => {
      if (busy.current) return;
      busy.current = true;
      try {
        userSays(chip.label);
        const { step, context } = useAppStore.getState().chat;
        if (chip.value === 'restart') {
          resetChat();
          userSays(chip.label);
        }
        await applyResult(handleChip(step, context, chip.value));
      } finally {
        busy.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applyResult, resetChat],
  );

  const sendText = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, 500);
      if (!text || busy.current) return;
      busy.current = true;
      try {
        userSays(text);
        const { step, context, messages } = useAppStore.getState().chat;

        // 1. Réponse attendue dans le parcours guidé ? On avance localement.
        const parsed = parseFreeTextForStep(step, context, text);
        if (parsed) {
          await applyResult(parsed);
          return;
        }

        // 2. Sinon, Gemini (si disponible), avec bascule automatique.
        if (!offline) {
          setTyping(true);
          try {
            const reply = await askGemini(messages, context);
            const extra = cardsForUserText(text, context);
            if (extra.obstacle) addObstacle(extra.obstacle);
            if (extra.followUp) {
              setFollowUp(extra.followUp, context.lastVisit ?? null);
              setChat({ context: { ...context, symptom: extra.followUp, followUp: true } });
            }
            setTyping(false);
            append([
              toMessage(
                { text: reply, cards: extra.cards, chips: chipsForStep(step), tone: extra.warning ? 'warning' : undefined },
                'ai',
              ),
            ]);
            return;
          } catch {
            setTyping(false);
            setAiAvailable(false); // bascule en mode hors ligne pour la suite
          }
        }

        // 3. Mode scripté par mots-clés : toujours une réponse sûre.
        await applyResult(keywordReply(text, step, context));
      } finally {
        setTyping(false);
        busy.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [offline, applyResult, addObstacle, setFollowUp, setChat, append],
  );

  const restart = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    resetChat();
    try {
      await applyResult(startFlow(baseContext()));
    } finally {
      busy.current = false;
    }
  }, [resetChat, applyResult]);

  return { messages: chat.messages, typing, offline, aiAvailable, sendChip, sendText, restart };
}
