# Kế hoạch crawl dữ liệu xe từ internet

Tài liệu này mô tả plan để bổ sung kho xe (inventory) bằng cách thu thập dữ liệu từ các nguồn công khai trên internet, đồng thời map vào cấu trúc `Vehicle` của DMS.

---

## 1. Mục tiêu

- Tăng số lượng xe trong kho (hiện đang dùng mock/seed, ít mẫu).
- Thu thập dữ liệu xe **hợp pháp**, có kiểm soát, phù hợp Terms of Service của nguồn.
- Dữ liệu crawl được **chuẩn hóa** và import vào DMS dưới dạng **draft** để team review trước khi publish.

---

## 2. Cấu trúc Vehicle cần map

Các field trong `Vehicle` (xem `src/types/index.ts`) cần được điền từ dữ liệu crawl:

| Field          | Bắt buộc | Ghi chú crawl |
|----------------|----------|----------------|
| `id`           | ✓        | Generate (UUID) khi import |
| `vin`          |          | Có thể có từ listing, không bắt buộc |
| `brand`        | ✓        | Chuẩn hóa tên hãng (Honda, Toyota, …) |
| `model`        | ✓        | Tên dòng xe |
| `variant`      |          | Phiên bản (RS, G, Luxury…) |
| `year`         | ✓        | Năm sản xuất (number) |
| `mileage`      |          | Số km (parse từ text "15.000 km") |
| `color`        |          | Màu xe |
| `transmission` |          | Số (CVT, MT, AT, DCT…) |
| `fuelType`     |          | Xăng/Dầu/Điện… |
| `price`        |          | Giá (VNĐ), chuẩn hóa từ text |
| `description`  |          | Mô tả gốc hoặc tóm tắt |
| `status`       | ✓        | Luôn `draft` khi import từ crawl |
| `createdAt` / `updatedAt` | ✓ | Thời điểm import |

**Không crawl:** `cost`, `stockInDate`, `createdBy` — điền sau khi team xác nhận/xe nhập kho.

---

## 3. Nguồn dữ liệu đề xuất

### Ưu tiên (công khai, có cấu trúc, phù hợp thị trường VN)

| Nguồn | Mô tả | Độ khó | Lưu ý |
|-------|--------|--------|--------|
| **Chợ Tốt (chợ tốt xe)** | Listing xe ô tô, có filter theo hãng/giá/năm | Trung bình | Cần kiểm tra ToS, tránh crawl quá tải; dùng API nếu có |
| **Bonbanh.com** | Chuyên xe đã qua sử dụng | Trung bình | HTML cấu trúc rõ, nhiều thông số |
| **Carmudi / Oto.com.vn** | Tin rao xe | Trung bình | Tương tự Chợ Tốt |
| **Facebook Marketplace** | Nhiều tin rao xe | Cao | Cần login, anti-bot; ưu tiên thấp hoặc dùng official API nếu có |

### Nguồn bổ sung (reference, ít dùng để crawl trực tiếp)

- **Các site hãng (Honda, Toyota, Hyundai…):** catalog xe mới, dùng để chuẩn hóa `brand`/`model`/`variant`.
- **RSS / sitemap:** nếu nguồn cung cấp, ưu tiên dùng thay vì crawl toàn trang.

---

## 4. Kiến trúc crawl (high-level)

```
[ Nguồn: Chợ Tốt / Bonbanh / ... ]
           │
           ▼
┌──────────────────────┐
│   Crawler / Fetcher  │  (Node hoặc Python, theo sở trường team)
│   - Rate limit       │
│   - Retry, timeout   │
│   - User-Agent rõ ràng
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Parser / Scraper   │  Extract: title, price, year, mileage, description, images
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Normalizer         │  Map → Vehicle: brand, model, year, mileage, price, ...
│   - Brand dictionary │  Chuẩn hóa đơn vị (km, VNĐ), parse số
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Validator          │  Đảm bảo bắt buộc: brand, model, year; loại bỏ trùng (vin/url)
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Import vào DMS     │  Tạo bản ghi Vehicle status = 'draft', không set cost/stockInDate
│   (API hoặc repo)    │  Ảnh: lưu URL hoặc download rồi lưu VehiclePhoto
└──────────────────────┘
```

---

## 5. Công nghệ đề xuất

| Thành phần | Gợi ý | Lý do |
|------------|--------|--------|
| **Ngôn ngữ** | Node (TS) hoặc Python | Node dễ tích hợp với codebase DMS hiện tại; Python phù hợp nếu dùng Scrapy/Beautiful Soup |
| **HTTP** | axios / node-fetch (Node) hoặc requests/httpx (Python) | Đơn giản, dễ thêm retry & rate limit |
| **Parse HTML** | cheerio (Node) hoặc Beautiful Soup (Python) | Parse DOM, extract text theo selector |
| **Chạy** | Script CLI hoặc job định kỳ (cron) | Không chạy trong browser; có thể gọi từ CI hoặc server nội bộ |
| **Lưu tạm** | File JSON/CSV hoặc SQLite | Trước khi import vào DMS (mock hoặc backend thật) |

