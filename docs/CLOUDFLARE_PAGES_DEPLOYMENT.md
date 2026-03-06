# Kế hoạch host Lemonaid DMS lên Cloudflare Pages

Tài liệu hướng dẫn triển khai ứng dụng **lemonaid-dms** (Vite + React + TypeScript) lên [Cloudflare Pages](https://pages.cloudflare.com/).

---

## 1. Tại sao chọn Cloudflare Pages

- **Free tier rộng rãi:** 500 builds/tháng, unlimited sites, unlimited bandwidth, unlimited static requests
- **Git integration:** Deploy tự động mỗi khi push (GitHub/GitLab)
- **Preview per commit:** Mỗi commit/PR có link preview riêng
- **Edge network:** Site chạy trên CDN Cloudflare, nhanh toàn cầu
- **SSL sẵn:** HTTPS out of the box
- **Phù hợp SPA:** Hỗ trợ redirect/rewrite cho React Router (client-side routing)

---

## 2. Yêu cầu dự án (đã đáp ứng)

| Yêu cầu | Trạng thái |
|--------|------------|
| Build command | `npm run build` (đã có trong `package.json`) |
| Output directory | `dist` (mặc định Vite) |
| SPA routing | File `public/_redirects` đã thêm (xem mục 3) |
| Node version | Khuyến nghị set trong Cloudflare: **18** hoặc **20** |

---

## 3. Cấu hình SPA (React Router)

Ứng dụng dùng React Router — mọi path (vd. `/inventory`, `/deals/123`) cần trả về `index.html` để client xử lý. Cloudflare Pages dùng file **`_redirects`** để làm điều này.

**Đã tạo:** `public/_redirects` với nội dung:

```
/*    /index.html   200
```

- `/*`: mọi đường dẫn
- `/index.html`: serve file này
- `200`: status 200 (rewrite, không redirect) — URL trên trình duyệt không đổi

File nằm trong `public/` nên Vite sẽ copy vào thư mục `dist` khi build. Không cần chỉnh thêm.

---

## 4. Các bước triển khai

### Bước 1: Đẩy code lên Git (GitHub hoặc GitLab)

```bash
git add .
git commit -m "chore: add Cloudflare Pages config (_redirects)"
git push origin main
```

Đảm bảo repo đã connect với GitHub/GitLab (Cloudflare Pages hỗ trợ cả hai).

### Bước 2: Tạo project trên Cloudflare Pages

1. Vào [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Chọn **GitHub** (hoặc GitLab), authorize Cloudflare.
3. Chọn repository **lemonaid-dms**.
4. Điền cấu hình build:
   - **Project name:** `lemonaid-dms` (hoặc tên bạn muốn, sẽ thành subdomain `*.pages.dev`).
   - **Production branch:** `main`.
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** (để trống nếu repo là root của project).
   - **Environment variables (optional):** thêm nếu sau này dùng biến môi trường (vd. `VITE_SUPABASE_URL`).

### Bước 3: Cấu hình Node version (khuyến nghị)

Trong project **Settings** → **Builds & deployments** → **Environment variables**:

- Thêm biến:
  - **Variable name:** `NODE_VERSION`
  - **Value:** `20`
  - Áp dụng cho: **Production** (và Preview nếu muốn giống nhau).

Hoặc tạo file **`.nvmrc`** trong root repo với nội dung `20` — nhiều môi trường (kể cả Cloudflare) sẽ đọc để chọn Node.

### Bước 4: Deploy lần đầu

- Sau khi **Save**, Cloudflare sẽ chạy build ngay.
- Xem log trong **Deployments** để đảm bảo `npm run build` chạy thành công và output nằm trong `dist`.

### Bước 5: Truy cập site

- **Production URL:** `https://<project-name>.pages.dev`
- Mỗi lần push lên `main` sẽ trigger deploy mới.
- Mỗi commit/PR có **Preview URL** riêng (vd. `https://<commit-hash>.<project-name>.pages.dev`).

---

## 5. Custom domain (tùy chọn)

1. Trong project Pages: **Custom domains** → **Set up a custom domain**.
2. Nhập domain (vd. `dms.lemonaid.vn`).
3. Làm theo hướng dẫn thêm CNAME hoặc A/AAAA record tại nhà cung cấp DNS (hoặc dùng DNS của Cloudflare).
4. Cloudflare cấp SSL tự động.

---

## 6. Biến môi trường (khi tích hợp Supabase)

Khi chuyển từ mock sang Supabase, bạn sẽ cần:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Trong Cloudflare Pages: **Settings** → **Environment variables** → thêm từng biến cho **Production** (và **Preview** nếu cần). Vite chỉ embed biến có prefix `VITE_` vào client build.

---

## 7. Checklist triển khai

- [ ] Repo đã push lên GitHub/GitLab
- [ ] File `public/_redirects` có nội dung `/*    /index.html   200`
- [ ] Cloudflare Pages project đã tạo, connect đúng repo
- [ ] Build command: `npm run build`, output: `dist`
- [ ] (Khuyến nghị) Set `NODE_VERSION=20` hoặc tạo `.nvmrc`
- [ ] Build thành công, kiểm tra Production URL
- [ ] Test vài route SPA (vd. `/inventory`, `/deals`) — không bị 404
- [ ] (Tùy chọn) Thêm custom domain và biến môi trường khi dùng Supabase

---

## 8. Tài liệu tham khảo

- [Cloudflare Pages — Getting started](https://developers.cloudflare.com/pages/get-started/)
- [Cloudflare Pages — Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages — Redirects](https://developers.cloudflare.com/pages/configuration/redirects/) (cho `_redirects`)
