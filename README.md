# Lemonaid DMS (MVP)

Admin portal DMS — dữ liệu mock (JSON + localStorage). Supabase sẽ tích hợp sau.

## Chạy

```bash
npm install
npm run dev
```

Mở http://localhost:5173 → trang **Đăng nhập (Mock)**: chọn một tài khoản (admin / manager / sales) và đăng nhập.

- Dữ liệu seed nạp lần đầu khi chưa có trong localStorage.
- CRUD lưu trong localStorage.

**Nạp lại seed:** chạy `npm run seed:generate`, xóa key `dms.v1.*` trong localStorage (hoặc xóa site data), rồi tải lại trang.

**Ảnh xe:** Nếu có file `scripts/crawler/output/crawled-vehicles.json` (sau khi chạy `npm run crawl`), seed sẽ dùng ảnh thật từ sàn thay vì placeholder.

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Chạy dev server (Vite) |
| `npm run build` | Build production |
| `npm run preview` | Xem bản build locally |
| `npm run seed:generate` | Sinh lại file seed JSON (trong `scripts/seed`) |
| `npm run crawl` | Chạy crawler (trong `scripts/crawler`) |
| `npm run crawl:import` | Crawl rồi import vào DMS |
| `npm run deploy:pages` | Build + deploy lên Cloudflare Pages |

## Cấu trúc

- `src/types` — kiểu dữ liệu
- `src/data/seed` — file JSON seed + `loadSeed.ts`
- `src/data/storage` — helper localStorage
- `src/repos` — interface repo + mock implementation (vehicles, customers, leads, deals, profiles)
- `src/context` — AuthContext (mock login)
- `src/pages` — Dashboard, Inventory, Leads, Deals, Customers, Login, chi tiết Deal/Customer
- `src/components` — AppLayout (sidebar + header), form Deal/Customer
- `src/hooks` — hooks dùng chung (vd. `useIsMobile`)
- `src/utils` — format, tagColors, …
- `src/styles` — responsive.css
- `src/i18n` — đa ngôn ngữ (vi / en / th)

**Scripts:**

- `scripts/seed` — sinh dữ liệu seed (Faker)
- `scripts/crawler` — crawl xe từ bonbanh (và import vào DMS)

**Tài liệu:**  
- Checklist & trạng thái: `docs/MOCK_FIRST_PLAN_CHECKLIST.md`  
- Kế hoạch tổng & roadmap phần tiếp theo: `docs/IMPLEMENTATION_PLAN.md`
