# Kế hoạch hỗ trợ i18n (Đa ngôn ngữ)

Tài liệu này mô tả plan triển khai internationalization (i18n) cho Lemonaide DMS với **3 ngôn ngữ**: Tiếng Anh (en), Tiếng Thái (th), Tiếng Việt (vi).

---

## 1. Mục tiêu

- Hỗ trợ **English**, **ไทย (Thai)**, **Tiếng Việt** làm ngôn ngữ giao diện.
- Người dùng có thể **chọn ngôn ngữ** (language switcher) và lưu lựa chọn (localStorage).
- Toàn bộ **UI text** (menu, nút, label, message, placeholder) dùng translation key, không hardcode.
- **Ant Design** (Form, Table, Modal, DatePicker…) dùng đúng locale theo ngôn ngữ đã chọn.
- **Định dạng ngày/giờ, số, tiền tệ** theo locale (ví dụ: vi-VN, th-TH, en-US).

---

## 2. Thư viện và công cụ

| Côngp | Mục đích |
|--------|----------|
| **react-i18next** | Hook `useTranslation()`, HOC, provider, đổi ngôn ngữ runtime. |
| **i18next** | Core: load JSON locale, fallback (en → vi), interpolation. |
| **i18next-browser-languagedetector** | Tự phát hiện ngôn ngữ trình duyệt (optional). |

**Cài đặt:**

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

**Lý do không chọn:**  
- `react-intl` (FormatJS): nặng hơn, API phức tạp hơn cho nhu cầu 3 ngôn ngữ.  
- `react-i18next` gọn, tích hợp tốt với React, dễ đổi ngôn ngữ và đồng bộ với Ant Design locale.

---

## 3. Cấu trúc thư mục và file

```
src/
  i18n/
    index.ts              # Khởi tạo i18next, đăng ký resources
    locales/
      en/
        common.json       # Chung: app name, nút, thông báo
        nav.json         # Menu, sidebar
        auth.json        # Login, logout
        inventory.json   # Kho xe
        leads.json       # Lead
        deals.json       # Deal / Pipeline
        customers.json   # Khách hàng
        dashboard.json   # Tổng quan
      th/
        common.json
        nav.json
        ...
      vi/
        common.json
        nav.json
        ...
  ...
```

- **Mỗi ngôn ngữ** một thư mục `en`, `th`, `vi` với cùng set file (namespace).
- **Namespace** = tên file (common, nav, auth, inventory, leads, deals, customers, dashboard) để load theo từng trang, tránh bundle quá lớn.

---

## 4. Khởi tạo i18n (`src/i18n/index.ts`)

- Gọi `i18n.use(initReactI18next).use(LanguageDetector).init({...})`.
- `fallbackLng: 'en'`, `supportedLngs: ['en', 'th', 'vi']`.
- `defaultNS: 'common'`, `ns: ['common', 'nav', 'auth', 'inventory', 'leads', 'deals', 'customers', 'dashboard']`.
- `backend` (nếu dùng): load JSON từ `public/locales/{{lng}}/{{ns}}.json` hoặc import trực tiếp từ `src/i18n/locales/...` (đơn giản hơn cho Vite).
- Import file này trong `main.tsx` trước khi render `<App />`.

---

## 5. Tích hợp Ant Design locale

Hiện tại `App.tsx` đang dùng:

```ts
import viVN from 'antd/locale/vi_VN'
<ConfigProvider locale={viVN}>
```

**Cần:**

- Map ngôn ngữ app → locale Ant Design:
  - `en` → `antd/locale/en_US`
  - `th` → `antd/locale/th_TH`
  - `vi` → `antd/locale/vi_VN`
- Lấy ngôn ngữ hiện tại từ `i18n.language` (react-i18next).
- Trong component gốc (App hoặc layout), `<ConfigProvider locale={antdLocale}>` với `antdLocale` phụ thuộc `i18n.language`.

