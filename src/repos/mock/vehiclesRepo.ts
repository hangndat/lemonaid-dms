import type { Vehicle, VehiclePhoto, VehiclePriceHistory } from '../../types'
import type { VehiclesRepo } from '../types'
import { storage } from '../../data/storage'
import { KEYS } from '../../data/storage/keys'
import { ensureInitialized } from '../../data/seed/loadSeed'

function getVehicles(): Vehicle[] {
  ensureInitialized()
  return storage.get<Vehicle[]>(KEYS.vehicles) ?? []
}

function setVehicles(data: Vehicle[]): void {
  storage.set(KEYS.vehicles, data)
}

function getPhotos(): VehiclePhoto[] {
  ensureInitialized()
  return storage.get<VehiclePhoto[]>(KEYS.vehiclePhotos) ?? []
}

function setPhotos(data: VehiclePhoto[]): void {
  storage.set(KEYS.vehiclePhotos, data)
}

function getPriceHistory(): VehiclePriceHistory[] {
  ensureInitialized()
  return storage.get<VehiclePriceHistory[]>(KEYS.vehiclePriceHistory) ?? []
}

function setPriceHistory(data: VehiclePriceHistory[]): void {
  storage.set(KEYS.vehiclePriceHistory, data)
}

function applySearchFilter<T>(items: T[], search: string | undefined, fields: (keyof T)[]): T[] {
  if (!search?.trim()) return items
  const q = search.trim().toLowerCase()
  return items.filter((item) =>
    fields.some((f) => {
      const v = item[f]
      return typeof v === 'string' && v.toLowerCase().includes(q)
    })
  )
}

export const vehiclesRepo: VehiclesRepo = {
  async list(query) {
    let items = getVehicles()
    const search = query?.search
    if (search) {
      items = applySearchFilter(items, search, ['vin', 'brand', 'model', 'variant'] as (keyof Vehicle)[])
    }
    const filters = query?.filters as Record<string, unknown> | undefined
    if (filters?.status) {
      items = items.filter((v) => v.status === filters.status)
    }
    if (filters?.brand) {
      items = items.filter((v) => v.brand === filters.brand)
    }
    const yMin = filters?.yearMin as number | undefined
    if (typeof yMin === 'number') items = items.filter((v) => v.year >= yMin)
    const yMax = filters?.yearMax as number | undefined
    if (typeof yMax === 'number') items = items.filter((v) => v.year <= yMax)
    const pMin = filters?.priceMin as number | undefined
    if (typeof pMin === 'number') items = items.filter((v) => (v.price ?? 0) >= pMin)
    const pMax = filters?.priceMax as number | undefined
    if (typeof pMax === 'number') items = items.filter((v) => (v.price ?? 0) <= pMax)
    const sort = query?.sort
    if (sort) {
      const { field, order } = sort
      items = [...items].sort((a, b) => {
        const va = (a as unknown as Record<string, unknown>)[field]
        const vb = (b as unknown as Record<string, unknown>)[field]
        if (va == null && vb == null) return 0
        if (va == null) return order === 'asc' ? 1 : -1
        if (vb == null) return order === 'asc' ? -1 : 1
        const cmp = va < vb ? -1 : va > vb ? 1 : 0
        return order === 'desc' ? -cmp : cmp
      })
    }
    const total = items.length
    const page = query?.page ?? 1
    const pageSize = query?.pageSize ?? 20
    const start = (page - 1) * pageSize
    items = items.slice(start, start + pageSize)
    return { items, total, page, pageSize }
  },

  async get(id) {
    const list = getVehicles()
    return list.find((v) => v.id === id) ?? null
  },

  async create(payload) {
    const list = getVehicles()
    const now = new Date().toISOString()
    const vehicle: Vehicle = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    list.push(vehicle)
    setVehicles(list)
    if (typeof payload.price === 'number') {
      await this.appendPriceHistory(vehicle.id, payload.price, payload.createdBy)
    }
    return vehicle
  },

  async update(id, patch) {
    const list = getVehicles()
    const idx = list.findIndex((v) => v.id === id)
    if (idx === -1) throw new Error('Vehicle not found')
    const existing = list[idx]
    if (patch.price != null && patch.price !== existing.price) {
      await this.appendPriceHistory(id, patch.price, patch.createdBy)
    }
    const updated: Vehicle = { ...existing, ...patch, updatedAt: new Date().toISOString() }
    list[idx] = updated
    setVehicles(list)
    return updated
  },

  async remove(id) {
    const list = getVehicles().filter((v) => v.id !== id)
    setVehicles(list)
    const photos = getPhotos().filter((p) => p.vehicleId !== id)
    setPhotos(photos)
    const history = getPriceHistory().filter((h) => h.vehicleId !== id)
    setPriceHistory(history)
  },

  async getPhotos(vehicleId) {
    const list = getPhotos().filter((p) => p.vehicleId === vehicleId)
    return list.sort((a, b) => a.sortOrder - b.sortOrder)
  },

  async addPhoto(vehicleId, url, sortOrder = 0) {
    const list = getPhotos()
    const photo: VehiclePhoto = {
      id: crypto.randomUUID(),
      vehicleId,
      url,
      sortOrder,
      createdAt: new Date().toISOString(),
    }
    list.push(photo)
    setPhotos(list)
    return photo
  },

  async removePhoto(photoId) {
    const list = getPhotos().filter((p) => p.id !== photoId)
    setPhotos(list)
  },

  async getPriceHistory(vehicleId) {
    const list = getPriceHistory().filter((h) => h.vehicleId === vehicleId)
    return list.sort((a, b) => (b.recordedAt < a.recordedAt ? -1 : 1))
  },

  async appendPriceHistory(vehicleId, price, recordedBy) {
    const list = getPriceHistory()
    const record: VehiclePriceHistory = {
      id: crypto.randomUUID(),
      vehicleId,
      price,
      recordedAt: new Date().toISOString(),
      recordedBy,
    }
    list.push(record)
    setPriceHistory(list)
    return record
  },
}
