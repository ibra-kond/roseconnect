import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ISODate } from '@/lib/dates';
import type { PasswordHash } from './password';

export interface Account {
  id: string;
  /** Nom et prénom. */
  name: string;
  /** Numéro de téléphone normalisé (chiffres seuls, sans indicatif +226). */
  phone: string;
  /** Date de naissance (CNIB ou passeport) : détermine la tranche d'âge et le contenu de l'espace. */
  birthDate: ISODate | null;
  /** Code secret ou mot de passe haché ; `null` pour le compte démo. */
  password: PasswordHash | null;
  createdAt: number;
  demo?: boolean;
}

interface AuthState {
  accounts: Account[];
  currentUserId: string | null;
}

/** Comptes de cet appareil + session ouverte. Les actions sont dans session.ts. */
export const useAuthStore = create<AuthState>()(
  persist((): AuthState => ({ accounts: [], currentUserId: null }), {
    name: 'roseconnect-auth',
    version: 2,
    storage: createJSONStorage(() => localStorage),
    // v1 : identifiant libre et pas de date de naissance.
    migrate: (persisted, version) => {
      const state = persisted as { accounts?: Array<Partial<Account> & { identifier?: string }>; currentUserId?: string | null };
      if (version < 2) {
        return {
          currentUserId: state.currentUserId ?? null,
          accounts: (state.accounts ?? []).map(({ identifier, ...a }) => ({
            ...a,
            phone: a.phone ?? identifier ?? '',
            birthDate: a.birthDate ?? null,
          })) as Account[],
        };
      }
      return state as AuthState;
    },
  }),
);

export function useCurrentAccount(): Account | null {
  return useAuthStore((s) => s.accounts.find((a) => a.id === s.currentUserId) ?? null);
}
