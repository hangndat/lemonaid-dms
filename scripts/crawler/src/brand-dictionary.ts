/**
 * Chuẩn hóa tên hãng xe: alias → tên chuẩn (dùng cho Vehicle.brand).
 * Cập nhật thêm khi gặp tên mới từ crawl.
 */
export const BRAND_ALIASES: Record<string, string> = {
  honda: 'Honda',
  toyota: 'Toyota',
  mazda: 'Mazda',
  hyundai: 'Hyundai',
  kia: 'Kia',
  ford: 'Ford',
  mitsubishi: 'Mitsubishi',
  nissan: 'Nissan',
  vinfast: 'VinFast',
  vinastar: 'VinFast',
  'vin fast': 'VinFast',
  'vin-fast': 'VinFast',
  bmw: 'BMW',
  mercedes: 'Mercedes-Benz',
  'mercedes-benz': 'Mercedes-Benz',
  mercedes_benz: 'Mercedes-Benz',
  audi: 'Audi',
  porsche: 'Porsche',
  lexus: 'Lexus',
  volkswagen: 'Volkswagen',
  vw: 'Volkswagen',
  chevrolet: 'Chevrolet',
  chevy: 'Chevrolet',
  isuzu: 'Isuzu',
  suzuki: 'Suzuki',
  peugeot: 'Peugeot',
  land: 'Land Rover',
  'land rover': 'Land Rover',
  range: 'Land Rover',
  'range rover': 'Range Rover',
  jaguar: 'Jaguar',
  volvo: 'Volvo',
  mini: 'MINI',
  bentley: 'Bentley',
  rolls: 'Rolls-Royce',
  'rolls-royce': 'Rolls-Royce',
  maserati: 'Maserati',
  ferrari: 'Ferrari',
  lamborghini: 'Lamborghini',
  acura: 'Acura',
  infiniti: 'Infiniti',
  genesis: 'Genesis',
  mg: 'MG',
  jac: 'JAC',
  fiat: 'Fiat',
  jeep: 'Jeep',
  hino: 'Hino',
  tải: '',
}

export function normalizeBrand(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  return BRAND_ALIASES[key] ?? raw.trim()
}

/**
 * Tách brand từ title (vd: "Honda City 2023 RS" → brand: Honda).
 */
export function extractBrandFromTitle(title: string): string {
  const words = title.trim().split(/\s+/)
  for (let i = 1; i <= words.length; i++) {
    const candidate = words.slice(0, i).join(' ').trim()
    const key = candidate.toLowerCase().replace(/\s+/g, ' ')
    if (BRAND_ALIASES[key]) return BRAND_ALIASES[key]
  }
  return words[0] || 'Unknown'
}
