import { INIT_FLAG, KEYS } from '../storage/keys'
import { storage } from '../storage'
import profilesSeed from './profiles.seed.json'
import vehiclesSeed from './vehicles.seed.json'
import vehiclePhotosSeed from './vehicle_photos.seed.json'
import vehiclePriceHistorySeed from './vehicle_price_history.seed.json'
import customersSeed from './customers.seed.json'
import leadsSeed from './leads.seed.json'
import leadActivitiesSeed from './lead_activities.seed.json'
import dealsSeed from './deals.seed.json'
import dealActivitiesSeed from './deal_activities.seed.json'

export function isInitialized(): boolean {
  return storage.get<string>(INIT_FLAG) === 'true'
}

export function loadSeedIntoStorage(): void {
  storage.set(KEYS.profiles, profilesSeed)
  storage.set(KEYS.vehicles, vehiclesSeed)
  storage.set(KEYS.vehiclePhotos, vehiclePhotosSeed)
  storage.set(KEYS.vehiclePriceHistory, vehiclePriceHistorySeed)
  storage.set(KEYS.customers, customersSeed)
  storage.set(KEYS.leads, leadsSeed)
  storage.set(KEYS.leadActivities, leadActivitiesSeed)
  storage.set(KEYS.deals, dealsSeed)
  storage.set(KEYS.dealActivities, dealActivitiesSeed)
  storage.set(INIT_FLAG, 'true')
}

export function ensureInitialized(): void {
  if (!isInitialized()) {
    loadSeedIntoStorage()
  }
}
