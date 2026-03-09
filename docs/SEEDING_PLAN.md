# Kế hoạch module Seeding Data — 1 năm giả lập (Singapore Dealers → Thái Lan)

## 1. Bối cảnh nghiệp vụ

- **Mô hình:** Công ty DMS đang vận hành thật khoảng **1 năm**.
- **Khách hàng (Customer):** Các **dealer xe ở Singapore** — mua/xuất xe từ Singapore vào thị trường **Thái Lan** (B2B hoặc B2B2C).
- **Dữ liệu:** Giả lập đủ lượng khách (dealers), xe (inventory), lead, deal và hoạt động trong khoảng **12 tháng** (từ ~tháng 3/2024 đến ~tháng 3/2025) để dashboard và báo cáo trông “thật”.

---

## 2. Phạm vi entity và thứ tự sinh dữ liệu

Thứ tự sinh phải đảm bảo **foreign key** và **timeline hợp lý**:

| Bước | Entity | Mô tả ngắn |
|------|--------|------------|
| 1 | **Profiles** | Nhân sự (admin, manager, sales) — có thể giữ/điều chỉnh tên theo SG/TH. |
| 2 | **Customers** | Danh sách dealer Singapore (tên công ty / người liên hệ, SĐT +65, email). |
| 3 | **Vehicles** | Kho xe: brand/model phổ biến SG/TH, giá **THB**, ngày nhập kho rải đều trong 12 tháng. |
| 4 | **VehiclePhotos** | Ảnh mẫu theo vehicle (URL placeholder hoặc picsum). |
| 5 | **VehiclePriceHistory** | Lịch sử giá khi tạo xe / khi “đổi giá” một số xe. |
| 6 | **Leads** | Lead từ dealer: source (website, marketplace, hotline, walk_in, facebook), status, gắn customerId, interestedVehicleId, assignedTo, created trong 12 tháng. |
| 7 | **LeadActivities** | Ghi chú / call / status_change theo lead. |
| 8 | **Deals** | Deal từ lead: stage (lead → test_drive → negotiation → loan_processing → closed_won/closed_lost), expectedPrice/finalPrice **THB**, expectedCloseDate, lostReason (nếu lost). |
| 9 | **DealActivities** | note / stage_change theo deal. |

Ràng buộc cần giữ:

- `Lead.customerId` ∈ Customers, `interestedVehicleId` ∈ Vehicles, `assignedTo` ∈ Profiles.
- `Deal.leadId` ∈ Leads, `vehicleId` ∈ Vehicles, `customerId` ∈ Customers, `assignedTo` ∈ Profiles.
- `createdAt`/`updatedAt` và các ngày (stockInDate, expectedCloseDate) nằm trong khoảng **1 năm** giả lập.

---

## 3. Ước lượng volume (1 năm vận hành)

| Entity | Số lượng ước lượng | Ghi chú |
|--------|--------------------|---------|
| Profiles | 4–6 | 1 admin, 1 manager, 2–4 sales. |
| Customers | 80–150 | Dealer Singapore (công ty / showroom). |
| Vehicles | 120–250 | Trạng thái: draft, available, reserved, sold; nhiều sold trong 12 tháng. |
| VehiclePhotos | 2–5 ảnh/xe | Một phần xe có ảnh. |
| VehiclePriceHistory | 1–3 record/xe (một phần) | Khi tạo giá hoặc “điều chỉnh giá”. |
| Leads | 250–450 | Rải đều theo tháng, ~20–40 lead/tháng. |
| LeadActivities | 400–800 | Trung bình 1–2 activity/lead. |
| Deals | 150–280 | ~60–70% lead chuyển deal, phần còn lại chỉ lead. |
| DealActivities | 300–550 | note + stage_change. |

Có thể bắt đầu với **kích thước nhỏ** (ví dụ 50 customers, 80 vehicles, 120 leads, 80 deals) rồi tăng dần để cân bằng giữa “đủ thật” và tốc độ load.

---

## 4. Nội dung dữ liệu theo ngữ cảnh Singapore → Thái Lan

### 4.1 Profiles

- Giữ cấu trúc hiện tại (id, fullName, email, role).
- Có thể đổi tên/email sang **tiếng Anh hoặc Singapore-style** (ví dụ: "James Tan", "admin@company.sg") để đồng bộ với khách hàng là dealer Singapore.

### 4.2 Customers (Dealer Singapore)

- **Tên:** Tên công ty / showroom kiểu Singapore, ví dụ:
  - "Auto Haven Singapore", "Premium Motors SG", "City Auto Trading", "Island Car Export", "Sentosa Auto Pte Ltd", "Orchard Motors", "Bukit Timah Auto", "Ang Mo Kio Car Centre", ...
