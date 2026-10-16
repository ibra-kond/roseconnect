import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { City } from '@/data/facilities';
import type { ObstacleId } from '@/data/obstacles';
import { getMammographyGuideline } from '@/data/screening';
import { addDays, addMonths, fromISODate, nextMonthlyDate, today, type ISODate } from '@/lib/dates';
import type { ChatContext, ChatMessage, FlowStep, SymptomId } from '@/features/chatbot/types';
import { userScopedStorage } from './userStorage';

/** Clé de stockage (suffixée par l'identifiant du compte, voir userStorage.ts). */
export const APP_STORE_NAME = 'roseconnect-v2';

export type ReminderKind = 'self-exam' | 'mammography';

export interface HistoryEntry {
  id: string;
  kind: ReminderKind;
  date: ISODate;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  kind: ReminderKind | 'followup' | 'info';
  ts: number;
  read: boolean;
}

export interface SponsorRequest {
  id: string;
  name: string;
  city: string;
  contact: string;
  ts: number;
}

/** Délai avant de demander « Êtes-vous allée au centre ? » (et après un « pas encore »). */
export const FOLLOW_UP_CHECK_DAYS = 3;

/**
 * Démarche de suivi : ouverte quand l'assistante juge un suivi nécessaire,
 * close quand l'utilisatrice indique être allée au centre.
 */
export interface FollowUp {
  symptom: SymptomId | 'none';
  lastVisit: 'lt1y' | 'gt1y' | 'never' | null;
  /** Date de la recommandation. */
  ts: number;
  status: 'pending' | 'visited';
  /** À partir de cette date, l'app demande si l'utilisatrice est allée au centre. */
  checkAfter: ISODate;
  /** Nombre de « pas encore ». */
  postponed: number;
  visitedAt: ISODate | null;
}

export interface AppData {
  profile: { age: number | null; city: City | null };
  selfExam: { enabled: boolean; dayOfMonth: number; nextDate: ISODate };
  mammography: { enabled: boolean; nextDate: ISODate | null };
  history: HistoryEntry[];
  obstacles: ObstacleId[];
  notifications: AppNotification[];
  /** Rappels déjà notifiés (`kind:date`), pour ne pas notifier deux fois. */
  notifiedKeys: string[];
  sponsorRequests: SponsorRequest[];
  chat: { messages: ChatMessage[]; step: FlowStep; context: ChatContext };
  /**
   * Suivi chez un professionnel jugé nécessaire par l'assistante, à l'issue d'un échange.
   * Tant qu'il est `null`, aucune recommandation de centre n'est affichée.
   */
  followUp: FollowUp | null;
}

interface Actions {
  setAge: (age: number | null) => void;
  setCity: (city: City | null) => void;
  setSelfExamEnabled: (enabled: boolean) => void;
  setSelfExamDay: (day: number) => void;
  setMammographyEnabled: (enabled: boolean) => void;
  markDone: (kind: ReminderKind) => void;
  toggleObstacle: (id: ObstacleId) => void;
  addObstacle: (id: ObstacleId) => void;
  pushNotification: (n: Omit<AppNotification, 'id' | 'ts' | 'read'>, key?: string) => void;
  markNotificationsRead: () => void;
  clearNotifications: () => void;
  addSponsorRequest: (r: Omit<SponsorRequest, 'id' | 'ts'>) => void;
  setChat: (chat: Partial<AppData['chat']>) => void;
  appendChatMessages: (messages: ChatMessage[]) => void;
  resetChat: () => void;
  setFollowUp: (symptom: SymptomId | 'none', lastVisit?: FollowUp['lastVisit']) => void;
  /** « Oui, j'y suis allée ». */
  markVisited: () => void;
  /** « Pas encore » : on redemandera dans quelques jours ; l'obstacle éventuel est noté. */
  postponeFollowUp: (obstacle?: ObstacleId) => void;
  clearData: () => void;
  resetDemo: () => void;
}

export type AppState = AppData & Actions;

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function emptyData(profile: Partial<AppData['profile']> = {}): AppData {
  const t = today();
  return {
    profile: { age: profile.age ?? null, city: profile.city ?? null },
    selfExam: { enabled: false, dayOfMonth: fromISODate(t).getDate(), nextDate: t },
    mammography: { enabled: false, nextDate: null },
    history: [],
    obstacles: [],
    notifications: [],
    notifiedKeys: [],
    sponsorRequests: [],
    chat: { messages: [], step: 'welcome', context: {} },
    followUp: null,
  };
}

/**
 * État de démonstration : utilisatrice de 38 ans à Ouagadougou,
 * rappel d'auto-palpation actif prévu dans 3 jours, obstacle « manque de temps » noté.
 */
