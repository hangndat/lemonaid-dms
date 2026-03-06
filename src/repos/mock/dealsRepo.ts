import type { Deal, DealActivity } from '../../types'
import type { DealsRepo } from '../types'
import { storage } from '../../data/storage'
import { KEYS } from '../../data/storage/keys'
import { ensureInitialized } from '../../data/seed/loadSeed'

function getDeals(): Deal[] {
  ensureInitialized()
  return storage.get<Deal[]>(KEYS.deals) ?? []
}

function setDeals(data: Deal[]): void {
  storage.set(KEYS.deals, data)
}

function getActivities(): DealActivity[] {
  ensureInitialized()
  return storage.get<DealActivity[]>(KEYS.dealActivities) ?? []
}

function setActivities(data: DealActivity[]): void {
  storage.set(KEYS.dealActivities, data)
}

export const dealsRepo: DealsRepo = {
  async list(query) {
    let items = getDeals()
    const filters = query?.filters as Record<string, unknown> | undefined
    if (filters?.stage) items = items.filter((d) => d.stage === filters.stage)
    if (filters?.assignedTo) items = items.filter((d) => d.assignedTo === filters.assignedTo)
    const total = items.length
    const page = query?.page ?? 1
    const pageSize = query?.pageSize ?? 20
    const start = (page - 1) * pageSize
    items = items.slice(start, start + pageSize)
    return { items, total, page, pageSize }
  },

  async get(id) {
    return getDeals().find((d) => d.id === id) ?? null
  },

  async create(payload) {
    const list = getDeals()
    const now = new Date().toISOString()
    const deal: Deal = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    list.push(deal)
    setDeals(list)
    return deal
  },

  async update(id, patch) {
    const list = getDeals()
    const idx = list.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error('Deal not found')
    const updated: Deal = {
      ...list[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    list[idx] = updated
    setDeals(list)
    return updated
  },

  async remove(id) {
    setDeals(getDeals().filter((d) => d.id !== id))
    setActivities(getActivities().filter((a) => a.dealId !== id))
  },

  async getActivities(dealId) {
    const list = getActivities().filter((a) => a.dealId === dealId)
    return list.sort((a, b) => (b.createdAt < a.createdAt ? -1 : 1))
  },

  async addActivity(dealId, type, content, createdBy) {
    const list = getActivities()
    const activity: DealActivity = {
      id: crypto.randomUUID(),
      dealId,
      type,
      content,
      createdAt: new Date().toISOString(),
      createdBy,
    }
    list.push(activity)
    setActivities(list)
    return activity
  },
}