---

## 6. Nguyên tắc key và namespace

- **Key** dạng `camelCase`, nhóm theo màn hình/chức năng, ví dụ:  
  `inventory.title`, `inventory.backToList`, `deals.stage.lead`, `common.save`, `common.cancel`.
- **Namespace**:
  - `common`: OK, Cancel, Save, Back, Loading… (dùng nhiều nơi).
  - `nav`: Tổng quan, Kho xe, Lead, Deal / Pipeline, Khách hàng, Đăng xuất.
  - `auth`: Đăng nhập, chọn tài khoản, đang tải…
  - `inventory`, `leads`, `deals`, `customers`, `dashboard`: từng module.
- **Interpolation** khi cần: `"welcome": "Xin chào, {{name}}"`.
- **Plural** (nếu cần): dùng suffix `_one`, `_other` của i18next cho tiếng Anh/Thái/Việt.

---

## 7. Language switcher và lưu lựa chọn

- Thêm **dropdown hoặc select** trên header (cạnh avatar/user): EN | TH | VI.
- Gọi `i18n.changeLanguage(lng)` khi đổi; Ant Design locale đã gắn với `i18n.language` nên sẽ đổi theo.
- Lưu lựa chọn vào **localStorage** (ví dụ key `dms-lang`) và khởi tạo i18n với `lng: localStorage.getItem('dms-lang') || ...` để lần sau vào vẫn giữ ngôn ngữ.

---

## 8. Định dạng ngày, số, tiền tệ

- **Ngày/giờ:** Giữ logic hiện tại nhưng dùng locale khi gọi `toLocaleString`:
  - `en` → `toLocaleString('en-US')`
  - `th` → `toLocaleString('th-TH')`
  - `vi` → `toLocaleString('vi-VN')`
- Có thể tạo helper `formatDateTime(date, i18n.language)` và dùng thống nhất.
- **Tiền (VNĐ):** Giữ đơn vị "triệu" (tr) hoặc "VNĐ", chỉ cần label đa ngôn ngữ (e.g. "tr" → "million" / "ล้าน" / "tr"); số có thể format theo locale (dấu phẩy/chấm).

---

## 9. Các phase triển khai

| Phase | Nội dung |
|-------|----------|
| **1. Setup** | Cài i18next, react-i18next; tạo `src/i18n/index.ts`, import trong `main.tsx`; tạo cấu trúc `locales/en`, `locales/th`, `locales/vi` với `common.json` (ít key để test). |
| **2. Ant Design + Language switcher** | Map `en/th/vi` → Ant Design locale trong App; thêm language switcher trên header; lưu/đọc `dms-lang` từ localStorage. |
| **3. Nav & Auth** | Chuyển toàn bộ text trong `AppLayout` (menu, Đăng xuất, modal) và `LoginPage` sang key (namespace `nav`, `auth`, `common`). (Reset demo đã bỏ.) |
| **4. Dashboard** | Namespace `dashboard`, thay toàn bộ text trong `DashboardPage`. |
| **5. Inventory** | Namespace `inventory`, thay text trong `InventoryPage`, `InventoryDetailPage`, `VehicleForm`. |
| **6. Leads** | Namespace `leads`, thay text trong `LeadsPage`, `LeadDetailPage`, `LeadForm`. |
| **7. Deals** | Namespace `deals`, thay text trong `DealsPage`, `DealDetailPage`, `DealForm` (kể cả stage labels, form labels). |
| **8. Customers** | Namespace `customers`, thay text trong `CustomersPage`, `CustomerDetailPage`, `CustomerForm`. |
| **9. Polish** | Helper `formatDateTime`/format number theo locale; kiểm tra message.success/error; kiểm tra placeholder, empty state; test đổi ngôn ngữ toàn flow. |

---

## 10. Danh sách gợi ý key (theo khu vực)

