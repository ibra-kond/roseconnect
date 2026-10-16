/**
 * Ouverture et fermeture de session. Chaque compte a son propre espace de données
 * (useAppStore persisté sous `roseconnect-v2:<id>`), chargé à la connexion.
 * Le contenu de l'espace dépend de la tranche d'âge, calculée depuis la date de naissance.
 */
import { APP_STORE_NAME, demoData, emptyData, uid, useAppStore, type AppData } from '@/store/useAppStore';
import { removeUserData, withStorageUser } from '@/store/userStorage';
import { useUiStore } from '@/store/useUiStore';
import { ageFromBirthDate, yearsAgo, addDays, type ISODate } from '@/lib/dates';
import { hashPassword, verifyPassword } from './password';
import { useAuthStore, type Account } from './useAuthStore';

const DEMO_ID = 'demo';

export type AuthErrorCode = 'phoneTaken' | 'badCredentials';

export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code);
  }
}

/** « +226 70 11 22 33 », « 0022670112233 », « 70-11-22-33 » → « 70112233 ». */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('226') && digits.length === 11) digits = digits.slice(3);
  return digits;
}

export function isValidPhone(raw: string): boolean {
  const n = normalizePhone(raw);
  return n.length >= 8 && n.length <= 15;
}

/** Comparaison de noms sans accents, casse ni espaces superflus. */
export function normalizeName(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Âge actuel du compte (recalculé à chaque ouverture : il suit les anniversaires). */
export function accountAge(account: Pick<Account, 'birthDate'>): number | null {
  return account.birthDate ? ageFromBirthDate(account.birthDate) : null;
}

/** Charge l'espace de l'utilisatrice ; `initial` sert si l'espace n'existe pas encore. */
async function openSpace(account: Account, initial: () => AppData) {
  withStorageUser(account.id, () => useAppStore.setState(initial()));
  await useAppStore.persist.rehydrate();
  // L'âge (et donc les repères, rappels et conseils) découle toujours de la date de naissance.
  useAppStore.getState().setAge(accountAge(account));
  useAuthStore.setState({ currentUserId: account.id });
}

function welcomeData(): AppData {
  return {
    ...emptyData(),
    notifications: [
      {
        id: uid(),
        title: 'Bienvenue sur ROSECONNECT',
        body: 'Votre espace personnel est prêt et adapté à votre tranche d’âge.',
        kind: 'info',
        ts: Date.now(),
        read: false,
      },
    ],
  };
}

export async function register(input: { name: string; phone: string; birthDate: ISODate; password: string }): Promise<Account> {
  const phone = normalizePhone(input.phone);
  if (useAuthStore.getState().accounts.some((a) => !a.demo && a.phone === phone)) throw new AuthError('phoneTaken');
  const account: Account = {
    id: uid(),
    name: input.name.trim().replace(/\s+/g, ' '),
    phone,
    birthDate: input.birthDate,
    password: await hashPassword(input.password),
    createdAt: Date.now(),
  };
  useAuthStore.setState((s) => ({ accounts: [...s.accounts, account] }));
  await openSpace(account, welcomeData);
  return account;
}

/** Connexion par numéro de téléphone OU par nom et prénom. */
export async function login(nameOrPhone: string, password: string): Promise<Account> {
  const accounts = useAuthStore.getState().accounts.filter((a) => !a.demo && a.password);
  const looksLikePhone = /^[\d\s+().-]+$/.test(nameOrPhone.trim());
  const candidates = looksLikePhone
    ? accounts.filter((a) => a.phone === normalizePhone(nameOrPhone))
    : accounts.filter((a) => normalizeName(a.name) === normalizeName(nameOrPhone));
  // Deux personnes peuvent porter le même nom : le code secret les départage.
  for (const account of candidates) {
    if (await verifyPassword(password, account.password!)) {
      await openSpace(account, () => emptyData());
      return account;
    }
  }
  throw new AuthError('badCredentials');
}

/** Compte démo sans code : utilisatrice fictive de 38 ans à Ouagadougou. */
export async function loginDemo(): Promise<Account> {
  let account = useAuthStore.getState().accounts.find((a) => a.id === DEMO_ID);
  if (!account) {
    account = {
      id: DEMO_ID,
      name: 'Awa Ouédraogo',
      phone: '',
      birthDate: addDays(yearsAgo(38), -100),
      password: null,
      createdAt: Date.now(),
      demo: true,
    };
    const created = account;
    useAuthStore.setState((s) => ({ accounts: [...s.accounts, created] }));
  }
  await openSpace(account, demoData);
  return account;
}

export function logout() {
  withStorageUser(null, () => useAppStore.setState(emptyData()));
  useAuthStore.setState({ currentUserId: null });
  useUiStore.setState({ sheet: null });
}

function updateCurrentAccount(patch: Partial<Pick<Account, 'name' | 'birthDate'>>) {
  const id = useAuthStore.getState().currentUserId;
  useAuthStore.setState((s) => ({ accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
}

export function updateAccountName(name: string) {
  updateCurrentAccount({ name: name.trim().replace(/\s+/g, ' ') });
}

/** Pour les comptes créés avant l'ajout de la date de naissance. */
export function setAccountBirthDate(birthDate: ISODate) {
  updateCurrentAccount({ birthDate });
  useAppStore.getState().setAge(ageFromBirthDate(birthDate));
}

export function deleteCurrentAccount() {
  const id = useAuthStore.getState().currentUserId;
  if (!id) return;
  logout();
  removeUserData(APP_STORE_NAME, id);
  useAuthStore.setState((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }));
}

/** Au démarrage : rouvre l'espace de la dernière session, s'il existe encore. */
export async function restoreSession() {
  const { currentUserId, accounts } = useAuthStore.getState();
  if (!currentUserId) return;
  const account = accounts.find((a) => a.id === currentUserId);
  if (!account) {
    useAuthStore.setState({ currentUserId: null });
    return;
  }
  await openSpace(account, account.demo ? demoData : () => emptyData());
}
