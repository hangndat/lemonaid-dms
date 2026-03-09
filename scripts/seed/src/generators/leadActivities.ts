import type { LeadActivity } from '../types.js'
import { CONFIG } from '../config.js'
import { id, pick, int, dateBetween, toISO } from '../utils.js'
import type { Lead } from '../types.js'
import type { LeadActivityType } from '../types.js'

const NOTE_TEMPLATES = [
  'Customer inquired about pricing and COE.',
  'Sent quote via email. Follow up next week.',
  'WhatsApp conversation - interested in SUV segment.',
  'Requested photos and vehicle history.',
  'Export paperwork discussed.',
]
const CALL_TEMPLATES = [
  'Called back, customer will visit showroom.',
  'Phone follow-up. Deciding between two models.',
  'Discussed financing options for Thailand re-export.',
]
const STATUS_TEMPLATES = [
  'Status updated to contacted.',
  'Moved to test_drive stage.',
  'Negotiation started.',
]

export function generateLeadActivities(leads: Lead[], profileIds: string[]): LeadActivity[] {
  const start = CONFIG.startDate
  const end = CONFIG.endDate
  const list: LeadActivity[] = []
  let actId = 0
  const types: LeadActivityType[] = ['note', 'call', 'status_change']

  for (const lead of leads) {
    const n = int(CONFIG.leadActivitiesPerLead.min, CONFIG.leadActivitiesPerLead.max)
    let lastAt = new Date(lead.createdAt)
    for (let i = 0; i < n; i++) {
      actId++
      const type = pick(types)
      let content: string
      if (type === 'note') content = pick(NOTE_TEMPLATES)
      else if (type === 'call') content = pick(CALL_TEMPLATES)
      else content = pick(STATUS_TEMPLATES)
      lastAt = dateBetween(lastAt, end)
      if (lastAt > end) break
      list.push({
        id: id('la', actId),
        leadId: lead.id,
        type,
        content,
        createdAt: toISO(lastAt),
        createdBy: pick(profileIds),
      })
    }
  }
  return list
}