### common
- `appName`, `loading`, `save`, `cancel`, `back`, `edit`, `delete`, `confirm`, `reset`, `search`, `submit`, `close`, `ok`, `yes`, `no`, `backToList`, `noData`, `required`, `optional`.

### nav
- `overview`, `inventory`, `leads`, `deals`, `customers`, `logout`.

### auth
- `login`, `loginTitle`, `loginSubtitle`, `selectAccount`, `signIn`.

### dashboard
- (Các tiêu đề, thống kê, label trên Dashboard.)

### inventory
- `title`, `list`, `detail`, `addVehicle`, `editVehicle`, `brand`, `model`, `variant`, `year`, `price`, `status`, `draft`, `published`, `vin`, `mileage`, `color`, `transmission`, `fuelType`, `description`, …

### leads
- `title`, `list`, `detail`, `addLead`, `editLead`, `source`, `status`, `createdAt`, `customer`, `deal`, …

### deals
- `title`, `list`, `detail`, `addDeal`, `editDeal`, `stage`, `stageLead`, `stageTestDrive`, `stageNegotiation`, `stageLoan`, `stageWon`, `stageLost`, `expectedPrice`, `finalPrice`, `expectedCloseDate`, `lostReason`, `lostReasonRequired`, `timeline`, `addNote`, …

### customers
- `title`, `list`, `detail`, `addCustomer`, `editCustomer`, `name`, `phone`, `email`, `notes`, `info`, `leads`, `deals`, `purchase`, …

---

## 11. File cần chỉnh sửa (tóm tắt)

| File | Thay đổi chính |
|------|----------------|
| `package.json` | Thêm dependency i18next, react-i18next, i18next-browser-languagedetector. |
| `main.tsx` | Import `./i18n` trước ReactDOM.render. |
| `src/i18n/index.ts` | Mới: init i18n, namespace, fallback. |
| `src/i18n/locales/{en,th,vi}/*.json` | Mới: file dịch từng namespace. |
| `App.tsx` | ConfigProvider locale theo `i18n.language`; ProtectedRoute dùng `t('auth.loading')` hoặc tương đương. |
| `AppLayout.tsx` | Menu name, logout → `t('nav.xxx')`; thêm language switcher. (Reset demo đã bỏ.) |
| `LoginPage.tsx` | Title, subtitle, label → `t('auth.xxx')`. |
| `DashboardPage.tsx` | Tất cả text → `t('dashboard.xxx')`. |
| `InventoryPage.tsx`, `InventoryDetailPage.tsx`, `VehicleForm.tsx` | Text → `t('inventory.xxx')`. |
| `LeadsPage.tsx`, `LeadDetailPage.tsx`, `LeadForm.tsx` | Text → `t('leads.xxx')`. |
| `DealsPage.tsx`, `DealDetailPage.tsx`, `DealForm.tsx` | Text + stage options → `t('deals.xxx')`. |
| `CustomersPage.tsx`, `CustomerDetailPage.tsx`, `CustomerForm.tsx` | Text → `t('customers.xxx')`. |

---

## 12. Lưu ý

- **Tiếng Thái:** Ant Design có sẵn `th_TH`; kiểm tra font hiển thị đúng (thường không cần chỉnh nếu dùng font hệ thống/web chuẩn).
- **RTL:** Không cần cho en/th/vi.
- **SEO:** Ứng dụng SPA, nếu sau này cần SEO đa ngôn ngữ có thể cân nhắc path prefix (`/en/`, `/th/`, `/vi/`) và server-side hoặc static HTML; ngoài scope plan hiện tại.
- **Chất lượng bản dịch:** Nên có người bản ngữ review cho Thai và Vietnamese; English có thể dùng làm base.

Sau khi hoàn thành từng phase, test kỹ chuyển ngôn ngữ trên từng màn hình và kiểm tra Ant Design (form validation, date picker, table empty state…) hiển thị đúng locale.
