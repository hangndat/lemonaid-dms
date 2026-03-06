# DMS MVP (Admin Portal) — Plan chi tiết & Checklist (Mock JSON trước, Supabase sau)

## Trạng thái hiện tại (đã triển khai)

**MVP mock đã xong.** Ứng dụng chạy với seed JSON + localStorage, đủ luồng nghiệp vụ.

| Phần | Trạng thái |
|------|-------------|
| **Phase 0** | ✅ Vite + React + TS + Ant Design + Router, AuthContext mock, seed JSON, repos, Reset demo data |
| **Phase 1 — Inventory** | ✅ CRUD xe, form tạo/sửa, xóa xe, ảnh (thêm/xóa URL), price history, search/filter/sort |
| **Phase 2 — Customers** | ✅ CRUD khách, modal Thêm khách, chi tiết + Sửa, tabs Lead/Deal/Lịch sử mua |
| **Phase 3 — Leads** | ✅ Thêm lead (modal), Sửa lead, ghi chú → lead_activities, link xe quan tâm + khách, nút Tạo deal |
| **Phase 4 — Deals** | ✅ Thêm deal (modal), tạo từ lead (prefill), Sửa stage/giá/lostReason, timeline + stage_change |
| **Phase 5 — Dashboard** | ✅ Thống kê xe/lead/deal, conversion rate, doanh số theo nhân viên (hiển thị tên) |
| **Phase 6 — Polish** | ✅ Confirm xóa xe, format tiền/ngày, loading states cơ bản |

**Chạy:** `npm run dev` → đăng nhập mock (chọn user) → dùng đầy đủ Kho xe, Lead, Deal, Khách hàng, Tổng quan.

---

## Mục tiêu

Làm MVP nhanh với **UI/luồng nghiệp vụ hoàn chỉnh**, dữ liệu **mock từ file JSON** và **CRUD lưu tạm bằng localStorage** để demo/validate nội bộ. Sau khi MVP “chốt” mới tích hợp Supabase (DB/Auth/Storage/RLS).

Nguyên tắc:
- **Không over-engineering**: không dựng backend, không dựng state management phức tạp.
- **Tách data layer mỏng**: để chuyển từ mock → Supabase chỉ đổi implementation.
- **Ưu tiên usability**: list nhanh, form rõ ràng, thao tác ít bước, validate vừa đủ.

---

## Kiến trúc tổng quan (mock-first)

### 1) Các lớp nên có (tối giản)
- **UI (pages/components)**: Ant Design Table/Form/Modal/Drawer.
- **Domain types**: type/interface cho `Vehicle`, `Lead`, `Deal`, `Customer`, `Activity`.
- **Repositories (data layer)**:
  - `Repo interfaces`: `VehiclesRepo`, `LeadsRepo`, `DealsRepo`, `CustomersRepo`
  - `Mock implementation`: đọc seed từ JSON, ghi/đọc state từ localStorage
  - (Sau MVP) `Supabase implementation`: thay logic CRUD bằng Supabase client

### 2) Cấu trúc thư mục gợi ý
- `src/types/` — enums + types
- `src/data/seed/` — `vehicles.seed.json`, `leads.seed.json`, ...
- `src/data/storage/` — helper localStorage (get/set/migrate)
- `src/repos/` — interfaces + mock repos
- `src/pages/` — Dashboard/Inventory/Leads/Deals/Customers/Login (Login có thể mock luôn)
- `src/components/` — AppLayout, EntityForm*, ActivityTimeline, VehiclePhotos

### 3) Strategy “mock JSON + localStorage”
- **Seed JSON**: dùng để nạp dữ liệu ban đầu lần đầu mở app.
- **localStorage**: là “DB tạm” cho demo:
  - Key versioned: `dms.v1.vehicles`, `dms.v1.leads`, ...
  - Có hàm “Reset demo data” trong UI (Admin menu) để nạp lại seed.
- **ID**: dùng `crypto.randomUUID()` để tạo id.
- **Timestamps**: `new Date().toISOString()`.

---

## Phạm vi MVP (mock)

### Inventory

- **Trạng thái xe**: `draft | available | reserved | sold`
- **Field bắt buộc/khuyến nghị**:
  - **Bắt buộc**: `brand`, `model`, `year`, `status`
  - **Khuyến nghị**: `vin`, `variant`, `mileage`, `color`, `transmission`, `fuelType`, `price`, `cost`, `stockInDate`, `description`
