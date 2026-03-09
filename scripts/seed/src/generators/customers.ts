import type { Customer, Profile } from '../types'
import { CONFIG } from '../config.js'
import {
  DEALER_NAME_PREFIXES,
  DEALER_NAME_SUFFIXES,
  DEALER_NAME_PREFIXES_MY,
  DEALER_NAME_SUFFIXES_MY,
  CONTACT_NOTES,
} from '../data/dealer-names.js'
import { id, pick, dateBetween, toISO, random } from '../utils.js'
import { faker } from '@faker-js/faker'

/** Chỉ dùng domain email thật (SG/MY/global, không dùng company.sg, v.v.) */
const REAL_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'outlook.sg',
  'hotmail.com',
  'hotmail.sg',
  'live.com',
  'live.com.sg',
  'icloud.com',
  'me.com',
  'mac.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'gmx.net',
  'aol.com',
  'fastmail.com',
  'tutanota.com',
  'mailfence.com',
  'inbox.com',
  'singnet.com.sg',
  'rediffmail.com',
  'web.de',
  'cox.net',
  'att.net',
  'btinternet.com',
  'sky.com',
] as const

/** Singapore phone: +65 9xxx xxxx or +65 8xxx xxxx */
function sgPhone(): string {
  const first = pick(['8', '9'])
  const rest = faker.string.numeric(7)
  return `+65 ${first}${rest.slice(0, 3)} ${rest.slice(3)}`
}

/** Malaysia mobile: +60 1x-xxx xxxx (10, 11, 12, 13, 14, 16, 17, 18, 19) */
function myPhone(): string {
  const first = pick(['10', '11', '12', '13', '14', '16', '17', '18', '19'])
  const rest = faker.string.numeric(7)
  return `+60 ${first} ${rest.slice(0, 3)} ${rest.slice(3)}`
}

const INDIVIDUAL_NOTES = ['Individual buyer', 'Personal use', 'Family car', '', '']

export function generateCustomers(profiles: Profile[]): Customer[] {
  const salesIds = profiles.filter((p) => p.role === 'sales' || p.role === 'manager').map((p) => p.id)
  const start = CONFIG.startDate
  const end = CONFIG.endDate
  const usedNames = new Set<string>()
  const list: Customer[] = []
  const individualRatio = CONFIG.customerIndividualRatio ?? 0.35
  const malaysiaRatio = CONFIG.customerMalaysiaRatio ?? 0.35

  for (let i = 0; i < CONFIG.customers; i++) {
    const isIndividual = random() < individualRatio
    const isMalaysia = random() < malaysiaRatio
    let name: string

    if (isIndividual) {
      name = faker.person.fullName()
      if (usedNames.has(name)) name = `${name} ${i + 1}`
    } else if (isMalaysia) {
      const prefix = pick(DEALER_NAME_PREFIXES_MY)
      const suffix = pick(DEALER_NAME_SUFFIXES_MY)
      name = `${prefix} ${suffix}`.trim()
      if (usedNames.has(name)) {
        let n = 1
        while (usedNames.has(`${name} ${n}`)) n++
        name = `${name} ${n}`
      }
    } else {
      const prefix = pick(DEALER_NAME_PREFIXES)
      const suffix = pick(DEALER_NAME_SUFFIXES)
      name = `${prefix} ${suffix}`.trim()
      if (usedNames.has(name)) {
        let n = 1
        while (usedNames.has(`${name} ${n}`)) n++
        name = `${name} ${n}`
      }
    }
    usedNames.add(name)

    const createdAt = dateBetween(start, end)
    const createdBy = pick(salesIds)
    const hasEmail = random() > 0.2
    const phone = isMalaysia ? myPhone() : sgPhone()
    const notes = isIndividual ? pick(INDIVIDUAL_NOTES) : pick(CONTACT_NOTES)

    list.push({
      id: id('customer', i + 1),
      name,
      phone,
      email: hasEmail
        ? faker.internet.email({
            firstName: name.split(' ')[0]?.toLowerCase().replace(/\W/g, ''),
            provider: pick(REAL_EMAIL_DOMAINS),
          })
        : undefined,
      notes: notes || undefined,
      createdAt: toISO(createdAt),
      updatedAt: toISO(createdAt),
      createdBy,
    })
  }
  return list
}
