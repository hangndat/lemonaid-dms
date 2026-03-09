import type { Deal } from '../types.js'
import { CONFIG } from '../config.js'
import { id, pick, dateBetween, formatDate, toISO, weightedPick, random } from '../utils.js'
import type { Lead } from '../types.js'
import type { Vehicle } from '../types.js'
import type { Customer } from '../types.js'
import type { Profile } from '../types.js'
import type { DealStage } from '../types.js'

const LOST_REASONS = [
  'Competitor offered lower price.',
  'Customer postponed purchase.',
  'Financing rejected.',
  'Exported to other market instead.',
  'Deal fell through at last minute.',
  'Customer chose different model.',
]

export function generateDeals(
  leads: Lead[],
  vehicles: Vehicle[],
  customers: Customer[],
  profiles: Profile[]
): Deal[] {
  const start = CONFIG.startDate
  const end = CONFIG.endDate
  const salesIds = profiles.filter((p) => p.role === 'sales' || p.role === 'manager').map((p) => p.id)
  const list: Deal[] = []
  const leadUsed = new Set<string>()

  for (let i = 0; i < CONFIG.deals; i++) {
    let lead: Lead
    let tries = 0
    do {
      lead = pick(leads)
      tries++
      if (tries > 500) throw new Error('Could not find unused lead for deal')
    } while (leadUsed.has(lead.id))
    leadUsed.add(lead.id)

    const stage = weightedPick(CONFIG.dealStageWeights as Record<DealStage, number>)
    const assignedTo = lead.assignedTo ?? pick(salesIds)
    const customerId = lead.customerId ?? pick(customers).id
    const vehicle = lead.interestedVehicleId
      ? vehicles.find((v) => v.id === lead.interestedVehicleId)
      : pick(vehicles)
    const vehicleId = vehicle?.id
    const expectedPrice = vehicle?.price ? Math.round(vehicle.price * (0.95 + random() * 0.1)) : undefined
    const isClosed = stage === 'closed_won' || stage === 'closed_lost'
    const createdAt = new Date(lead.createdAt)
    const closedDate = isClosed ? dateBetween(createdAt, end) : null
    const futureEnd = new Date(Math.min(createdAt.getTime() + 60 * 86400 * 1000, end.getTime()))
    const expectedCloseDate = isClosed && closedDate ? formatDate(closedDate) : formatDate(dateBetween(createdAt, futureEnd))
    const finalPrice =
      stage === 'closed_won' && expectedPrice
        ? Math.round(expectedPrice * (0.97 + random() * 0.04))
        : undefined
    const lostReason = stage === 'closed_lost' ? pick(LOST_REASONS) : undefined
    const updatedAt = closedDate ?? dateBetween(createdAt, end)

    list.push({
      id: id('deal', i + 1),
      stage,
      assignedTo,
      leadId: lead.id,
      vehicleId,
      customerId,
      expectedPrice,
      finalPrice,
      expectedCloseDate,
      lostReason,
      createdAt: toISO(createdAt),
      updatedAt: toISO(updatedAt),
      createdBy: assignedTo,
    })
  }
  return list
}
