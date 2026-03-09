# DMS MVP — Kế hoạch triển khai (1 dealer duy nhất, mock trước)

**Công nghệ:** React + TypeScript + Ant Design (MVP mock bằng JSON/localStorage), Supabase (tích hợp sau)  
**Mục tiêu:** Cổng admin nội bộ, **làm MVP với mock data trước** để chốt UX/flow nhanh; sau khi ổn mới tích hợp Supabase.

**Trạng thái:** MVP mock đã xong. i18n (en/th/vi) đã tích hợp. Crawler Bonbanh có sẵn. Chi tiết checklist từng phase xem `docs/MOCK_FIRST_PLAN_CHECKLIST.md`.

---

## Roadmap & Phần tiếp theo

| Ưu tiên | Hạng mục | Trạng thái | Tài liệu |
|--------|----------|------------|----------|
| 1 | **UX — Phản hồi & thông báo** | Chưa làm | `docs/UX_ANALYSIS_AND_IMPROVEMENT_PLAN.md` Phase 1 |
| 2 | **UX — Hiển thị tên thay vì ID** (Lead/Deal detail) | Chưa làm | Phase 2 |
| 3 | **i18n Polish** (format ngày/số theo locale, message/placeholder) | Tùy chọn | `docs/I18N_PLAN.md` Phase 9 |
| 4 | **Supabase Phase A** — Schema + Repos + cờ DATA_PROVIDER | Tiếp theo | `docs/MOCK_FIRST_PLAN_CHECKLIST.md` |
| 5 | **Supabase Phase B** — Auth + RLS | Sau Phase A | |
| 6 | **Supabase Phase C** — Storage ảnh xe | Sau Phase B | |
| 7 | **Crawler** — Cập nhật selectors khi nguồn đổi; (tùy chọn) thêm nguồn Chợ Tốt | Bảo trì | `docs/INVENTORY_CRAWL_PLAN.md` |
| 8 | **Seed 1 năm** (Singapore → Thái Lan) | Tùy chọn | `docs/SEEDING_PLAN.md` |

**Thứ tự khuyến nghị:** UX Phase 1 & 2 (nhanh, cải thiện trải nghiệm) → Supabase A → B → C (chuyển data thật). i18n polish và seed 1 năm có thể làm song song hoặc sau khi Supabase ổn.

---

## 1. Tóm tắt điều hành

Bạn sẽ xây một DMS MVP dạng **admin portal** chạy trên React/TS/Ant Design. Toàn bộ phần “backend” dùng **Supabase Free** gồm: cơ sở dữ liệu Postgres, Auth, Storage, và phân quyền cơ bản bằng RLS.

Vì bạn muốn **1 dealer duy nhất**, MVP sẽ **không cần multi-tenant** và **không cần cột `dealer_id`** ở mọi bảng. Tất cả nhân viên (nhiều user) cùng làm việc trên một dataset. Phần “đường nâng cấp” lên multi-tenant vẫn được thiết kế sẵn để thêm sau, nhưng không làm phức tạp MVP.

**Kết quả MVP:** Quản lý xe (inventory) + lead + deal/pipeline + khách hàng + dashboard, có search/filter/sort, upload nhiều ảnh xe, và lịch sử/nhật ký hoạt động cơ bản.

---

## 2. Phạm vi MVP (Scope)

| Trong MVP | Ngoài MVP (để sau) |
|----------|---------------------|
| 1 SPA admin (nội bộ) | Mobile app, cổng khách hàng |
| CRUD xe/lead/deal/khách | Tự động hoá workflow, nhắc việc |
| Supabase Auth + RLS | Backend riêng, microservices |
| Ảnh xe trên Supabase Storage | Báo cáo nâng cao/BI |
| Dashboard cơ bản | Tích hợp Facebook/CRM/Callcenter |
| Price history & activity log | Hợp đồng, e-sign, in ấn |

**Giới hạn Supabase Free (cần lưu ý):** 500MB DB, 1GB Storage, 50K MAU. MVP nên giữ dữ liệu gọn, ảnh xe nén tốt.

---

## 3. Các module chức năng

