import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { generateProfiles } from './generators/profiles.js'
import { generateCustomers } from './generators/customers.js'
import { generateVehicles } from './generators/vehicles.js'
import { generateVehiclePhotos } from './generators/vehiclePhotos.js'
import { generateVehiclePriceHistory } from './generators/vehiclePriceHistory.js'
import { generateLeads } from './generators/leads.js'
import { generateLeadActivities } from './generators/leadActivities.js'
import { generateDeals } from './generators/deals.js'
import { generateDealActivities } from './generators/dealActivities.js'
import { loadCrawledImagePool } from './data/loadCrawledPhotos.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../../..')
const SEED_DIR = join(ROOT, 'src/data/seed')

function writeJson(filename: string, data: unknown) {
  const path = join(SEED_DIR, filename)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log('Written:', filename)
}

function main() {
  console.log('Generating seed data (Singapore dealers → Thailand, ~1 year)...\n')

  const profiles = generateProfiles()
  const profileIds = profiles.map((p) => p.id)
  const adminId = profiles.find((p) => p.role === 'admin')?.id ?? profileIds[0]!

  const customers = generateCustomers(profiles)
  const vehicles = generateVehicles(profileIds)
  const imageUrlPool = loadCrawledImagePool()
  if (imageUrlPool.length) {
    console.log(`Using ${imageUrlPool.length} real images from crawl (scripts/crawler/output/crawled-vehicles.json)`)
  } else {
    console.log('No crawl output found; vehicle photos will use placeholder (picsum). Run: npm run crawl --prefix scripts/crawler')
  }
  const vehiclePhotos = generateVehiclePhotos(vehicles, imageUrlPool)
  const vehiclePriceHistory = generateVehiclePriceHistory(vehicles, adminId!)
  const leads = generateLeads(customers, vehicles, profiles)
  const leadActivities = generateLeadActivities(leads, profileIds)
  const deals = generateDeals(leads, vehicles, customers, profiles)
  const dealActivities = generateDealActivities(deals, profileIds)

  writeJson('profiles.seed.json', profiles)
  writeJson('customers.seed.json', customers)
  writeJson('vehicles.seed.json', vehicles)
  writeJson('vehicle_photos.seed.json', vehiclePhotos)
  writeJson('vehicle_price_history.seed.json', vehiclePriceHistory)
  writeJson('leads.seed.json', leads)
  writeJson('lead_activities.seed.json', leadActivities)
  writeJson('deals.seed.json', deals)
  writeJson('deal_activities.seed.json', dealActivities)

  console.log('\nDone. Seed files written to src/data/seed/')
}

main()
