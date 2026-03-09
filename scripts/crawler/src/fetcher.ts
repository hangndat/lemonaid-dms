import axios from 'axios'

const defaultUserAgent =
  'LemonaidDMS-Crawler/1.0 (Contact: internal-use; https://github.com/lemonaid-dms)'

export async function fetchHtml(
  url: string,
  options: { userAgent?: string; timeoutMs?: number } = {}
): Promise<string> {
  const { userAgent = defaultUserAgent, timeoutMs = 15000 } = options
  const res = await axios.get<string>(url, {
    headers: {
      'User-Agent': userAgent,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
    },
    timeout: timeoutMs,
    responseType: 'text',
    maxRedirects: 3,
    validateStatus: (s) => s >= 200 && s < 400,
  })
  return res.data
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
