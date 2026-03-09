import type { VehiclePhoto } from '../types'
import { CONFIG } from '../config.js'
import { id, int, toISO, pick } from '../utils.js'
import type { Vehicle } from '../types'

/**
 * @param vehicles - Danh sách xe seed
 * @param imageUrlPool - URL ảnh thật từ crawl (sàn xe). Nếu có và không rỗng thì dùng thay picsum.
 */
export function generateVehiclePhotos(
  vehicles: Vehicle[],
  imageUrlPool: string[] = []
): VehiclePhoto[] {
  const useRealPhotos = imageUrlPool.length > 0
  const list: VehiclePhoto[] = []
  let photoId = 0
  for (const v of vehicles) {
    const n = int(CONFIG.photosPerVehicle.min, CONFIG.photosPerVehicle.max)
    const baseDate = new Date(v.createdAt)
    for (let i = 0; i < n; i++) {
      photoId++
      const url = useRealPhotos
        ? pick(imageUrlPool)
        : `https://picsum.photos/seed/${v.id.replace(/-/g, '')}${i}/800/600`
      list.push({
        id: id('vp', photoId),
        vehicleId: v.id,
        url,
        sortOrder: i,
        createdAt: toISO(new Date(baseDate.getTime() + i * 3600 * 1000)),
        createdBy: v.createdBy,
      })
    }
  }
  return list
}
