/**
 * Tag color maps for status/source/stage in lists and detail pages.
 */
import type { LeadStatus, LeadSource, DealStage, VehicleStatus } from '../types'

export function getLeadStatusTagColor(status: LeadStatus): string {
  const map: Record<LeadStatus, string> = {
    new: 'blue',
    contacted: 'cyan',
    test_drive: 'geekblue',
    negotiation: 'orange',
    closed: 'green',
    lost: 'red',
  }
  return map[status] ?? 'default'
}

export function getLeadSourceTagColor(source: LeadSource): string {
  const map: Record<LeadSource, string> = {
    facebook: 'blue',
    website: 'purple',
    marketplace: 'magenta',
    walk_in: 'green',
    hotline: 'orange',
  }
  return map[source] ?? 'default'
}

export function getDealStageTagColor(stage: DealStage): string {
  const map: Record<DealStage, string> = {
    lead: 'blue',
    test_drive: 'cyan',
    negotiation: 'orange',
    loan_processing: 'geekblue',
    closed_won: 'green',
    closed_lost: 'red',
  }
  return map[stage] ?? 'default'
}

export function getVehicleStatusTagColor(status: VehicleStatus): string {
  const map: Record<VehicleStatus, string> = {
    draft: 'default',
    available: 'green',
    reserved: 'orange',
    sold: 'blue',
  }
  return map[status] ?? 'default'
}
