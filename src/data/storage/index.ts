import { ALL_KEYS, KEYS } from './keys'

function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function remove(key: string): void {
  localStorage.removeItem(key)
}

export function clearAllDemoData(): void {
  for (const k of ALL_KEYS) {
    localStorage.removeItem(k)
  }
}

export const storage = {
  get,
  set,
  remove,
  keys: KEYS,
}