| # | Module | Bảng chính | Tính năng chính |
|---|--------|------------|-----------------|
| 1 | **Inventory** | `vehicles`, `vehicle_photos`, `vehicle_price_history` | CRUD, trạng thái xe, upload nhiều ảnh, search/filter/sort, xem lịch sử giá |
| 2 | **Lead** | `leads`, `lead_activities` | Tạo lead thủ công, nguồn + trạng thái, assign sales, ghi chú/nhật ký, gắn xe quan tâm |
| 3 | **Deal / Pipeline** | `deals`, `deal_activities` | Tạo deal từ lead, link lead+xe+sales, stage pipeline, expected/final price, ngày dự kiến chốt, lost reason, timeline |
| 4 | **Customer** | `customers` | Hồ sơ khách, phone/email/name, liên kết lead/deal, lịch sử mua đơn giản |
| 5 | **Dashboard** | (view/query) | Tổng xe + breakdown, lead theo trạng thái, deal theo stage, conversion, sales theo salesperson |

---

## 4. UI / Luồng thao tác người dùng

- **Đăng nhập**: Email/password (Supabase Auth) → vào Dashboard.
- **Khung ứng dụng**: Sidebar (Dashboard, Inventory, Leads, Deals, Customers) + header (tài khoản, logout).

### 4.1 Inventory
- **Danh sách xe** (AntD Table): search VIN/brand/model; filter status/brand/year/price; sort; phân trang.
- **Tạo/Sửa xe** (AntD Form): đầy đủ field; status; ngày nhập kho; mô tả.
- **Ảnh xe**: upload nhiều ảnh, sắp xếp ảnh, xem gallery trong trang chi tiết.
- **Lịch sử giá**: mỗi lần đổi `price` sẽ ghi thêm record vào `vehicle_price_history`.

### 4.2 Lead
- **Danh sách lead**: filter status/source/assignee; search tên/phone.
- **Tạo lead**: chọn source, status; assign sales; nhập thông tin liên hệ.
- **Nhật ký**: thêm ghi chú/call log → insert vào `lead_activities`.
- **Link xe quan tâm**: chọn 1 xe (optional).

### 4.3 Deal / Sales pipeline
- **Tạo deal từ lead**: prefill khách + xe quan tâm + assignee.
- **Danh sách deal**: dạng bảng hoặc Kanban nhẹ theo stage.
- **Cập nhật stage**: thay stage; set expected/final price; expectedCloseDate; nếu lost thì nhập lostReason.
- **Timeline**: `deal_activities` hiển thị theo thời gian (note / stage change).

### 4.4 Customer
- **Danh sách khách**: search name/phone/email.
- **Chi tiết khách**: tab “Leads”, “Deals”, “Lịch sử mua” (deal closed_won).

---

## 5. Thiết kế schema Supabase (đơn giản cho 1 dealer)

Nguyên tắc: không `dealer_id` trong MVP. Dùng `profiles` để lưu role và hiển thị tên nhân viên. Các bảng có `created_by`, `assigned_to` để truy vết.

```sql
-- ========== AUTH / NHÂN SỰ ==========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'sales' check (role in ('admin', 'manager', 'sales')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ========== INVENTORY ==========
create type vehicle_status as enum ('draft', 'available', 'reserved', 'sold');

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  vin text,
  brand text not null,
  model text not null,
  variant text,
  year int not null,
  mileage int,
  color text,
  transmission text,
  fuel_type text,
  price numeric(14,2),
  cost numeric(14,2),
  stock_in_date date,
  description text,
  status vehicle_status not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);

create index idx_vehicles_status on public.vehicles(status);
create index idx_vehicles_vin on public.vehicles(vin);
create index idx_vehicles_brand_model on public.vehicles(brand, model);

create table public.vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  file_path text not null,
  sort_order int default 0,
  created_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);

create table public.vehicle_price_history (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  price numeric(14,2) not null,
  recorded_at timestamptz default now(),
  recorded_by uuid references public.profiles(id)
);

-- ========== CUSTOMERS ==========
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);

create index idx_customers_phone on public.customers(phone);
create index idx_customers_email on public.customers(email);

-- ========== LEADS ==========
create type lead_source as enum ('facebook', 'website', 'marketplace', 'walk_in', 'hotline');
create type lead_status as enum ('new', 'contacted', 'test_drive', 'negotiation', 'closed', 'lost');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  interested_vehicle_id uuid references public.vehicles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  source lead_source not null,
  status lead_status not null default 'new',
  name text,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);

create index idx_leads_status on public.leads(status);
create index idx_leads_source on public.leads(source);
create index idx_leads_assigned_to on public.leads(assigned_to);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  activity_type text not null default 'note', -- note/call/status_change...
  content text,
  created_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);

-- ========== DEALS ==========
create type deal_stage as enum (
  'lead', 'test_drive', 'negotiation', 'loan_processing', 'closed_won', 'closed_lost'
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  assigned_to uuid not null references public.profiles(id) on delete restrict,
  stage deal_stage not null default 'lead',
  expected_price numeric(14,2),
  final_price numeric(14,2),
  expected_close_date date,
  lost_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);

create index idx_deals_stage on public.deals(stage);
create index idx_deals_assigned_to on public.deals(assigned_to);

create table public.deal_activities (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  activity_type text not null default 'note', -- note/stage_change...
  content text,
  created_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);
```

