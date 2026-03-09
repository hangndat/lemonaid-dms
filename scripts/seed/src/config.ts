/**
 * Seed config: volumes and date range for ~1 year (Singapore dealers → Thailand).
 * Khung thời gian: 1 năm trước → thời điểm chạy script (current time).
 */
const _endDate = new Date()
const _startDate = new Date(_endDate)
_startDate.setFullYear(_startDate.getFullYear() - 1)

export const CONFIG = {
  /** Fixed seed for reproducible data */
  randomSeed: 'lemonaid-dms-sg-th-2024',

  /** Timeline: 1 năm trước kể từ current time */
  startDate: _startDate,
  endDate: _endDate,

  /** Entity counts (~10x for larger demo) */
  profiles: 5,
  customers: 600,
  vehicles: 1000,
  leads: 1500,
  deals: 900,

  /** Customer mix: tỉ lệ khách cá nhân (còn lại là dealer/công ty) */
  customerIndividualRatio: 0.35,
  /** Customer mix: tỉ lệ khách từ Malaysia (còn lại Singapore) */
  customerMalaysiaRatio: 0.35,

  /** Lead source distribution (weights sum to 100) */
  leadSourceWeights: {
    website: 30,
    marketplace: 25,
    hotline: 20,
    facebook: 15,
    walk_in: 10,
  } as Record<string, number>,

  /** Lead status distribution for closed leads (rest stay new/contacted/etc) */
  leadStatusWeights: {
    new: 12,
    contacted: 15,
    test_drive: 10,
    negotiation: 8,
    closed: 35,
    lost: 20,
  } as Record<string, number>,

  /** Vehicle status distribution */
  vehicleStatusWeights: {
    draft: 10,
    available: 35,
    reserved: 15,
    sold: 40,
  } as Record<string, number>,

  /** Deal stage distribution */
  dealStageWeights: {
    lead: 8,
    test_drive: 12,
    negotiation: 15,
    loan_processing: 10,
    closed_won: 40,
    closed_lost: 15,
  } as Record<string, number>,

  /** THB price range (Baht) by segment - rough min/max */
  priceRangeThb: { min: 450_000, max: 2_800_000 },

  /** Photos per vehicle: min, max */
  photosPerVehicle: { min: 0, max: 4 },

  /** Lead activities per lead: min, max */
  leadActivitiesPerLead: { min: 0, max: 3 },

  /** Deal activities per deal: min, max */
  dealActivitiesPerDeal: { min: 1, max: 4 },
} as const

export type Config = typeof CONFIG
