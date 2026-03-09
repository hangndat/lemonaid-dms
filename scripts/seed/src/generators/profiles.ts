import type { Profile } from '../types.js'
import { CONFIG } from '../config.js'
import { id, toISO } from '../utils.js'

const PROFILES: Array<{ fullName: string; email: string; role: Profile['role'] }> = [
  { fullName: 'James Tan', email: 'james.tan@company.sg', role: 'admin' },
  { fullName: 'Sarah Lim', email: 'sarah.lim@company.sg', role: 'manager' },
  { fullName: 'Wei Ming Chen', email: 'weiming@company.sg', role: 'sales' },
  { fullName: 'Priya Rajan', email: 'priya@company.sg', role: 'sales' },
  { fullName: 'David Wong', email: 'david.wong@company.sg', role: 'sales' },
]

const PROFILE_IDS = ['profile-admin', 'profile-manager', 'profile-sales-1', 'profile-sales-2', 'profile-sales-3'] as const

export function generateProfiles(): Profile[] {
  const start = CONFIG.startDate
  return PROFILES.slice(0, CONFIG.profiles).map((p, i) => {
    const createdAt = new Date(start.getTime() + i * 86400 * 1000)
    return {
      id: PROFILE_IDS[i] ?? id('profile', i + 1),
      fullName: p.fullName,
      email: p.email,
      role: p.role,
      createdAt: toISO(createdAt),
      updatedAt: toISO(createdAt),
    }
  })
}