- **Phone:** Định dạng +65 (ví dụ +65 9123 4567, +65 8765 4321).
- **Email:** @company.sg, @gmail.com, @yahoo.com.sg.
- **Notes:** Ghi chú ngắn bằng tiếng Anh hoặc tiếng Thái (ví dụ: "Main contact: John", "Focus on Toyota/Honda", "Export to Bangkok").

### 4.3 Vehicles

- **Brand/Model:** Ưu tiên xe phổ biến tại Singapore và thị trường Thái: Toyota (Vios, Camry, Fortuner, Hilux), Honda (City, Civic, HR-V, CR-V), Mazda (CX-5, 3), Hyundai (Tucson, Kona), Kia (Seltos, Sportage), Nissan (X-Trail, Kicks), Mitsubishi (Xpander, Triton), Ford (Ranger, Everest). Có thể thêm BMW, Mercedes, Lexus cho phân khúc cao.
- **Năm:** 2020–2024.
- **Giá (price/cost):** Đơn vị **THB** (Baht). Ví dụ: 500k–2.5M THB tùy dòng xe (có thể map từ VND hiện tại sang THB hoặc đặt bảng giá mẫu).
- **Mileage:** 0–80,000 km.
- **Status:** Phân bổ hợp lý: ~40% sold, ~35% available, ~15% reserved, ~10% draft.
- **stockInDate:** Rải từ đầu kỳ 12 tháng đến gần “hiện tại”.
- **VIN:** Format chuẩn 17 ký tự (có thể dùng thư viện hoặc template).

### 4.4 Leads

- **Source:** facebook | website | marketplace | walk_in | hotline — phân bổ (ví dụ: website 30%, marketplace 25%, hotline 20%, facebook 15%, walk_in 10%).
- **Status:** new | contacted | test_drive | negotiation | closed | lost — phần lớn closed/lost sau 1 năm, còn lại rải new/contacted/test_drive/negotiation.
- **Name/Phone/Email:** Lấy từ Customer (dealer) tương ứng hoặc người liên hệ.
- **interestedVehicleId:** Một phần lead gắn xe cụ thể (trong danh sách Vehicles).
- **assignedTo:** Chủ yếu sales, một ít manager.
- **createdAt:** Rải đều 12 tháng, có thể tăng nhẹ theo tháng gần “hiện tại”.

### 4.5 Deals

- **Stage:** lead → test_drive → negotiation → loan_processing → closed_won | closed_lost.
- **expectedPrice / finalPrice:** THB, nhất quán với Vehicle.price.
- **expectedCloseDate:** Trong tương lai với deal đang mở, trong quá khứ với closed.
- **lostReason:** Khi stage = closed_lost: "Competitor price", "Customer postponed", "Financing rejected", "Exported to other market", v.v. (tiếng Anh).

### 4.6 Activities (Lead + Deal)

- **LeadActivity:** type = note | call | status_change; content tiếng Anh hoặc Thái.
- **DealActivity:** type = note | stage_change; content tương ứng (e.g. "Stage changed to negotiation", "Customer requested COE details").

### 4.7 VehiclePhotos & VehiclePriceHistory

- **VehiclePhotos:** url = placeholder (e.g. picsum.photos/seed/{vehicleId}/800/600), sortOrder 0,1,2...
- **VehiclePriceHistory:** Mỗi xe có ít nhất 1 bản ghi khi “list giá”; một số xe có thêm 1–2 lần “điều chỉnh giá” (recordedAt khác nhau).

---

## 5. Công nghệ và cách triển khai

### 5.1 Lựa chọn: Script sinh seed (Node/TS) thay vì chỉ JSON tĩnh

- **Ưu điểm:** Dễ thay đổi volume, phân bổ ngày, thêm brand/model; có thể dùng seed random (với seed cố định) để tái lập cùng bộ dữ liệu.
- **Cách làm:** Thêm package trong repo (ví dụ `scripts/seed` hoặc `src/data/seed/scripts`):
  - **Node + TypeScript** (ts-node hoặc build rồi chạy node).
  - Đọc types từ `src/types` (copy hoặc path alias) để đảm bảo entity đúng schema.
  - Sinh lần lượt: profiles → customers → vehicles → vehicle_photos → vehicle_price_history → leads → lead_activities → deals → deal_activities.
  - Ghi ra các file `*.seed.json` trong `src/data/seed/` (hoặc `scripts/seed/output/`) rồi load bằng `loadSeed.ts` hiện tại.

### 5.2 Thư viện gợi ý