**Gợi ý để “basic price history” đúng nghĩa:** Khi update `vehicles.price`, frontend so sánh giá cũ/giá mới; nếu khác thì insert `vehicle_price_history` (đơn giản, đủ MVP).

---

## 6. Thiết kế Auth / Role (Supabase Auth)

- **Đăng nhập:** Email + mật khẩu (Supabase Auth).
- **Tài khoản nội bộ:** Có thể bật “invite-only” (admin tạo user) để tránh tự đăng ký bừa.
- **Bảng `profiles`:** Lưu `full_name`, `role` (admin/manager/sales). Đây là nguồn “phân quyền mềm” cho UI và cho RLS.\n\n**Quy ước đơn giản:**\n- `admin/manager`: toàn quyền.\n- `sales`: thao tác nghiệp vụ thường ngày (lead/deal/customer), hạn chế delete nếu bạn muốn.\n\n---

## 7. RLS (phân quyền DB) cho 1 dealer

Vì chỉ có 1 dealer, mục tiêu RLS là: **chỉ user đã đăng nhập mới đọc/ghi được**. Nếu muốn “nhẹ mà đủ”, bạn có thể:\n- Cho tất cả user authenticated **SELECT/INSERT/UPDATE**.\n- Chỉ `admin/manager` được **DELETE** (để tránh xoá nhầm).\n\nBật RLS và policy mẫu cho `vehicles`:\n\n```sql\nalter table public.vehicles enable row level security;\n\ncreate policy \"vehicles_select\" on public.vehicles\nfor select to authenticated\nusing (true);\n\ncreate policy \"vehicles_insert\" on public.vehicles\nfor insert to authenticated\nwith check (true);\n\ncreate policy \"vehicles_update\" on public.vehicles\nfor update to authenticated\nusing (true);\n\ncreate policy \"vehicles_delete_admin\" on public.vehicles\nfor delete to authenticated\nusing (public.get_my_role() in ('admin','manager'));\n```\n\nÁp dụng tương tự cho `customers`, `leads`, `deals`, `*_activities`, `vehicle_*`.\n\n**Lưu ý quan trọng:** Không bao giờ dùng **service role key** trong frontend.\n\n---

## 8. Thiết kế Storage cho ảnh xe

- **Bucket:** `vehicle-photos` (private).\n- **Đường dẫn file:** `{vehicle_id}/{uuid}.{ext}` (không cần dealer_id).\n- **Chính sách đơn giản:** user authenticated được upload / đọc (đọc qua signed URL).\n\nLuồng:\n- Upload file → nhận `path`.\n- Insert vào `vehicle_photos(file_path, vehicle_id, sort_order)`.\n- Khi hiển thị ảnh: tạo signed URL theo `file_path`.\n\n---

## 9. Kiến trúc frontend (React admin portal)

- **Tooling:** Vite + React 18 + TypeScript + Ant Design 5 + React Router 6 + Supabase JS v2.\n- **Tổ chức thư mục (đủ đơn giản):**\n  - `src/lib/supabase.ts` — tạo client.\n  - `src/types/` — types/enums khớp schema.\n  - `src/api/` — hàm truy cập dữ liệu theo module: `vehicles.ts`, `leads.ts`, `deals.ts`, `customers.ts`.\n  - `src/context/AuthContext.tsx` — user + profile (role, full_name).\n  - `src/pages/` — `Dashboard`, `Inventory`, `Leads`, `Deals`, `Customers`, `Login`.\n  - `src/components/` — layout + form/component tái sử dụng.\n  - `src/utils/` — format tiền/tanggal, upload helper.\n\n**Nguyên tắc MVP:** Tất cả truy cập Supabase đi qua `src/api/*` để sau này đổi qua backend riêng dễ.\n\n---

