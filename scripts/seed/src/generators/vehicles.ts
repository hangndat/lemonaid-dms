import type { Vehicle } from '../types'
import { CONFIG } from '../config.js'
import { BRANDS_MODELS, COLORS, TRANSMISSIONS, FUEL_TYPES } from '../data/brands-models.js'
import { id, pick, int, float, dateBetween, formatDate, toISO, fakeVin, weightedPick, random } from '../utils.js'
import type { VehicleStatus } from '../types'

export function generateVehicles(profileIds: string[]): Vehicle[] {
  const start = CONFIG.startDate
  const end = CONFIG.endDate
  const list: Vehicle[] = []

  for (let i = 0; i < CONFIG.vehicles; i++) {
    const status = weightedPick(CONFIG.vehicleStatusWeights as Record<VehicleStatus, number>)
    const bm = pick(BRANDS_MODELS)
    const variant = bm.variants?.length ? pick(bm.variants) : undefined
    const year = int(2020, 2024)
    const price = Math.round(float(bm.minPriceThb, bm.maxPriceThb) / 10000) * 10000
    const cost = status !== 'draft' ? Math.round(price * float(0.88, 0.96)) : undefined
    const stockInDate = status !== 'draft' ? formatDate(dateBetween(start, end)) : undefined
    const createdAt = stockInDate ? new Date(stockInDate + 'T08:00:00.000Z') : dateBetween(start, end)
    const createdBy = pick(profileIds)
    const hasVin = random() > 0.15

    list.push({
      id: id('vehicle', i + 1),
      vin: hasVin ? fakeVin() : undefined,
      brand: bm.brand,
      model: bm.model,
      variant,
      year,
      mileage: status === 'draft' ? undefined : int(0, 80_000),
      color: pick(COLORS),
      transmission: pick(TRANSMISSIONS),
      fuelType: pick(FUEL_TYPES),
      price: status !== 'draft' ? price : undefined,
      cost,
      stockInDate,
      description: status !== 'draft' && random() > 0.5 ? 'Good condition, export ready.' : undefined,
      status,
      createdAt: toISO(createdAt),
      updatedAt: toISO(createdAt),
      createdBy,
    })
  }
  return list
}
