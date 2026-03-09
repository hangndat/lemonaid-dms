import type { Profile } from '../types'
import { CONFIG } from '../config.js'
import { id, toISO } from '../utils.js'

const PROFILES: Array<{ fullName: string; email: string; role: Profile['role'] }> = [
  { fullName: 'James Tan', email: 'james.tan@gmail.com', role: 'admin' },
  { fullName: 'Sarah Lim', email: 'sarah.lim@outlook.com', role: 'manager' },
  { fullName: 'Wei Ming Chen', email: 'weiming.chen@gmail.com', role: 'sales' },
  { fullName: 'Priya Rajan', email: 'priya.rajan@gmail.com', role: 'sales' },
  { fullName: 'David Wong', email: 'david.wong@icloud.com', role: 'sales' },
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
