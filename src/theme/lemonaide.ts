/**
 * Lemonaide brand theme — colors & assets from https://lemonaide.co.th/
 */
export const LEMONAIDE = {
  /** Logo (local asset; always loads) */
  logoUrl: '/logo.svg',
  /** Primary brand — lemon yellow / gold */
  colorPrimary: '#E8B923',
  /** Primary hover */
  colorPrimaryHover: '#D4A61C',
  /** Secondary — green accent */
  colorSecondary: '#2D6A4F',
  /** Sidebar nền tối, dễ đọc */
  siderBg: '#1a1d21',
  /** Chữ menu sidebar (chưa chọn) */
  siderText: 'rgba(255, 255, 255, 0.92)',
  /** Nền item đang chọn (accent vàng nhẹ) */
  siderSelectedBg: 'rgba(232, 185, 35, 0.22)',
  /** Chữ item đang chọn */
  siderSelectedText: '#fff',
  /** Content background */
  contentBg: '#F0F2F5',
  /** Font family — Plus Jakarta Sans (headings/UI), Sarabun (Thai support) */
  fontFamily: "'Plus Jakarta Sans', 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const
