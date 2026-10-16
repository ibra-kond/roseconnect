import type { StateStorage } from 'zustand/middleware';

/**
 * Stockage localStorage cloisonné par compte : chaque utilisatrice a sa propre clé
 * (`roseconnect-v2:<id>`). Sans session ouverte, rien n'est lu ni écrit.
 */
let currentUser: string | null = null;
let paused = false;

export const userScopedStorage: StateStorage = {
  getItem: (name) => (currentUser ? localStorage.getItem(`${name}:${currentUser}`) : null),
  setItem: (name, value) => {
    if (currentUser && !paused) localStorage.setItem(`${name}:${currentUser}`, value);
  },
  removeItem: (name) => {
    if (currentUser) localStorage.removeItem(`${name}:${currentUser}`);
  },
};

/** Change d'espace sans écrire l'état courant dans celui de la nouvelle utilisatrice. */
export function withStorageUser(id: string | null, reset: () => void) {
  paused = true;
  currentUser = id;
  try {
    reset();
  } finally {
    paused = false;
  }
}

export function removeUserData(name: string, id: string) {
  localStorage.removeItem(`${name}:${id}`);
}
