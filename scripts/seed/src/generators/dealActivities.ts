import type { DealActivity } from '../types.js'
import { CONFIG } from '../config.js'
import { id, pick, int, dateBetween, toISO } from '../utils.js'
import type { Deal } from '../types.js'
import type { DealActivityType } from '../types.js'

const NOTE_TEMPLATES = [
  'Sent quote and financing options.',
  'Customer requested COE details.',
  'Deposit received.',
  'Paperwork in progress for export.',
  'Follow-up call scheduled.',
]
const STAGE_TEMPLATES = [
  'Stage changed to negotiation.',
  'Moved to test drive.',
  'Loan processing started.',
  'Deal closed won.',
  'Deal closed lost.',
]

export function generateDealActivities(deals: Deal[], profileIds: string[]): DealActivity[] {
  const end = CONFIG.endDate
  const list: DealActivity[] = []
  let actId = 0
  const types: DealActivityType[] = ['note', 'stage_change']

  for (const deal of deals) {
    const n = int(CONFIG.dealActivitiesPerDeal.min, CONFIG.dealActivitiesPerDeal.max)
    let lastAt = new Date(deal.createdAt)
    for (let i = 0; i < n; i++) {
      actId++
      const type = pick(types)
      const content = type === 'note' ? pick(NOTE_TEMPLATES) : pick(STAGE_TEMPLATES)
      lastAt = dateBetween(lastAt, end)
      if (lastAt > end) break
      list.push({
        id: id('da', actId),
        dealId: deal.id,
        type,
        content,
        createdAt: toISO(lastAt),
        createdBy: pick(profileIds),
      })
    }
  }
  return list
}
