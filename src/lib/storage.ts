// Thin, failure-tolerant wrappers around localStorage. Private browsing modes
// and blocked storage throw on access, so every call is guarded.

const PREFIX = 'aic.v1.';

export const KEYS = {
  history: 'history',
  settings: 'settings',
  session: 'session',
} as const;

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full: the app keeps working in memory */
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