- **Faker (faker-js):** Tên công ty, tên người, email, SĐT (tùy chỉnh format +65), ngày tháng. Locale có thể dùng `en` hoặc custom.
- **Seed random:** Ví dụ `seedrandom` để với cùng seed → cùng bộ dữ liệu (dễ debug, demo nhất quán).
- **VIN:** Có thể dùng pattern đơn giản (prefix + random) hoặc thư viện sinh VIN hợp lệ (nếu cần).

### 5.3 Cấu trúc thư mục gợi ý

```text
scripts/seed/                    # hoặc src/data/seed/scripts/
  package.json                   # (nếu tách script riêng)
  tsconfig.json
  src/
    index.ts                     # entry: gọi lần lượt generator
    config.ts                    # số lượng, khoảng ngày, seed random
    generators/
      profiles.ts
      customers.ts               # SG dealer names + +65 phone
      vehicles.ts                # brands/models, THB price, status
      vehiclePhotos.ts
      vehiclePriceHistory.ts
      leads.ts
      leadActivities.ts
      deals.ts
      dealActivities.ts
    data/
      dealer-names.ts             # danh sách tên dealer SG (hoặc từ faker)
      brands-models.ts            # brand + model phổ biến SG/TH
    utils.ts                     # random trong range, pick từ array, format date
  output/                        # (optional) ghi JSON tạm rồi copy vào src/data/seed
```

Hoặc đơn giản hơn: một file `scripts/seed/generate.ts` import config + từng generator và ghi đè các file `src/data/seed/*.seed.json`.

### 5.4 Tích hợp với load seed hiện tại

- `loadSeed.ts` hiện import trực tiếp từ `*.seed.json`. Sau khi chạy script sinh:
  - **Cách 1:** Script ghi đè luôn các file `src/data/seed/*.seed.json` → không đổi `loadSeed.ts`.
  - **Cách 2:** Script ghi ra thư mục khác (ví dụ `scripts/seed/output/`), build hoặc copy vào `src/data/seed/` bằng một lệnh npm script (e.g. `npm run seed:generate`).

---

## 6. Timeline 12 tháng

- **Start:** 2024-03-01 (hoặc ngày bắt đầu “go-live” giả định).
- **End:** 2025-03-09 (hoặc “today” tại thời điểm chạy script).

Quy ước:

- **Customers:** createdAt rải từ start đến end (dealer mới liên tục được thêm).
- **Vehicles:** stockInDate và createdAt rải đều; xe sold có updatedAt gần ngày deal closed_won.
- **Leads:** createdAt rải đều 12 tháng, có thể tăng nhẹ theo thời gian (thể hiện tăng trưởng).
- **Deals:** created_at và expectedCloseDate/closed date nhất quán với stage (closed_won/closed_lost có ngày trong quá khứ).

---

## 7. Checklist triển khai

- [ ] Tạo config: số lượng từng entity, start/end date, random seed.
- [ ] Chuẩn bị data tĩnh: danh sách tên dealer Singapore (ít nhất 50–100), brand/model/variant (SG/TH).
- [ ] Map currency: quyết định giá THB (min/max theo phân khúc) và thay toàn bộ seed sang THB.
- [ ] Implement generators theo thứ tự entity (profiles → … → deal_activities).
- [ ] Implement ràng buộc: customerId, vehicleId, leadId, assignedTo đúng ID có sẵn.
- [ ] Phân bổ status/stage hợp lý (ví dụ ~40% vehicles sold, ~35% leads closed, ~20% lost).
- [ ] Sinh VehiclePhotos và VehiclePriceHistory theo vehicle.
- [ ] Script ghi ra JSON; kiểm tra load (lần đầu mở app dùng `ensureInitialized()` trong repos) và không lỗi UI. (Tính năng Reset demo data đã bỏ; muốn nạp lại seed: chạy `npm run seed:generate`, xóa localStorage, refresh.)
- [ ] (Tùy chọn) npm script: `"seed:generate": "ts-node scripts/seed/src/index.ts"` hoặc tương đương.
- [ ] (Tùy chọn) Cập nhật UI/i18n: format tiền THB, ngày theo timezone Singapore/Bangkok nếu cần.

---

## 8. Lưu ý

- **ID:** Giữ format string (uuid hoặc prefix-id) nhất quán với hiện tại (vehicle-1, customer-1, …) hoặc chuyển sang UUID để tránh trùng khi scale.
- **Determinism:** Dùng cùng seed và cùng config → cùng output, thuận tiện cho CI/demo.
- **Performance:** Với vài trăm bản ghi, JSON và localStorage vẫn ổn; nếu sau này tăng lên hàng nghìn, có thể cần lazy load hoặc pagination phía app.

Khi hoàn thành, module seeding sẽ cung cấp bộ dữ liệu giả lập **1 năm** với **khách hàng là dealer Singapore bán vào Thái Lan**, sẵn sàng cho demo và test dashboard/deal pipeline.
