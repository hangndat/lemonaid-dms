import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { fetchHtml, delay } from './fetcher.js'
import { parseListPage, parseDetailPage } from './parser-bonbanh.js'
import { normalizeBonbanh } from './normalizer.js'
import { validate, dedupCrawlVehicles } from './validator.js'
import type { RawBonbanhListing, CrawlVehicle } from './types.js'

const BONBANH_LIST_URL = 'https://www.bonbanh.com/oto/'
const OUTPUT_DIR = join(process.cwd(), 'output')
const RAW_DIR = join(OUTPUT_DIR, 'raw')
const DRY_RUN = process.argv.includes('--dry')
const MAX_LIST_PAGES = 2
const MAX_DETAIL_PER_PAGE = 10
const DELAY_MS = 1500

async function main() {
  await mkdir(RAW_DIR, { recursive: true })

  console.log('Crawl Bonbanh — list URL:', BONBANH_LIST_URL)
  if (DRY_RUN) console.log('(DRY RUN: không ghi file)')

  const detailUrls: string[] = []
  for (let page = 1; page <= MAX_LIST_PAGES; page++) {
    const listUrl = page === 1 ? BONBANH_LIST_URL : `${BONBANH_LIST_URL}?page=${page}`
    try {
      const html = await fetchHtml(listUrl)
      const urls = parseListPage(html, listUrl)
      detailUrls.push(...urls.slice(0, MAX_DETAIL_PER_PAGE))
      console.log(`Page ${page}: ${urls.length} links (lấy ${Math.min(urls.length, MAX_DETAIL_PER_PAGE)})`)
      await delay(DELAY_MS)
    } catch (e) {
      console.warn('List page error', listUrl, e)
    }
  }

  const uniqueUrls = [...new Set(detailUrls)]
  console.log('Tổng URL chi tiết (sau dedup):', uniqueUrls.length)

  const rawListings: RawBonbanhListing[] = []
  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i]!
    try {
      const html = await fetchHtml(url)
      const listing = parseDetailPage(html, url)
      if (listing) {
        rawListings.push(listing)
        console.log(`[${i + 1}/${uniqueUrls.length}] ${listing.title.slice(0, 50)}...`)
      }
      await delay(DELAY_MS)
    } catch (e) {
      console.warn('Detail error', url, e)
    }
  }

  const normalized: CrawlVehicle[] = []
  for (const raw of rawListings) {
    try {
      const car = normalizeBonbanh(raw)
      const result = validate(car)
      if (result.valid) {
        normalized.push(car)
      } else {
        console.warn('Skip (validation):', raw.title, result.errors)
      }
    } catch (e) {
      console.warn('Normalize error:', raw.title, e)
    }
  }

  const deduped = dedupCrawlVehicles(normalized)
  console.log('Sau normalize + validate + dedup:', deduped.length, 'xe')

  if (!DRY_RUN && (rawListings.length > 0 || deduped.length > 0)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    await writeFile(
      join(RAW_DIR, `bonbanh_raw_${timestamp}.json`),
      JSON.stringify(rawListings, null, 2),
      'utf-8'
    )
    await writeFile(
      join(OUTPUT_DIR, 'crawled-vehicles.json'),
      JSON.stringify(deduped, null, 2),
      'utf-8'
    )
    console.log('Đã ghi: output/raw/bonbanh_raw_*.json, output/crawled-vehicles.json')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
