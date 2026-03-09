/**
 * Seed config: volumes and date range for ~1 year (Singapore dealers → Thailand).
 */
export const CONFIG = {
  /** Fixed seed for reproducible data */
  randomSeed: 'lemonaid-dms-sg-th-2024',

  /** Timeline: ~1 year */
  startDate: new Date('2024-03-01T00:00:00.000Z'),
  endDate: new Date('2025-03-09T23:59:59.999Z'),

  /** Entity counts (moderate size for demo) */
  profiles: 5,
  customers: 60,
  vehicles: 100,
  leads: 150,
  deals: 90,

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
