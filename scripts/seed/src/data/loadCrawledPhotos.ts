/**
 * Đọc ảnh xe thật từ output của module crawl (scripts/crawler/output/crawled-vehicles.json).
 * Dùng cho seed vehicle_photos thay vì picsum.
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED_ROOT = join(__dirname, '../..')
const CRAWL_OUTPUT = join(SEED_ROOT, '..', 'crawler', 'output', 'crawled-vehicles.json')

interface CrawledItem {
  imageUrls?: string[]
  brand?: string
  model?: string
  year?: number
}

/**
 * Lấy danh sách URL ảnh từ crawl (chỉ lấy size m_ của bonbanh để tránh trùng m/s).
 * Trả về [] nếu không có file hoặc không parse được.
 */
export function loadCrawledImagePool(): string[] {
  if (!existsSync(CRAWL_OUTPUT)) return []
  try {
    const raw = readFileSync(CRAWL_OUTPUT, 'utf-8')
    const items = JSON.parse(raw) as CrawledItem[]
    const urls: string[] = []
    for (const item of items) {
      const list = (item.imageUrls ?? []).filter((u): u is string => !!u && typeof u === 'string')
      const medium = list.filter((u) => u.includes('/m_'))
      if (medium.length) urls.push(...medium)
      else urls.push(...list)
    }
    return urls
  } catch {
    return []
  }
}
