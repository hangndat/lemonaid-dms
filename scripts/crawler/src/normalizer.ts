import type { RawBonbanhListing, CrawlVehicle } from './types.js'
import { extractBrandFromTitle, normalizeBrand } from './brand-dictionary.js'

/**
 * Parse giá VNĐ từ text (vd: "1,2 tỷ", "650 triệu", "500.000.000").
 */
export function parsePriceVnd(text: string | undefined): number | undefined {
  if (!text || !text.trim()) return undefined
  const t = text.replace(/\s/g, '').replace(/,/g, '.')
  const tyMatch = t.match(/([\d.,]+)\s*t[yỉỷ]/i)
  const trieuMatch = t.match(/([\d.,]+)\s*tri[eệ]u/i)
  const soMatch = t.match(/^([\d.]+)$/)
  if (tyMatch) return Math.round(parseFloat(tyMatch[1].replace(/\./g, '')) * 1e9)
  if (trieuMatch) return Math.round(parseFloat(trieuMatch[1].replace(/\./g, '')) * 1e6)
  if (soMatch) return parseInt(soMatch[1].replace(/\./g, ''), 10)
  const digits = t.replace(/\D/g, '')
  if (digits.length >= 6) return parseInt(digits, 10)
  return undefined
}

/**
 * Parse số km từ text (vd: "15.000 km", "15,000 km").
 */
export function parseMileage(text: string | undefined): number | undefined {
  if (!text || !text.trim()) return undefined
  const t = text.replace(/\s/g, '').replace(/,/g, '.').replace(/km/gi, '')
  const n = parseInt(t.replace(/\./g, ''), 10)
  return Number.isNaN(n) ? undefined : n
}

/**
 * Chuẩn hóa hộp số (alias → text ngắn).
 */
function normalizeTransmission(s: string | undefined): string | undefined {
  if (!s || !s.trim()) return undefined
  const lower = s.toLowerCase()
  if (lower.includes('cvt') || lower.includes('vô cấp')) return 'CVT'
  if (lower.includes('at') || lower.includes('tự động') || lower.includes('automatic')) return 'Tự động'
  if (lower.includes('mt') || lower.includes('tay') || lower.includes('manual')) return 'Tay số'
  if (lower.includes('dct') || lower.includes('ly hợp kép')) return 'DCT'
  if (lower.includes('amt') || lower.includes('bán tự động')) return 'Bán tự động'
  return s.trim()
}

/**
 * Chuẩn hóa nhiên liệu.
 */
function normalizeFuelType(s: string | undefined): string | undefined {
  if (!s || !s.trim()) return undefined
  const lower = s.toLowerCase()
  if (lower.includes('xăng') || lower.includes('petrol') || lower.includes('gasoline')) return 'Xăng'
  if (lower.includes('dầu') || lower.includes('diesel')) return 'Dầu'
  if (lower.includes('điện') || lower.includes('electric') || lower.includes('ev')) return 'Điện'
  if (lower.includes('hybrid') || lower.includes('hev')) return 'Hybrid'
  return s.trim()
}

/**
 * Tách model + variant từ title (sau khi đã lấy brand và year).
 * VD: "Honda City 2023 RS" → model: "City", variant: "RS".
 */
function splitModelVariant(
  title: string,
  brand: string,
  year?: number
): { model: string; variant?: string } {
  let t = title.trim()
  const brandNorm = normalizeBrand(brand)
  t = t.replace(new RegExp(`^${escapeRe(brandNorm)}\\s*`, 'i'), '')
  if (year) t = t.replace(new RegExp(`\\s*${year}\\s*`, 'g'), ' ').trim()
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return { model: parts[0] || 'Unknown' }
  const model = parts[0]!
  const variant = parts.slice(1).join(' ') || undefined
  return { model, variant: variant || undefined }
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Normalize RawBonbanhListing → CrawlVehicle.
 */
export function normalizeBonbanh(raw: RawBonbanhListing): CrawlVehicle {
  const brand = extractBrandFromTitle(raw.title)
  const { model, variant } = splitModelVariant(raw.title, brand, raw.year)
  const year = raw.year ?? new Date().getFullYear()
  if (year < 1990 || year > 2030) {
    throw new Error(`Invalid year from listing: ${raw.title}`)
  }
  return {
    source: 'bonbanh',
    sourceUrl: raw.sourceUrl,
    brand,
    model,
    variant: variant || undefined,
    year,
    mileage: parseMileage(raw.mileageText),
    color: raw.color?.trim() || undefined,
    transmission: normalizeTransmission(raw.transmission),
    fuelType: normalizeFuelType(raw.fuelType),
    price: parsePriceVnd(raw.priceText),
    description: raw.description?.trim() || undefined,
    imageUrls: raw.imageUrls || [],
  }
}
