/**
 * Đọc output/crawled-vehicles.json và merge vào seed (vehicles + vehicle_photos).
 * Chạy: npm run import (từ thư mục scripts/crawler)
 */
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import type { CrawlVehicle } from './types.js'

const CRAWLER_ROOT = join(process.cwd())
const OUTPUT_FILE = join(CRAWLER_ROOT, 'output', 'crawled-vehicles.json')
const SEED_VEHICLES = join(CRAWLER_ROOT, '..', '..', 'src', 'data', 'seed', 'vehicles.seed.json')
const SEED_PHOTOS = join(CRAWLER_ROOT, '..', '..', 'src', 'data', 'seed', 'vehicle_photos.seed.json')

interface SeedVehicle {
  id: string
  vin?: string
  brand: string
  model: string
  variant?: string
  year: number
  mileage?: number
  color?: string
  transmission?: string
  fuelType?: string
  price?: number
  cost?: number
  stockInDate?: string
  description?: string
  status: string
  createdAt: string
  updatedAt: string
  createdBy?: string
}

interface SeedPhoto {
  id: string
  vehicleId: string
  url: string
  sortOrder: number
  createdAt: string
  createdBy?: string
}

function nextVehicleId(existing: SeedVehicle[]): string {
  const nums = existing
    .map((v) => v.id.replace(/^vehicle-/, ''))
    .filter((s) => /^\d+$/.test(s))
    .map((s) => parseInt(s, 10))
  const max = nums.length ? Math.max(...nums) : 0
  return `vehicle-${max + 1}`
}

function nextPhotoId(existing: SeedPhoto[]): string {
  const nums = existing
    .map((p) => p.id.replace(/^vp-/, ''))
    .filter((s) => /^\d+$/.test(s))
    .map((s) => parseInt(s, 10))
  const max = nums.length ? Math.max(...nums) : 0
  return `vp-${max + 1}`
}

async function main() {
  let crawled: CrawlVehicle[]
  try {
    const buf = await readFile(OUTPUT_FILE, 'utf-8')
    crawled = JSON.parse(buf) as CrawlVehicle[]
  } catch (e) {
    console.error('Không đọc được output/crawled-vehicles.json. Chạy npm run crawl trước.')
    process.exit(1)
  }

  if (!crawled.length) {
    console.log('Không có dữ liệu crawl để import.')
    return
  }

  const vehiclesPath = join(CRAWLER_ROOT, '..', '..', 'src', 'data', 'seed', 'vehicles.seed.json')
  const photosPath = join(CRAWLER_ROOT, '..', '..', 'src', 'data', 'seed', 'vehicle_photos.seed.json')

  const existingVehicles: SeedVehicle[] = JSON.parse(
    await readFile(vehiclesPath, 'utf-8')
  ) as SeedVehicle[]
  const existingPhotos: SeedPhoto[] = JSON.parse(
    await readFile(photosPath, 'utf-8')
  ) as SeedPhoto[]

  const now = new Date().toISOString()
  const newVehicles: SeedVehicle[] = []
  const newPhotos: SeedPhoto[] = []
  let nextVId = nextVehicleId(existingVehicles)
  let nextPId = nextPhotoId(existingPhotos)

  for (const c of crawled) {
    const vehicleId = nextVId
    nextVId = `vehicle-${parseInt(nextVId.replace('vehicle-', ''), 10) + 1}`

    newVehicles.push({
      id: vehicleId,
      brand: c.brand,
      model: c.model,
      variant: c.variant,
      year: c.year,
      mileage: c.mileage,
      color: c.color,
      transmission: c.transmission,
      fuelType: c.fuelType,
      price: c.price,
      description: c.description,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    })

    for (let i = 0; i < (c.imageUrls?.length ?? 0); i++) {
      newPhotos.push({
        id: nextPId,
        vehicleId,
        url: c.imageUrls[i]!,
        sortOrder: i,
        createdAt: now,
      })
      nextPId = `vp-${parseInt(nextPId.replace('vp-', ''), 10) + 1}`
    }
  }

  const mergedVehicles = [...existingVehicles, ...newVehicles]
  const mergedPhotos = [...existingPhotos, ...newPhotos]

  await writeFile(vehiclesPath, JSON.stringify(mergedVehicles, null, 2), 'utf-8')
  await writeFile(photosPath, JSON.stringify(mergedPhotos, null, 2), 'utf-8')

  console.log(`Đã import ${newVehicles.length} xe, ${newPhotos.length} ảnh vào seed.`)
  console.log('Reload app để thấy xe mới (status: draft).')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
