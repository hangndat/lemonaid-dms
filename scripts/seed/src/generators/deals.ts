import type { Deal } from '../types'
import { CONFIG } from '../config.js'
import { id, pick, dateBetween, formatDate, toISO, weightedPick, random } from '../utils.js'
import type { Lead } from '../types'
import type { Vehicle } from '../types'
import type { Customer } from '../types'
import type { Profile } from '../types'
import type { DealStage } from '../types'

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
    const vehiclesWithPrice = vehicles.filter((v) => v.price != null && v.price > 0)
    const vehicleByLead = lead.interestedVehicleId
      ? vehicles.find((v) => v.id === lead.interestedVehicleId)
      : null
    const vehicle =
      vehicleByLead?.price != null && vehicleByLead.price > 0
        ? vehicleByLead
        : vehiclesWithPrice.length > 0
          ? pick(vehiclesWithPrice)
          : pick(vehicles)
    const vehicleId = vehicle?.id
    const vehiclePrice = vehicle?.price ?? 0
    const expectedPrice =
      vehiclePrice > 0
        ? Math.round(vehiclePrice * (0.98 + random() * 0.05))
        : undefined
    const isClosed = stage === 'closed_won' || stage === 'closed_lost'
    const createdAt = new Date(lead.createdAt)
    const closedDate = isClosed ? dateBetween(createdAt, end) : null
    const futureEnd = new Date(Math.min(createdAt.getTime() + 60 * 86400 * 1000, end.getTime()))
    const expectedCloseDate = isClosed && closedDate ? formatDate(closedDate) : formatDate(dateBetween(createdAt, futureEnd))
    const finalPrice =
      stage === 'closed_won' && expectedPrice
        ? Math.round(expectedPrice * (0.99 + random() * 0.02))
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
