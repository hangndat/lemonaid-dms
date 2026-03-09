import type { Customer, Profile } from '../types'
import { CONFIG } from '../config.js'
import { DEALER_NAME_PREFIXES, DEALER_NAME_SUFFIXES, CONTACT_NOTES } from '../data/dealer-names.js'
import { id, pick, dateBetween, toISO, random } from '../utils.js'
import { faker } from '@faker-js/faker'

/** Chỉ dùng domain email thật (không dùng company.sg, v.v.) */
const REAL_EMAIL_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'live.com',
  'protonmail.com',
  'mail.com',
  'zoho.com',
  'hotmail.sg',
  'live.com.sg',
] as const

/** Singapore phone: +65 9xxx xxxx or +65 8xxx xxxx */
function sgPhone(): string {
  const first = pick(['8', '9'])
  const rest = faker.string.numeric(7)
  return `+65 ${first}${rest.slice(0, 3)} ${rest.slice(3)}`
}

export function generateCustomers(profiles: Profile[]): Customer[] {
  const salesIds = profiles.filter((p) => p.role === 'sales' || p.role === 'manager').map((p) => p.id)
  const start = CONFIG.startDate
  const end = CONFIG.endDate
  const usedNames = new Set<string>()
  const list: Customer[] = []

  for (let i = 0; i < CONFIG.customers; i++) {
    const prefix = pick(DEALER_NAME_PREFIXES)
    const suffix = pick(DEALER_NAME_SUFFIXES)
    let name = `${prefix} ${suffix}`.trim()
    if (usedNames.has(name)) {
      let n = 1
      while (usedNames.has(`${name} ${n}`)) n++
      name = `${name} ${n}`
    }
    usedNames.add(name)

    const createdAt = dateBetween(start, end)
    const createdBy = pick(salesIds)
    const hasEmail = random() > 0.2
    const notes = pick(CONTACT_NOTES)

    list.push({
      id: id('customer', i + 1),
      name,
      phone: sgPhone(),
      email: hasEmail ? faker.internet.email({ firstName: name.split(' ')[0]?.toLowerCase(), provider: pick(REAL_EMAIL_DOMAINS) }) : undefined,
      notes: notes || undefined,
      createdAt: toISO(createdAt),
      updatedAt: toISO(createdAt),
      createdBy,
    })
  }
  return list
}
