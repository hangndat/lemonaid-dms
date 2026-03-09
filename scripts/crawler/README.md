# Crawler Bonbanh (Node/TS)

Crawl tin rao xe từ Bonbanh.com, chuẩn hóa và import vào DMS (seed).

## Cài đặt

```bash
cd scripts/crawler && npm install
```

## Chạy

- **Crawl (thu thập dữ liệu):**
  ```bash
  npm run crawl
  ```
  Kết quả: `output/raw/bonbanh_raw_*.json`, `output/crawled-vehicles.json`.

- **Dry run (không ghi file):**
  ```bash
  npm run crawl:dry
  ```

- **Import vào seed DMS:**
  Sau khi đã chạy `npm run crawl`, chạy:
  ```bash
  npm run import
  ```
  Script sẽ đọc `output/crawled-vehicles.json` và **thêm** xe vào `src/data/seed/vehicles.seed.json` và `src/data/seed/vehicle_photos.seed.json`. Xe import có `status: 'draft'`.

## Cấu hình

- Số trang list, số tin/trang, delay: sửa trong `src/index.ts` (`MAX_LIST_PAGES`, `MAX_DETAIL_PER_PAGE`, `DELAY_MS`).
- Selector Bonbanh: sửa `src/selectors-bonbanh.ts` sau khi inspect HTML thực tế (F12).
- Brand/alias: thêm trong `src/brand-dictionary.ts`.

## Lưu ý

- Tôn trọng **robots.txt** và **ToS** của Bonbanh; dùng rate limit, không crawl quá tải.
- Selector có thể thay đổi khi site đổi giao diện — cập nhật `src/selectors-bonbanh.ts`. Nếu kết quả detail toàn "Thông báo !", mở trang list/detail bằng F12 → Elements để lấy đúng selector và đường dẫn tin rao.
