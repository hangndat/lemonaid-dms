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
    const mileage = status === 'draft' ? 0 : int(0, 80_000)

    const basePrice = float(bm.minPriceThb, bm.maxPriceThb)
    const yearFactor = 0.82 + (year - 2020) * 0.045
    const mileageFactor = mileage >= 60_000 ? 0.88 : mileage >= 40_000 ? 0.93 : mileage >= 20_000 ? 0.97 : 1
    const rawPrice = basePrice * yearFactor * mileageFactor
    const price =
      status !== 'draft'
        ? Math.round(rawPrice / 1000) * 1000
        : undefined
    const cost =
      status !== 'draft' && price != null
        ? Math.round((price * float(0.88, 0.95)) / 1000) * 1000
        : undefined
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
      mileage: status === 'draft' ? undefined : mileage,
      color: pick(COLORS),
      transmission: pick(TRANSMISSIONS),
      fuelType: pick(FUEL_TYPES),
      price,
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
