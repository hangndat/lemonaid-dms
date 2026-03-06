import type {
  Vehicle,
  VehiclePhoto,
  VehiclePriceHistory,
  Customer,
  Lead,
  LeadActivity,
  Deal,
  DealActivity,
  Profile,
  ListQuery,
  ListResult,
} from '../types'

export interface VehiclesRepo {
  list(query?: ListQuery): Promise<ListResult<Vehicle>>
  get(id: string): Promise<Vehicle | null>
  create(payload: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle>
  update(id: string, patch: Partial<Vehicle>): Promise<Vehicle>
  remove(id: string): Promise<void>
  getPhotos(vehicleId: string): Promise<VehiclePhoto[]>
  addPhoto(vehicleId: string, url: string, sortOrder?: number): Promise<VehiclePhoto>
  removePhoto(photoId: string): Promise<void>
  getPriceHistory(vehicleId: string): Promise<VehiclePriceHistory[]>
  appendPriceHistory(vehicleId: string, price: number, recordedBy?: string): Promise<VehiclePriceHistory>
}

export interface CustomersRepo {
  list(query?: ListQuery): Promise<ListResult<Customer>>
  get(id: string): Promise<Customer | null>
  create(payload: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer>
  update(id: string, patch: Partial<Customer>): Promise<Customer>
  remove(id: string): Promise<void>
}

export interface LeadsRepo {
  list(query?: ListQuery): Promise<ListResult<Lead>>
  get(id: string): Promise<Lead | null>
  create(payload: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead>
  update(id: string, patch: Partial<Lead>): Promise<Lead>
  remove(id: string): Promise<void>
  getActivities(leadId: string): Promise<LeadActivity[]>
  addActivity(leadId: string, type: LeadActivity['type'], content?: string, createdBy?: string): Promise<LeadActivity>
}

export interface DealsRepo {
  list(query?: ListQuery): Promise<ListResult<Deal>>
  get(id: string): Promise<Deal | null>
  create(payload: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal>
  update(id: string, patch: Partial<Deal>): Promise<Deal>
  remove(id: string): Promise<void>
  getActivities(dealId: string): Promise<DealActivity[]>
  addActivity(dealId: string, type: DealActivity['type'], content?: string, createdBy?: string): Promise<DealActivity>
}

export interface ProfilesRepo {
  list(): Promise<Profile[]>
  get(id: string): Promise<Profile | null>
}
