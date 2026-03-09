/**
 * Mirror of app entity types for seed script (no import from app to avoid path issues).
 */
export type ProfileRole = 'admin' | 'manager' | 'sales'
export type VehicleStatus = 'draft' | 'available' | 'reserved' | 'sold'
export type LeadSource = 'facebook' | 'website' | 'marketplace' | 'walk_in' | 'hotline'
export type LeadStatus = 'new' | 'contacted' | 'test_drive' | 'negotiation' | 'closed' | 'lost'
export type DealStage =
  | 'lead'
  | 'test_drive'
  | 'negotiation'
  | 'loan_processing'
  | 'closed_won'
  | 'closed_lost'
export type LeadActivityType = 'note' | 'call' | 'status_change'
export type DealActivityType = 'note' | 'stage_change'

export interface Profile {
  id: string
  fullName: string
  email: string
  role: ProfileRole
  createdAt?: string
  updatedAt?: string
}

export interface Vehicle {
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
  status: VehicleStatus
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface VehiclePhoto {
  id: string
  vehicleId: string
  url: string
  sortOrder: number
  createdAt: string
  createdBy?: string
}

export interface VehiclePriceHistory {
  id: string
  vehicleId: string
  price: number
  recordedAt: string
  recordedBy?: string
}

export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  addressLine2?: string
  city?: string
  state?: string
  postCode?: string
  country?: string
  taxId?: string
  companyRegNo?: string
  website?: string
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface Lead {
  id: string
  source: LeadSource
  status: LeadStatus
  name?: string
  phone?: string
  email?: string
  notes?: string
  customerId?: string
  interestedVehicleId?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface LeadActivity {
  id: string
  leadId: string
  type: LeadActivityType
  content?: string
  createdAt: string
  createdBy?: string
}

export interface Deal {
  id: string
  stage: DealStage
  assignedTo: string
  leadId?: string
  vehicleId?: string
  customerId?: string
  expectedPrice?: number
  finalPrice?: number
  expectedCloseDate?: string
  lostReason?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface DealActivity {
  id: string
  dealId: string
  type: DealActivityType
  content?: string
  createdAt: string
  createdBy?: string
}
