import * as cheerio from 'cheerio'
import type { RawBonbanhListing } from './types.js'
import { BONBANH_SELECTORS } from './selectors-bonbanh.js'
import { normalizeBrand } from './brand-dictionary.js'

const BONBANH_BASE = 'https://www.bonbanh.com'

/** Slug Bonbanh: /xe-{brand}-{model}-{variant?}-{year}-{id} → dùng khi trang trả về "Thông báo !" */
export function parseBonbanhSlug(url: string): { brand: string; model: string; variant?: string; year?: number } | null {
  try {
    const path = new URL(url).pathname
    const match = path.match(/\/xe-(.+)-(\d{4})-(\d+)$/)
    if (!match) return null
    const rest = match[1]!
    const year = parseInt(match[2], 10)
    if (year < 1990 || year > 2030) return null
    const parts = rest.split('-').filter(Boolean)
    if (parts.length < 2) return null
    const brandKey = parts[0]!.replace(/_/g, ' ')
    const brand = normalizeBrand(brandKey)
    const model = parts[1]!.replace(/_/g, ' ')
    const variant = parts.length > 2 ? parts.slice(2).join(' ').replace(/_/g, ' ') : undefined
    return { brand, model, variant: variant || undefined, year }
  } catch {
    return null
  }
}

function resolveUrl(href: string): string {
  if (href.startsWith('http')) return href
  const base = BONBANH_BASE.endsWith('/') ? BONBANH_BASE : BONBANH_BASE + '/'
  return href.startsWith('/') ? new URL(href, base).href : new URL(base + href).href
}

function parsePriceText(text: string): string | undefined {
  const t = text.replace(/\s/g, '')
  if (!t) return undefined
  return t
}

function parseYearFromTitle(title: string): number | undefined {
  const m = title.match(/\b(20\d{2}|19\d{2})\b/)
  return m ? parseInt(m[1], 10) : undefined
}

function parseMileageText(text: string): number | undefined {
  const t = text.replace(/\s/g, '').replace(/\./g, '').replace(/km/gi, '')
  const n = parseInt(t, 10)
  return Number.isNaN(n) ? undefined : n
}

/**
 * Parse trang danh sách Bonbanh → danh sách URL trang chi tiết.
 */
export function parseListPage(html: string, listPageUrl: string): string[] {
  const $ = cheerio.load(html)
  const urls: string[] = []
  const seen = new Set<string>()

  $(BONBANH_SELECTORS.listItem).each((_, el) => {
    const $el = $(el)
    const link =
      $el.find(BONBANH_SELECTORS.listItemLink).attr('href') || $el.find('a').first().attr('href')
    if (link) {
      const full = resolveUrl(link)
      if (!seen.has(full)) {
        seen.add(full)
        urls.push(full)
      }
    }
  })

  if (urls.length === 0) {
    $('a[href*="/xe-"], a[href*="/oto/"]').each((_, el) => {
      const href = $(el).attr('href')
      if (href && !href.includes('/oto?') && !href.includes('/oto/?')) {
        const full = resolveUrl(href)
        if (!seen.has(full)) {
          seen.add(full)
          urls.push(full)
        }
      }
    })
  }

  return urls
}

/**
 * Parse trang chi tiết một xe → RawBonbanhListing.
 */
export function parseDetailPage(html: string, detailUrl: string): RawBonbanhListing | null {
  const $ = cheerio.load(html)
  const title =
    $(BONBANH_SELECTORS.detailTitle).first().text().trim() ||
    $('h1').first().text().trim() ||
    $('title').text().trim()
  if (!title) return null

  const priceEl = $(BONBANH_SELECTORS.detailPrice).first()
  const priceText = parsePriceText(priceEl.text()) || undefined

  const rawSpecs: Record<string, string> = {}
  $(BONBANH_SELECTORS.detailSpecs).each((i, el) => {
    const key = $(el).text().trim().toLowerCase().replace(/\s+/g, ' ')
    const valueEl = $(el).next()
    const value = valueEl.length ? valueEl.text().trim() : $(el).parent().find('td').eq(1).text().trim()
    if (key && value) rawSpecs[key] = value
  })
  $('table tr').each((_, row) => {
    const th = $(row).find('th').text().trim().toLowerCase().replace(/\s+/g, ' ')
    const td = $(row).find('td').text().trim()
    if (th && td) rawSpecs[th] = td
  })

  const year = parseYearFromTitle(title) || parseYearFromSpecs(rawSpecs)
  const mileageText = rawSpecs['số km'] || rawSpecs['số km đã chạy'] || rawSpecs['km'] || rawSpecs['mileage']
  const color = rawSpecs['màu'] || rawSpecs['màu xe'] || rawSpecs['color']
  const transmission =
    rawSpecs['hộp số'] || rawSpecs['transmission'] || rawSpecs['số']
  const fuelType =
    rawSpecs['nhiên liệu'] || rawSpecs['động cơ'] || rawSpecs['fuel'] || rawSpecs['fueltype']

  const description =
    $(BONBANH_SELECTORS.detailDescription).first().text().trim() ||
    $('.content').first().text().trim() ||
    ''

  const imageUrls: string[] = []
  $(BONBANH_SELECTORS.detailImages).each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src')
    if (src) {
      const full = resolveUrl(src)
      if (!imageUrls.includes(full)) imageUrls.push(full)
    }
  })

  const isNotificationPage =
    /thông\s*báo\s*!?/i.test(title) || title.trim().length < 5 || description === '×\n    ...'
  let finalTitle = title
  let finalYear = year
  if (isNotificationPage) {
    const slug = parseBonbanhSlug(detailUrl)
    if (slug) {
      finalTitle = [slug.brand, slug.model, slug.variant, slug.year].filter(Boolean).join(' ')
      finalYear = slug.year
    }
  }

  return {
    source: 'bonbanh',
    sourceUrl: detailUrl,
    title: finalTitle,
    priceText,
    year: finalYear,
    mileageText,
    color,
    transmission,
    fuelType,
    description: description && !isNotificationPage ? description : undefined,
    imageUrls,
    rawSpecs: Object.keys(rawSpecs).length ? rawSpecs : undefined,
  }
}

function parseYearFromSpecs(specs: Record<string, string>): number | undefined {
  const keys = ['năm sản xuất', 'năm', 'year', 'năm sản xuất/xăm đăng ký']
  for (const k of keys) {
    const v = specs[k]
    if (v) {
      const n = parseInt(v.replace(/\D/g, '').slice(0, 4), 10)
      if (n >= 1990 && n <= 2030) return n
    }
  }
  return undefined
}
