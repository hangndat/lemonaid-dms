/**
 * Brands and models popular in Singapore / Thailand market.
 * Format: { brand, model, variants?, minPriceThb, maxPriceThb }.
 */
export const BRANDS_MODELS: Array<{
  brand: string
  model: string
  variants?: string[]
  minPriceThb: number
  maxPriceThb: number
}> = [
  { brand: 'Toyota', model: 'Vios', variants: ['G', 'E', 'S'], minPriceThb: 550_000, maxPriceThb: 750_000 },
  { brand: 'Toyota', model: 'Camry', variants: ['2.0', '2.5 Hybrid'], minPriceThb: 1_200_000, maxPriceThb: 1_600_000 },
  { brand: 'Toyota', model: 'Fortuner', variants: ['2.4', '2.8 Legender'], minPriceThb: 1_400_000, maxPriceThb: 2_000_000 },
  { brand: 'Toyota', model: 'Hilux', variants: ['2.4', '2.8'], minPriceThb: 900_000, maxPriceThb: 1_400_000 },
  { brand: 'Honda', model: 'City', variants: ['RS', 'V', 'SV'], minPriceThb: 600_000, maxPriceThb: 800_000 },
  { brand: 'Honda', model: 'Civic', variants: ['1.5T', 'RS'], minPriceThb: 1_100_000, maxPriceThb: 1_500_000 },
  { brand: 'Honda', model: 'HR-V', variants: ['RS', 'E'], minPriceThb: 1_000_000, maxPriceThb: 1_300_000 },
  { brand: 'Honda', model: 'CR-V', variants: ['2.0', '1.5T'], minPriceThb: 1_300_000, maxPriceThb: 1_800_000 },
  { brand: 'Mazda', model: '3', variants: ['2.0', 'Skyactiv'], minPriceThb: 1_000_000, maxPriceThb: 1_400_000 },
  { brand: 'Mazda', model: 'CX-5', variants: ['2.0', '2.0 Luxury', '2.5'], minPriceThb: 1_200_000, maxPriceThb: 1_700_000 },
  { brand: 'Hyundai', model: 'Kona', variants: ['2.0', 'N Line'], minPriceThb: 850_000, maxPriceThb: 1_200_000 },
  { brand: 'Hyundai', model: 'Tucson', variants: ['2.0', '1.6T'], minPriceThb: 1_100_000, maxPriceThb: 1_500_000 },
  { brand: 'Kia', model: 'Seltos', variants: ['2.0', 'Premium'], minPriceThb: 900_000, maxPriceThb: 1_250_000 },
  { brand: 'Kia', model: 'Sportage', variants: ['2.0', 'GT Line'], minPriceThb: 1_200_000, maxPriceThb: 1_600_000 },
  { brand: 'Nissan', model: 'Kicks', variants: ['E', 'VL'], minPriceThb: 750_000, maxPriceThb: 950_000 },
  { brand: 'Nissan', model: 'X-Trail', variants: ['2.0', '2.5'], minPriceThb: 1_200_000, maxPriceThb: 1_600_000 },
  { brand: 'Mitsubishi', model: 'Xpander', variants: ['Standard', 'Sport'], minPriceThb: 700_000, maxPriceThb: 900_000 },
  { brand: 'Mitsubishi', model: 'Triton', variants: ['2.4', 'Athlete'], minPriceThb: 800_000, maxPriceThb: 1_300_000 },
  { brand: 'Ford', model: 'Ranger', variants: ['2.0', 'Wildtrak'], minPriceThb: 900_000, maxPriceThb: 1_500_000 },
  { brand: 'Ford', model: 'Everest', variants: ['2.0', 'Titanium'], minPriceThb: 1_400_000, maxPriceThb: 2_000_000 },
  { brand: 'BMW', model: '3 Series', variants: ['320i', '330i'], minPriceThb: 2_000_000, maxPriceThb: 2_800_000 },
  { brand: 'Mercedes-Benz', model: 'C-Class', variants: ['C200', 'C300'], minPriceThb: 2_200_000, maxPriceThb: 2_800_000 },
  { brand: 'Lexus', model: 'ES', variants: ['250', '300h'], minPriceThb: 2_000_000, maxPriceThb: 2_600_000 },
]

export const COLORS = [
  'White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Brown', 'Pearl White',
  'Dark Blue', 'Silver Grey', 'Black Mica',
]

export const TRANSMISSIONS = ['CVT', 'Automatic', 'DCT', 'Dual-clutch', 'Manual']

export const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Plug-in Hybrid']