**Lưu ý:** Tránh headless browser (Puppeteer/Playwright) cho listing đơn giản để giảm tải và tránh bị chặn; chỉ dùng khi trang load nội dung bằng JS.

---

## 6. Quy trình thực hiện từng bước

### Phase 1: Chuẩn bị (1–2 ngày)

1. **Chọn 1 nguồn** (ví dụ Chợ Tốt hoặc Bonbanh) và đọc ToS/robots.txt.
2. **Thiết kế URL list:** trang danh sách theo hãng/giá/năm (ví dụ 5–10 trang đầu).
3. **Tạo project crawler:** repo riêng hoặc folder `scripts/crawler` trong DMS, với dependency (cheerio/axios hoặc tương đương).
4. **Chuẩn hóa brand:** file dictionary `brand → [alias]` (vd: "Honda", "honda", "HONDA" → "Honda") để map vào `Vehicle.brand`.

### Phase 2: Crawl & Parse (2–3 ngày)

5. **Fetcher:** request HTML với rate limit (vd: 1 req/s), User-Agent rõ ràng (tên app + contact).
6. **Parser:** extract từ listing:
   - Tiêu đề → tách brand, model, variant (regex hoặc rule).
   - Giá → parse VNĐ (triệu/ tỷ).
   - Năm, số km, màu, hộp số, nhiên liệu → từ mô tả hoặc spec box.
7. **Lưu raw:** JSON theo từng nguồn (vd: `raw_chotot_20250309.json`) để debug và tránh crawl lại.

### Phase 3: Normalize & Validate (1–2 ngày)

8. **Normalizer:** map field nguồn → `Vehicle` (brand dictionary, parse number, default `status: 'draft'`).
9. **Validator:** bỏ bản ghi thiếu `brand`/`model`/`year`; dedup theo (vin) hoặc (brand, model, year, mileage, price).
10. **Output:** file JSON/CSV chuẩn Vehicle (có thể thêm field `source`, `sourceUrl` để trace).

### Phase 4: Import vào DMS (1 ngày)

11. **Import script:** đọc file đã chuẩn hóa, gọi `vehiclesRepo.create()` (hoặc API backend) với từng xe; ảnh có thể import qua `vehiclesRepo.addPhoto()` nếu có URL.
12. **Quy ước:** tất cả xe crawl đều `status: 'draft'`, không set `cost`/`stockInDate`; `createdBy` có thể là system user hoặc admin.

### Phase 5: Vận hành & bảo trì

13. **Chạy định kỳ (tùy chọn):** cron 1 lần/tuần, giới hạn số lượng (vd: 50–100 tin/lần).
14. **Theo dõi:** log lỗi, số bản ghi import, nguồn; cập nhật parser khi site đổi layout.
15. **Tuân thủ:** tôn trọng robots.txt và ToS; nếu nguồn có API chính thức thì chuyển sang API.

---

## 7. Rủi ro & lưu ý pháp lý

| Rủi ro | Cách giảm thiểu |
|--------|------------------|
| Vi phạm ToS của website | Đọc kỹ ToS và robots.txt; rate limit; chỉ lấy dữ liệu công khai; ưu tiên API nếu có |
| Dữ liệu trùng / sai | Dedup, validation; import dạng draft để con người duyệt |
| Site chặn IP / block | User-Agent rõ ràng, không ẩn danh; giới hạn tần suất; không DDoS |
| Thay đổi cấu trúc HTML | Parser tách module, test với sample HTML; lưu raw để chỉnh lại parser |
| Bản quyền ảnh | Lưu URL tham chiếu hoặc chỉ dùng ảnh khi có quyền; không re-host ảnh bừa bãi |

**Khuyến nghị:** Chỉ dùng dữ liệu cho mục đích nội bộ (kho tham khảo, draft); không re-publish nguyên bản tin rao của bên thứ ba mà không có thỏa thuận.

---

## 8. Deliverables đề xuất

- [ ] Doc này (plan) — **xong**
- [ ] Repo/folder crawler + README (cách chạy, env)
- [ ] Fetcher + Parser cho 1 nguồn (vd: Bonbanh hoặc Chợ Tốt)
- [ ] Normalizer + Validator map sang `Vehicle`
- [ ] Script import vào DMS (gọi repo hoặc API)
- [ ] File dictionary brand/alias
- [ ] (Tùy chọn) CI job hoặc cron chạy crawl giới hạn

---

## 9. Bước tiếp theo

1. ~~**Xác nhận nguồn:** Chọn Bonbanh, Node/TS.~~
2. ~~**Tạo folder script:** `scripts/crawler` với package.json, tsconfig.~~
3. ~~**Implement Fetcher + Parser** cho Bonbanh, output raw JSON + `output/crawled-vehicles.json`.~~
4. ~~**Normalizer/Validator** và script **import** vào seed DMS.~~

**Đã có:** Skeleton crawler Bonbanh tại `scripts/crawler` (xem `scripts/crawler/README.md`). Chạy từ repo gốc: `npm run crawl`, `npm run crawl:import`.

**Còn lại:** Inspect HTML thực tế Bonbanh (F12) để cập nhật `scripts/crawler/src/selectors-bonbanh.ts` nếu list/detail trả về trang khác (vd. Thông báo/captcha).
