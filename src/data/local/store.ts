/**
 * Tiny JSON helpers over localStorage. Only files in src/data/local may import this.
 * Keys are versioned so a future schema change can migrate or reset cleanly.
 */
const PREFIX = 'rj:v1:'

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJson<T>(key: string, value: T): void {
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export function removeKey(key: string): void {
  window.localStorage.removeItem(PREFIX + key)
}

export function hasKey(key: string): boolean {
  return window.localStorage.getItem(PREFIX + key) !== null
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}