- **Tính năng**:
  - CRUD xe
  - Upload nhiều ảnh / sắp xếp ảnh (demo)
  - Search / filter / sort (tối thiểu: theo VIN/brand/model; filter theo status/brand/year; sort theo price/year/stockInDate)
  - Price history cơ bản (mỗi lần đổi giá tạo record)

### Lead

- **Nguồn lead**: `facebook | website | marketplace | walk-in | hotline`
- **Trạng thái lead**: `new | contacted | test_drive | negotiation | closed | lost`
- **Tính năng**:
  - Tạo lead thủ công
  - Assign salesperson
  - Notes / activity log (append-only)
  - Link xe quan tâm (1 xe)

### Deal / Sales pipeline

- **Stage**: `lead | test_drive | negotiation | loan_processing | closed_won | closed_lost`
- **Field**: `expectedPrice`, `finalPrice`, `expectedCloseDate`, `lostReason`
- **Tính năng**:
  - Tạo deal từ lead
  - Link `vehicle + lead + salesperson (+ customer nếu có)`
  - Timeline hoạt động cơ bản (note + stage change)

### Customer

- **Field**: `phone/email/name`
- **Tính năng**:
  - Customer profile CRUD
  - Xem lead/deal liên quan
  - Purchase history đơn giản (deal `closed_won`)

### Dashboard

- **Chỉ số**:
  - Total inventory + breakdown available/reserved/sold
  - Lead theo status
  - Deal theo stage
  - Conversion rate (định nghĩa rõ, xem bên dưới)
  - Sales summary theo salesperson (số deal won + tổng `finalPrice`)

---

## UI spec (cụ thể để implement nhanh)

### Layout & Navigation
- **Sidebar**: Dashboard / Inventory / Leads / Deals / Customers
- **Header**: tên user + role, nút “Reset demo data”, nút Logout (mock)

### Inventory UI
- **Trang danh sách**:
  - Table columns gợi ý: Status, Brand, Model, Year, VIN, Price, Mileage, StockInDate, UpdatedAt, Actions
  - Filter chips/controls: Status, Brand, Year range, Price range
  - Actions: View / Edit / Duplicate (optional) / Delete (nếu có)
- **Trang tạo/sửa**:
  - Form chia section: Thông tin xe / Giá / Tình trạng / Mô tả / Ảnh
  - Validate tối thiểu: brand/model/year/status hợp lệ
- **Trang chi tiết**:
  - Ảnh gallery
  - Thông tin xe
  - Price history table (recordedAt, price, recordedBy)

### Lead UI
- **Trang danh sách**: filter status/source/assignee; search tên/phone/email
- **Trang chi tiết**:
  - Thông tin lead + xe quan tâm
  - Ghi chú nhanh (textbox + submit) → append `lead_activities`

### Deal UI
- **Danh sách**:
  - MVP chọn 1: **Table** (nhanh) hoặc **Kanban** (đẹp hơn nhưng tốn công)
  - Khuyến nghị: Table + filter theo stage + quick edit stage (Select)
- **Tạo deal từ lead**:
  - Nút “Tạo deal” trong Lead detail → mở form Deal với prefill
- **Deal detail**:
  - Thông tin deal + link lead/xe/khách
  - Timeline (append note + stage change)

### Customer UI
- **Danh sách**: search theo name/phone/email
- **Customer detail**:
  - Tabs: Thông tin / Leads / Deals / Lịch sử mua

### Dashboard UI
- Cards/Stats + 2–3 charts nhẹ (tuỳ): có thể dùng AntD `Statistic`, `Progress`, `Table` (tránh chart phức tạp nếu không cần).

---

## Data model (mock) — gợi ý fields tối thiểu

> Bạn có thể dùng camelCase trong frontend. JSON seed cũng camelCase để khỏi map nhiều. Khi tích hợp Supabase, bạn có thể giữ camelCase ở code và map sang snake_case ở layer Supabase (hoặc đổi DB theo camelCase nếu bạn muốn đơn giản).

### `Profile`
- `id`, `fullName`, `email`, `role: 'admin'|'manager'|'sales'`

### `Vehicle`
- `id`, `vin?`, `brand`, `model`, `variant?`, `year`, `mileage?`, `color?`, `transmission?`, `fuelType?`
- `price?`, `cost?`, `stockInDate?`, `description?`, `status`
- `createdAt`, `updatedAt`, `createdBy?`

### `VehiclePhoto`
- `id`, `vehicleId`, `url`, `sortOrder`, `createdAt`, `createdBy?`

