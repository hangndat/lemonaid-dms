import type { Customer } from '../../types'
import type { CustomersRepo } from '../types'
import { storage } from '../../data/storage'
import { KEYS } from '../../data/storage/keys'
import { ensureInitialized } from '../../data/seed/loadSeed'

function getCustomers(): Customer[] {
  ensureInitialized()
  return storage.get<Customer[]>(KEYS.customers) ?? []
}

function setCustomers(data: Customer[]): void {
  storage.set(KEYS.customers, data)
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

export const customersRepo: CustomersRepo = {
  async list(query) {
    let items = applySearch(getCustomers(), query?.search, ['name', 'phone', 'email'] as (keyof Customer)[])
    const total = items.length
    const page = query?.page ?? 1
    const pageSize = query?.pageSize ?? 20
    const start = (page - 1) * pageSize
    items = items.slice(start, start + pageSize)
    return { items, total, page, pageSize }
  },

  async get(id) {
    return getCustomers().find((c) => c.id === id) ?? null
  },

  async create(payload) {
    const list = getCustomers()
    const now = new Date().toISOString()
    const customer: Customer = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    list.push(customer)
    setCustomers(list)
    return customer
  },

  async update(id, patch) {
    const list = getCustomers()
    const idx = list.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Customer not found')
    const updated: Customer = {
      ...list[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    list[idx] = updated
    setCustomers(list)
    return updated
  },

  async remove(id) {
    setCustomers(getCustomers().filter((c) => c.id !== id))
  },
}
