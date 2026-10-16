/**
 * Hachage des mots de passe (jamais stockés en clair).
 * PBKDF2-SHA256 via Web Crypto. Sur une page non sécurisée (http hors localhost,
 * ex. test sur téléphone via l'IP du réseau local), `crypto.subtle` n'existe pas :
 * on utilise alors un hachage itéré plus simple, signalé par `algo`.
 */
export interface PasswordHash {
  algo: 'pbkdf2-sha256' | 'basic';
  salt: string;
  hash: string;
}

const ITERATIONS = 150_000;

const toHex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

async function pbkdf2(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: ITERATIONS },
    key,
    256,
  );
  return toHex(new Uint8Array(bits));
}

/** cyrb53 itéré : repli sans Web Crypto. */
function basic(password: string, salt: string): string {
  let h = `${salt}:${password}`;
  for (let round = 0; round < 2000; round++) {
    let h1 = 0xdeadbeef ^ round;
    let h2 = 0x41c6ce57 ^ round;
    for (let i = 0; i < h.length; i++) {
      const ch = h.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    h = (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0') + salt;
  }
  return h.slice(0, 16);
}

const hasSubtle = () => typeof crypto !== 'undefined' && !!crypto.subtle;

export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = randomSalt();
  if (hasSubtle()) return { algo: 'pbkdf2-sha256', salt, hash: await pbkdf2(password, salt) };
  return { algo: 'basic', salt, hash: basic(password, salt) };
}

export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
  if (stored.algo === 'pbkdf2-sha256') {
    if (!hasSubtle()) return false;
    return (await pbkdf2(password, stored.salt)) === stored.hash;
  }
  return basic(password, stored.salt) === stored.hash;
}
