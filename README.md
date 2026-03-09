# Lemonaid DMS (MVP)

Admin portal DMS — mock data (JSON + localStorage), Supabase tích hợp sau.

## Chạy

```bash
npm install
npm run dev
```

Mở http://localhost:5173 → trang **Đăng nhập (Mock)**: chọn một tài khoản (admin/manager/sales) và đăng nhập. Dữ liệu seed nạp lần đầu (khi chưa có trong localStorage); CRUD lưu trong localStorage. Để nạp lại seed: chạy `npm run seed:generate`, xóa key `dms.v1.*` trong localStorage (hoặc xóa site data), rồi tải lại trang.

## Cấu trúc

- `src/types` — kiểu dữ liệu
- `src/data/seed` — file JSON seed + `loadSeed.ts`
- `src/data/storage` — helper localStorage
- `src/repos` — interface repo + mock implementation (vehicles, customers, leads, deals, profiles)
- `src/context` — AuthContext (mock login)
- `src/pages` — Dashboard, Inventory, Leads, Deals, Customers, Login
- `src/components` — AppLayout (sidebar + header)

Xem thêm: `docs/MOCK_FIRST_PLAN_CHECKLIST.md`, `docs/IMPLEMENTATION_PLAN.md`.
# lemonaid-dms
