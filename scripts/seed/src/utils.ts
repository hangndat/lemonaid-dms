import seedrandom from 'seedrandom'
import { CONFIG } from './config.js'

const rng = seedrandom(CONFIG.randomSeed)

export function random(): number {
  return rng()
}

/** Pick one element from array (deterministic). */
export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(random() * arr.length)]!
}

/** Pick n unique indices, then return elements (n can be > arr.length; then returns shuffled copy). */
export function pickMany<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy.slice(0, n)
}

/** Weighted pick: keys of weights, values are relative weights. */
export function weightedPick<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][]
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = random() * total
  for (const [key, w] of entries) {
    r -= w
    if (r <= 0) return key
  }
  return entries[entries.length - 1]![0]
}

/** Random int in [min, max] inclusive. */
export function int(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

/** Random number in [min, max). */
export function float(min: number, max: number): number {
  return min + random() * (max - min)
}

/** Date between start and end (timestamp). */
export function dateBetween(start: Date, end: Date): Date {
  const s = start.getTime()
  const e = end.getTime()
  return new Date(s + random() * (e - s))
}

/** Format date as YYYY-MM-DD. */
export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** ISO string for createdAt/updatedAt. */
export function toISO(d: Date): string {
  return d.toISOString()
}

const VIN_CHARS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'

/** Generate a simple 17-char VIN-like id (deterministic per call order). */
export function fakeVin(): string {
  let s = ''
  for (let i = 0; i < 17; i++) s += VIN_CHARS[Math.floor(random() * VIN_CHARS.length)]
  return s
}

/** Id generator with prefix (e.g. customer-1, vehicle-42). */
export function id(prefix: string, index: number): string {
  return `${prefix}-${index}`
}
