/**
 * Raw data từ crawl (trước khi normalize).
 * Cấu trúc phụ thuộc parser từng nguồn.
 */
export interface RawBonbanhListing {
  source: 'bonbanh'
  sourceUrl: string
  title: string
  priceText?: string
  year?: number
  mileageText?: string
  color?: string
  transmission?: string
  fuelType?: string
  description?: string
  imageUrls: string[]
  /** Raw HTML hoặc text đặc tả (để parse thêm nếu cần) */
  rawSpecs?: Record<string, string>
}

/**
 * Dữ liệu xe đã chuẩn hóa, sẵn sàng map sang Vehicle của DMS.
 */
export interface CrawlVehicle {
  source: 'bonbanh'
  sourceUrl: string
  brand: string
  model: string
  variant?: string
  year: number
  mileage?: number
  color?: string
  transmission?: string
  fuelType?: string
  price?: number
  description?: string
  imageUrls: string[]
}

export interface CrawlConfig {
  baseUrl: string
  listPath: string
  maxPages: number
  delayMs: number
  userAgent: string
}
