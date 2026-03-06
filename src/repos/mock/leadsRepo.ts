import type { Lead, LeadActivity } from '../../types'
import type { LeadsRepo } from '../types'
import { storage } from '../../data/storage'
import { KEYS } from '../../data/storage/keys'
import { ensureInitialized } from '../../data/seed/loadSeed'

function getLeads(): Lead[] {
  ensureInitialized()
  return storage.get<Lead[]>(KEYS.leads) ?? []
}

function setLeads(data: Lead[]): void {
  storage.set(KEYS.leads, data)
}

function getActivities(): LeadActivity[] {
  ensureInitialized()
  return storage.get<LeadActivity[]>(KEYS.leadActivities) ?? []
}

function setActivities(data: LeadActivity[]): void {
  storage.set(KEYS.leadActivities, data)
}

function applySearch<T>(items: T[], search: string | undefined, fields: (keyof T)[]): T[] {
  if (!search?.trim()) return items
  const q = search.trim().toLowerCase()
  return items.filter((item) =>
    fields.some((f) => {
      const v = item[f]
      return typeof v === 'string' && v.toLowerCase().includes(q)
    })
  )
}

export const leadsRepo: LeadsRepo = {
  async list(query) {
    let items = getLeads()
    items = applySearch(items, query?.search, ['name', 'phone', 'email'] as (keyof Lead)[])
    const filters = query?.filters as Record<string, unknown> | undefined
    if (filters?.status) items = items.filter((l) => l.status === filters.status)
    if (filters?.source) items = items.filter((l) => l.source === filters.source)
    if (filters?.assignedTo) items = items.filter((l) => l.assignedTo === filters.assignedTo)
    const total = items.length
    const page = query?.page ?? 1
    const pageSize = query?.pageSize ?? 20
    const start = (page - 1) * pageSize
    items = items.slice(start, start + pageSize)
    return { items, total, page, pageSize }
  },

  async get(id) {
    return getLeads().find((l) => l.id === id) ?? null
  },

  async create(payload) {
    const list = getLeads()
    const now = new Date().toISOString()
    const lead: Lead = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    list.push(lead)
    setLeads(list)
    return lead
  },

  async update(id, patch) {
    const list = getLeads()
    const idx = list.findIndex((l) => l.id === id)
    if (idx === -1) throw new Error('Lead not found')
    const updated: Lead = {
      ...list[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    list[idx] = updated
    setLeads(list)
    return updated
  },

  async remove(id) {
    setLeads(getLeads().filter((l) => l.id !== id))
    setActivities(getActivities().filter((a) => a.leadId !== id))
  },

  async getActivities(leadId) {
    const list = getActivities().filter((a) => a.leadId === leadId)
    return list.sort((a, b) => (b.createdAt < a.createdAt ? -1 : 1))
  },

  async addActivity(leadId, type, content, createdBy) {
    const list = getActivities()
    const activity: LeadActivity = {
      id: crypto.randomUUID(),
      leadId,
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
