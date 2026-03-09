import type { VehiclePhoto } from '../types.js'
import { CONFIG } from '../config.js'
import { id, int, toISO } from '../utils.js'
import type { Vehicle } from '../types.js'

export function generateVehiclePhotos(vehicles: Vehicle[]): VehiclePhoto[] {
  const list: VehiclePhoto[] = []
  let photoId = 0
  for (const v of vehicles) {
    const n = int(CONFIG.photosPerVehicle.min, CONFIG.photosPerVehicle.max)
    const baseDate = new Date(v.createdAt)
    for (let i = 0; i < n; i++) {
      photoId++
      list.push({
        id: id('vp', photoId),
        vehicleId: v.id,
        url: `https://picsum.photos/seed/${v.id.replace('-', '')}${i}/800/600`,
        sortOrder: i,
        createdAt: toISO(new Date(baseDate.getTime() + i * 3600 * 1000)),
        createdBy: v.createdBy,
      })
    }
  }
  return list
}
