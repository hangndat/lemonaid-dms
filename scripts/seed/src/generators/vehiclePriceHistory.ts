import type { VehiclePriceHistory } from '../types'
import { id, toISO, random } from '../utils.js'
import type { Vehicle } from '../types'

export function generateVehiclePriceHistory(vehicles: Vehicle[], adminId: string): VehiclePriceHistory[] {
  const list: VehiclePriceHistory[] = []
  let recId = 0
  for (const v of vehicles) {
    if (v.status === 'draft' || v.price == null) continue
    recId++
    const recordedAt = v.createdAt
    list.push({
      id: id('vph', recId),
      vehicleId: v.id,
      price: v.price,
      recordedAt,
      recordedBy: adminId,
    })
    // Some vehicles get a second price change
    if (random() < 0.25) {
      recId++
      const newPrice = Math.round(v.price * (0.92 + random() * 0.1))
      list.push({
        id: id('vph', recId),
        vehicleId: v.id,
        price: newPrice,
        recordedAt: toISO(new Date(new Date(recordedAt).getTime() + 7 * 86400 * 1000)),
        recordedBy: adminId,
      })
    }
  }
  return list
}
