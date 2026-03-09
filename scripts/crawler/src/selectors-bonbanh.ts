/**
 * Selectors cho Bonbanh.com.
 * Cập nhật sau khi inspect HTML thực tế (F12 → Elements).
 * Nguồn: https://www.bonbanh.com/oto/
 */
export const BONBANH_SELECTORS = {
  /** Trang danh sách: container mỗi tin */
  listItem: '.car-item, .item-car, .listing-item, [class*="car-item"], [class*="item-car"]',
  /** Link đến trang chi tiết */
  listItemLink: 'a[href*="/xe-"], a[href*="/oto/"]',
  /** Trang danh sách: phân trang (để lấy max page) */
  pagination: '.pagination, .page-numbers, [class*="pagination"]',

  /** Trang chi tiết */
  detailTitle: 'h1, .title-detail, .car-title, [class*="title"]',
  detailPrice: '.price, .gia, [class*="price"], [class*="gia"]',
  detailSpecs: 'table th, .specs dt, [class*="spec"] th',
  detailSpecsValues: 'table td, .specs dd, [class*="spec"] td',
  detailDescription: '.content, .description, .mota, [class*="content"], [class*="mota"]',
  detailImages: '.gallery img, .slideshow img, [class*="gallery"] img, [class*="slide"] img',
} as const