### `VehiclePriceHistory`
- `id`, `vehicleId`, `price`, `recordedAt`, `recordedBy?`

### `Customer`
- `id`, `name`, `phone?`, `email?`, `notes?`, `createdAt`, `updatedAt`, `createdBy?`

### `Lead`
- `id`, `source`, `status`
- `name?`, `phone?`, `email?`, `notes?`
- `customerId?`, `interestedVehicleId?`, `assignedTo?`
- `createdAt`, `updatedAt`, `createdBy?`

### `LeadActivity`
- `id`, `leadId`, `type: 'note'|'call'|'status_change'`, `content?`, `createdAt`, `createdBy?`

### `Deal`
- `id`, `stage`, `assignedTo`
- `leadId?`, `vehicleId?`, `customerId?`
- `expectedPrice?`, `finalPrice?`, `expectedCloseDate?`, `lostReason?`
- `createdAt`, `updatedAt`, `createdBy?`

### `DealActivity`
- `id`, `dealId`, `type: 'note'|'stage_change'`, `content?`, `createdAt`, `createdBy?`

---

## Thiết kế data layer (để chuyển mock → Supabase ít đau)

### 1) Repo interfaces (gợi ý tối thiểu)
- **List** (có filter/sort/pagination nhẹ): `list(query)`
- **Get by id**: `get(id)`
- **Create**: `create(payload)`
- **Update**: `update(id, patch)`
- **Delete**: `remove(id)`

> Query chỉ cần: `search`, `filters`, `sort`, `page`, `pageSize`.

### 2) Mock repos (JSON + localStorage)
- Lần đầu chạy:
  - Nếu chưa có key `dms.v1.initialized=true` → load seed JSON vào localStorage.
- Sau đó CRUD toàn bộ đọc/ghi localStorage.

### 3) Mock ảnh xe (không backend)
MVP có 2 lựa chọn, chọn 1 để nhanh:
- **Option A (khuyến nghị cho demo ổn định)**: seed sẵn 10–20 ảnh mẫu trong `public/demo-vehicles/` và trong JSON chỉ lưu `url` trỏ tới ảnh đó.
- **Option B**: cho upload file và lưu **base64** vào localStorage (có nguy cơ đầy dung lượng). Nếu chọn B, giới hạn file nhỏ (ví dụ < 300KB) và giới hạn số ảnh/xe.

---

## Plan triển khai chi tiết theo phase (mock-first)

### Phase 0 — Khởi tạo dự án & nền tảng (1–2 ngày)
- Tạo Vite React TS
- Cài Ant Design + React Router
- Dựng `AppLayout` + routing
- Tạo `AuthContext` (mock): chọn user từ danh sách seed (admin/manager/sales)
- Tạo seed JSON + loader + nút “Reset demo data”
- Tạo repo interfaces + mock repos (vehicles/leads/deals/customers)

**Checklist Phase 0**
- [x] `src/types/*` có enums/status đúng theo yêu cầu
- [x] Có seed tối thiểu: 10 xe, 20 leads, 10 customers, 8 deals, 3–5 profiles
- [x] `Reset demo data` hoạt động (xoá localStorage keys và nạp lại seed)
- [x] Mock login: chọn user và role; app nhớ user (localStorage) sau reload

### Phase 1 — Inventory (2–4 ngày)
- List xe: search/filter/sort/pagination
- Form create/edit: validate tối thiểu
- Chi tiết xe: gallery + info + price history
- Logic price history: khi update `price` khác trước → append record
- Ảnh: Option A (seed URL) hoặc Option B (upload base64 giới hạn)

**Checklist Phase 1**
- [x] CRUD vehicle chạy end-to-end (create/edit/delete nếu cho phép)
- [x] Status workflow hiển thị rõ; filter theo status đúng
- [x] Đổi `price` tạo record mới trong `vehicle_price_history`
- [x] Xem chi tiết xe thấy ảnh + lịch sử giá

### Phase 2 — Customers (1–2 ngày)
- List khách: search name/phone/email
- Create/edit
- Customer detail: tabs + liên kết leads/deals (read-only)

**Checklist Phase 2**
- [x] CRUD customer ok
- [x] Customer detail hiển thị leads/deals liên quan (nếu có)

### Phase 3 — Leads (2–3 ngày)
- List lead: filter status/source/assignee; search
- Create/edit lead
- Lead detail: quick add note → append `lead_activities`
- Link xe quan tâm + link customer (chọn từ list)