## 10. Lộ trình triển khai theo phase

| Phase | Phạm vi | Kết quả bàn giao |
|-------|---------|------------------|
| **0. Setup** | Tạo Supabase project, schema, RLS, bucket | SQL migrations, tạo 1–2 user, màn login chạy được |
| **1. Khung admin** | Layout + routing + auth guard | Sidebar, header, trang Dashboard placeholder |
| **2. Inventory** | Vehicles + photos + price history | List + form create/edit + trang detail + upload ảnh + ghi lịch sử giá |
| **3. Customers** | CRUD khách | List + create/edit + detail có liên kết lead/deal |
| **4. Leads** | Lead + activity log | List + form + assign + notes/activity + link xe/khách |
| **5. Deals** | Pipeline + activity timeline | Create from lead + stage update + prices/dates + lost reason + timeline |
| **6. Dashboard** | Chỉ số cơ bản | Thống kê inventory/lead/deal + conversion + sales theo salesperson |
| **7. Polish** | UX/validation/error | Empty/loading states, validation, toast lỗi, tối ưu query cơ bản |

Thứ tự khuyến nghị: **0 → 1 → 2 → 3 → 4 → 5 → 6 → 7**.\n\n---

## 11. Tiêu chí nghiệm thu (Acceptance criteria)

- **Auth:** Đăng nhập/đăng xuất ok; route bảo vệ; refresh vẫn giữ session.\n- **Inventory:** CRUD xe (hoặc disable delete); status đúng; upload nhiều ảnh; list có search/filter/sort; đổi giá tạo record lịch sử giá.\n- **Leads:** Tạo lead theo source/status; assign sales; thêm note vào `lead_activities`; link xe quan tâm.\n- **Deals:** Tạo deal từ lead; link lead+xe+customer+sales; đổi stage; expected/final price + expectedCloseDate; closed_lost cần lostReason; timeline hiển thị được.\n- **Customers:** CRUD; xem lead/deal liên quan; lịch sử mua = deal closed_won.\n- **Dashboard:** Số liệu khớp DB; conversion rate tính nhất quán (định nghĩa rõ trong code).\n- **Bảo mật tối thiểu:** Chỉ user authenticated truy cập được dữ liệu (RLS hoạt động).\n\n---

## 12. Rủi ro & đánh đổi

| Rủi ro / đánh đổi | Cách giảm thiểu |
|-------------------|-----------------|
| Giới hạn Supabase Free | Nén ảnh, giới hạn số ảnh/xe, dọn lịch sử cũ nếu cần |
| Không có backend riêng | Giữ access layer trong `src/api/` để dễ migrate |
| RLS cấu hình sai | Test với 2 user khác nhau; không dùng service role trên web |
| Query dashboard chậm khi dữ liệu lớn | Index đúng cột filter; giới hạn thời gian (last 30/90 days) nếu cần |

---

## 13. Đường nâng cấp (từ 1 dealer → multi-tenant) & migrate backend riêng

### 13.1 Nâng cấp lên multi-tenant sau này
Khi cần nhiều dealer, bạn thêm:\n- Bảng `dealers`.\n- Thêm cột `dealer_id` vào các bảng nghiệp vụ.\n- RLS theo `dealer_id` (mẫu như bản kế hoạch trước).\n- Storage path đổi sang `{dealer_id}/{vehicle_id}/{uuid}.{ext}`.\n\n### 13.2 Migrate sang backend riêng (khi MVP ổn)
- **DB:** Giữ Postgres schema tương tự.\n- **API:** Thay implementation trong `src/api/*` từ Supabase client sang `fetch` gọi REST/tRPC.\n- **Auth:** Thay Supabase Auth bằng JWT/session; backend enforce role.\n- **Storage:** Đổi sang S3/GCS; backend cấp signed URL.\n\n---

## Tham chiếu nhanh

- **Migrations:** `supabase/migrations/` (ví dụ: `001_schema.sql`, `002_rls.sql`, `003_storage.sql`).\n- **ENV frontend:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (tuyệt đối không dùng service role key).\n+
Hết kế hoạch triển khai.

---

## Tài liệu bổ sung (mock-first)

Nếu bạn đang làm theo hướng **mock data bằng JSON/localStorage trước** và để Supabase sau, xem checklist chi tiết tại `docs/MOCK_FIRST_PLAN_CHECKLIST.md`.
