import type { CrawlVehicle } from './types.js'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate CrawlVehicle trước khi import (bắt buộc: brand, model, year).
 */
export function validate(car: CrawlVehicle): ValidationResult {
  const errors: string[] = []
  if (!car.brand?.trim()) errors.push('Thiếu brand')
  if (!car.model?.trim()) errors.push('Thiếu model')
  if (!car.year || car.year < 1990 || car.year > 2030) errors.push('Year không hợp lệ (1990-2030)')
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Dedup theo (source, sourceUrl) hoặc (brand, model, year, mileage, price).
 */
export function dedupByKey(
  items: CrawlVehicle[],
  key: (c: CrawlVehicle) => string
): CrawlVehicle[] {
  const seen = new Set<string>()
  return items.filter((c) => {
    const k = key(c)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export function dedupCrawlVehicles(items: CrawlVehicle[]): CrawlVehicle[] {
  return dedupByKey(items, (c) => `${c.source}:${c.sourceUrl}`)
}
