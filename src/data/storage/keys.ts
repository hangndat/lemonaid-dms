export const STORAGE_PREFIX = 'dms.v1'
export const INIT_FLAG = `${STORAGE_PREFIX}.initialized`
export const AUTH_USER_KEY = `${STORAGE_PREFIX}.authUser`

export const KEYS = {
  profiles: `${STORAGE_PREFIX}.profiles`,
  vehicles: `${STORAGE_PREFIX}.vehicles`,
  vehiclePhotos: `${STORAGE_PREFIX}.vehicle_photos`,
  vehiclePriceHistory: `${STORAGE_PREFIX}.vehicle_price_history`,
  customers: `${STORAGE_PREFIX}.customers`,
  leads: `${STORAGE_PREFIX}.leads`,
  leadActivities: `${STORAGE_PREFIX}.lead_activities`,
  deals: `${STORAGE_PREFIX}.deals`,
  dealActivities: `${STORAGE_PREFIX}.deal_activities`,
} as const

export const ALL_KEYS = [
  INIT_FLAG,
  AUTH_USER_KEY,
  KEYS.profiles,
  KEYS.vehicles,
  KEYS.vehiclePhotos,
  KEYS.vehiclePriceHistory,
  KEYS.customers,
  KEYS.leads,
  KEYS.leadActivities,
  KEYS.deals,
  KEYS.dealActivities,
] as const