export function demoData(): AppData {
  const t = today();
  const inThreeDays = addDays(t, 3);
  return {
    ...emptyData(),
    profile: { age: 38, city: 'Ouagadougou' },
    selfExam: { enabled: true, dayOfMonth: fromISODate(inThreeDays).getDate(), nextDate: inThreeDays },
    obstacles: ['time'],
    // Recommandation faite il y a 4 jours : la question « Êtes-vous allée au centre ? » apparaît.
    followUp: {
      symptom: 'none',
      lastVisit: 'gt1y',
      ts: Date.now() - 4 * 86_400_000,
      status: 'pending',
      checkAfter: addDays(t, -1),
      postponed: 0,
      visitedAt: null,
    },
    history: [
      { id: uid(), kind: 'self-exam', date: addDays(t, -28) },
      { id: uid(), kind: 'self-exam', date: addDays(t, -59) },
      { id: uid(), kind: 'self-exam', date: addDays(t, -88) },
    ],
    notifications: [
      {
        id: uid(),
        title: 'Bienvenue sur ROSECONNECT',
        body: 'Votre prochaine auto-palpation est prévue dans 3 jours.',
        kind: 'info',
        ts: Date.now() - 3_600_000,
        read: false,
      },
    ],
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...emptyData(),

      setAge: (age) => {
        set((s) => {
          const guideline = getMammographyGuideline(age);
          // Si la mammographie ne s'applique plus à cet âge, on coupe le rappel.
          const mammography = guideline ? s.mammography : { enabled: false, nextDate: null };
          return { profile: { ...s.profile, age }, mammography };
        });
      },

      setCity: (city) => set((s) => ({ profile: { ...s.profile, city } })),

      setSelfExamEnabled: (enabled) =>
        set((s) => ({
          selfExam: { ...s.selfExam, enabled, nextDate: nextMonthlyDate(s.selfExam.dayOfMonth) },
        })),

      setSelfExamDay: (day) =>
        set((s) => ({ selfExam: { ...s.selfExam, dayOfMonth: day, nextDate: nextMonthlyDate(day) } })),

      setMammographyEnabled: (enabled) =>
        set((s) => ({
          // Première activation : rappel dans 14 jours pour prendre rendez-vous.
          mammography: { enabled, nextDate: enabled ? (s.mammography.nextDate ?? addDays(today(), 14)) : null },
        })),

      markDone: (kind) => {
        const t = today();
        const entry: HistoryEntry = { id: uid(), kind, date: t };
        set((s) => {
          const history = [entry, ...s.history];
          if (kind === 'self-exam') {
            // Fait en avance ou en retard : le rappel suivant vient après la date prévue ET après aujourd'hui.
            const from = addDays(s.selfExam.nextDate > t ? s.selfExam.nextDate : t, 1);
            return {
              history,
              selfExam: { ...s.selfExam, nextDate: nextMonthlyDate(s.selfExam.dayOfMonth, from) },
            };
          }
          const months = getMammographyGuideline(s.profile.age)?.intervalMonths ?? 12;
          return { history, mammography: { ...s.mammography, nextDate: addMonths(t, months) } };
        });
      },

      toggleObstacle: (id) =>
        set((s) => ({
          obstacles: s.obstacles.includes(id) ? s.obstacles.filter((o) => o !== id) : [...s.obstacles, id],
        })),

      addObstacle: (id) =>
        set((s) => (s.obstacles.includes(id) ? s : { obstacles: [...s.obstacles, id] })),

      pushNotification: (n, key) => {
        if (key && get().notifiedKeys.includes(key)) return;
        set((s) => ({
          notifications: [{ ...n, id: uid(), ts: Date.now(), read: false }, ...s.notifications].slice(0, 30),
          notifiedKeys: key ? [...s.notifiedKeys, key].slice(-60) : s.notifiedKeys,
        }));
      },

      markNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      clearNotifications: () => set({ notifications: [] }),

      addSponsorRequest: (r) =>
        set((s) => ({ sponsorRequests: [...s.sponsorRequests, { ...r, id: uid(), ts: Date.now() }] })),

      setChat: (chat) => set((s) => ({ chat: { ...s.chat, ...chat } })),

      appendChatMessages: (messages) =>
        set((s) => ({ chat: { ...s.chat, messages: [...s.chat.messages, ...messages].slice(-80) } })),

      resetChat: () => set({ chat: { messages: [], step: 'welcome', context: {} } }),

      setFollowUp: (symptom, lastVisit = null) =>
        set((s) => {
          const open = s.followUp?.status === 'pending' ? s.followUp : null;
          return {
            followUp: {
              // Une démarche déjà ouverte est complétée (un symptôme signalé l'emporte sur « aucun »).
              symptom: symptom !== 'none' ? symptom : (open?.symptom ?? 'none'),
              lastVisit: lastVisit ?? open?.lastVisit ?? null,
              ts: open?.ts ?? Date.now(),
              status: 'pending',
              checkAfter: open?.checkAfter ?? addDays(today(), FOLLOW_UP_CHECK_DAYS),
              postponed: open?.postponed ?? 0,
              visitedAt: null,
            },
          };
        }),

      markVisited: () =>
        set((s) => (s.followUp ? { followUp: { ...s.followUp, status: 'visited', visitedAt: today() } } : s)),

      postponeFollowUp: (obstacle) =>
        set((s) => {
          if (!s.followUp) return s;
          return {
            followUp: {
              ...s.followUp,
              checkAfter: addDays(today(), FOLLOW_UP_CHECK_DAYS),
              postponed: s.followUp.postponed + 1,
            },
            obstacles: obstacle && !s.obstacles.includes(obstacle) ? [...s.obstacles, obstacle] : s.obstacles,
          };
        }),

      clearData: () => set((s) => emptyData(s.profile)),

      resetDemo: () => set(demoData()),
    }),
    {
      name: APP_STORE_NAME,
      version: 2,
      storage: createJSONStorage(() => userScopedStorage),
      // L'hydratation est lancée à l'ouverture de session (features/auth/session.ts).
      skipHydration: true,
      partialize: (s): AppData => ({
        profile: s.profile,
        selfExam: s.selfExam,
        mammography: s.mammography,
        history: s.history,
        obstacles: s.obstacles,
        notifications: s.notifications,
        notifiedKeys: s.notifiedKeys,
        sponsorRequests: s.sponsorRequests,
        chat: s.chat,
        followUp: s.followUp,
      }),
    },
  ),
);