**Checklist Phase 3**
- [x] Create lead với source/status/assignee
- [x] Thêm note tạo activity record và hiển thị timeline
- [x] Gắn xe quan tâm và hiển thị link qua Inventory detail

### Phase 4 — Deals (2–4 ngày)
- List deals theo stage (table + filter)
- Create deal từ lead (prefill)
- Update stage + validate:
  - nếu stage = `closed_lost` → bắt buộc `lostReason`
  - nếu stage = `closed_won` → khuyến nghị `finalPrice`
- Deal detail: thêm note + timeline

**Checklist Phase 4**
- [x] Tạo deal từ lead 1 click (prefill ok)
- [x] Update stage tạo `deal_activities` type `stage_change`
- [x] Rule `closed_lost` bắt buộc lostReason

### Phase 5 — Dashboard (1–2 ngày)
- Tính toán metrics từ local arrays:
  - inventory counts theo status
  - lead counts theo status
  - deal counts theo stage
  - conversion rate (đề xuất): `#deals.closed_won / #leads` hoặc `#leads.closed / #leads` (chọn 1, cố định)
  - sales summary: group by `assignedTo`, sum `finalPrice` của deals closed_won

**Checklist Phase 5**
- [x] Dashboard numbers khớp dữ liệu seed
- [x] Sales summary theo salesperson đúng (hiển thị tên nhân viên)

### Phase 6 — Polish & “Demo-ready” (1–2 ngày)
- Loading/empty/error states
- Confirm delete + undo nhẹ (optional)
- Nút export CSV cho list (optional, nhanh)
- Chuẩn hoá format tiền/ngày, validate input
- Kiểm tra flow end-to-end demo

**Checklist Phase 6**
- [x] Không có trang “cụt” / lỗi hiển thị rõ
- [x] Demo flow: tạo xe → tạo lead → tạo deal → closed_won → dashboard cập nhật

---

## Checklist nghiệm thu tổng (MVP mock)

- **Auth mock**
  - [x] Chọn user/role và app ghi nhớ
  - [x] Logout + reset demo ok

- **Inventory**
  - [x] CRUD xe
  - [x] Search/filter/sort hoạt động
  - [x] Upload/hiển thị nhiều ảnh (thêm URL, xóa ảnh)
  - [x] Price history ghi nhận khi đổi giá

- **Leads**
  - [x] Tạo lead với source/status
  - [x] Assign salesperson
  - [x] Activity log append-only, hiển thị timeline
  - [x] Link xe quan tâm

- **Deals**
  - [x] Tạo deal từ lead
  - [x] Stage pipeline hoạt động
  - [x] `closed_lost` bắt buộc lostReason
  - [x] Timeline hoạt động

- **Customers**
  - [x] CRUD customer
  - [x] Xem leads/deals liên quan
  - [x] Purchase history từ deals `closed_won`

- **Dashboard**
  - [x] Các thống kê hiển thị và tính đúng theo seed
  - [x] Conversion rate định nghĩa rõ; sales theo tên nhân viên

---

## Kế hoạch tích hợp Supabase “sau khi MVP chốt”

Khi UI/flow ổn, chuyển sang Supabase theo thứ tự ít rủi ro:

### Supabase Phase A — DB (không auth trước)
- Tạo schema tables
- Viết `SupabaseRepos` song song với `MockRepos`
- Tạo cờ `DATA_PROVIDER=mock|supabase` (env) để switch
- So sánh behavior mock vs supabase trên cùng UI

### Supabase Phase B — Auth + RLS
- Thay mock auth bằng Supabase Auth
- Bật RLS “authenticated only” (mô hình 1 dealer)
- Chuyển `createdBy/assignedTo` sang `auth.uid()` mapping sang profiles

### Supabase Phase C — Storage ảnh
- Tạo bucket `vehicle-photos`
- Upload ảnh thật, lưu `file_path` thay vì `url`
- Dùng signed URLs để hiển thị

---

## Rủi ro khi mock bằng localStorage (và cách xử lý)

- **Dung lượng localStorage nhỏ**: tránh lưu ảnh base64 lớn. Ưu tiên **Option A** (ảnh seed trong `public/`).
- **Không có concurrency**: demo nội bộ ok; khi lên Supabase mới xử lý đồng bộ nhiều user.
- **Mock dễ “lệch” so với DB thật**: giảm rủi ro bằng repo interfaces, giữ payload/logic gần với schema dự định.

