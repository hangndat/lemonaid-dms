import type { Lead } from '../types.js'
import { CONFIG } from '../config.js'
import { id, pick, dateBetween, toISO, weightedPick, random } from '../utils.js'
import type { Customer } from '../types.js'
import type { Vehicle } from '../types.js'
import type { Profile } from '../types.js'
import type { LeadSource, LeadStatus } from '../types.js'

export function generateLeads(
  customers: Customer[],
  vehicles: Vehicle[],
  profiles: Profile[]
): Lead[] {
  const start = CONFIG.startDate
  const end = CONFIG.endDate
  const salesProfiles = profiles.filter((p) => p.role === 'sales' || p.role === 'manager').map((p) => p.id)
  const list: Lead[] = []

  for (let i = 0; i < CONFIG.leads; i++) {
    const source = weightedPick(CONFIG.leadSourceWeights as Record<LeadSource, number>)
    const status = weightedPick(CONFIG.leadStatusWeights as Record<LeadStatus, number>)
    const customer = pick(customers)
    const assignedTo = pick(salesProfiles)
    const createdAt = dateBetween(start, end)
    const hasVehicle = random() > 0.4
    const vehicle = hasVehicle ? pick(vehicles) : undefined

    list.push({
      id: id('lead', i + 1),
      source,
      status,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      notes: random() > 0.7 ? 'Inquiry for export to Thailand.' : undefined,
      customerId: customer.id,
      interestedVehicleId: vehicle?.id,
      assignedTo,
      createdAt: toISO(createdAt),
      updatedAt: toISO(createdAt),
      createdBy: assignedTo,
    })
  }
  return list
}
