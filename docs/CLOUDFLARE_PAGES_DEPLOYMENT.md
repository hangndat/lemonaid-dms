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

**Tóm tắt:** Tạo project **Pages** (không phải Workers). Chỉ cần:
- **Build command:** `npm run build`
- **Build output directory:** `dist`  
Cloudflare sẽ tự build và deploy; không cần Deploy command.

**Lưu ý:** Cài GitHub App "Cloudflare Workers and Pages" trên GitHub **chưa tạo** project Pages. Bạn phải vào **Cloudflare Dashboard** và chọn **Create project** → **Pages** → Connect to Git → chọn repo thì project mới xuất hiện trong danh sách.

### Bước 0: Tạo project Pages trên Cloudflare (nếu chưa thấy project)

1. Mở **[Cloudflare Dashboard](https://dash.cloudflare.com/)** và đăng nhập.
2. Sidebar trái: chọn **Workers & Pages** (hoặc **Pages** nếu giao diện mới).
3. Bấm nút **Create** / **Create application** → chọn **Pages** (không chọn Workers — Workers dùng deploy command, Pages chỉ cần build config).
4. Chọn **Connect to Git** (không chọn "Direct Upload").
5. Chọn **GitHub** → authorize nếu được hỏi → chọn repo **hangndat/lemonaid-dms**.
6. Điền **Build configuration** (xem Bước 2 bên dưới) → **Save and Deploy**.

Sau khi tạo xong, project **lemonaid-dms** sẽ hiện trong danh sách tại Workers & Pages.

### Bước 1: Đẩy code lên Git (GitHub hoặc GitLab)

```bash
git add .
git commit -m "chore: add Cloudflare Pages config (_redirects)"
git push origin main
```

Đảm bảo repo đã connect với GitHub/GitLab (Cloudflare Pages hỗ trợ cả hai).

### Bước 2: Tạo project trên Cloudflare Pages

**Quan trọng:** Tạo project **Pages** (static site), không tạo **Workers**. Với Pages, Cloudflare tự build và deploy thư mục output — chỉ cần cấu hình build, không cần Deploy command.

1. Vào [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** (không chọn Workers) → **Connect to Git**.
2. Chọn **GitHub** (hoặc GitLab), authorize Cloudflare.
3. Chọn repository **lemonaid-dms**.
4. Điền cấu hình build (đủ cho SPA Vite):
   - **Project name:** `lemonaid-dms` (hoặc tên bạn muốn → subdomain `*.pages.dev`).
   - **Production branch:** `main`.
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** (để trống nếu repo là root).
   - **Deploy command:** Để trống (chỉ Workers mới bắt buộc; Pages tự deploy thư mục `dist` sau khi build).
   - **Environment variables (optional):** thêm khi cần (vd. `VITE_SUPABASE_URL`).

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

## 8. Xử lý lỗi thường gặp

### Build thành công nhưng deploy báo ERESOLVE / @cloudflare/vite-plugin

**Triệu chứng:** Log có `Success: Build command completed`, sau đó chạy `npx wrangler deploy` và báo lỗi peer dependency (vite@^6.1.0 với project đang dùng Vite 5).

**Nguyên nhân:** Project đang dùng **Deploy command** (ví dụ `npx wrangler deploy`). Với static SPA chỉ cần build và host `dist`, không cần Wrangler.

**Cách xử lý:** Nếu có thể xóa Deploy command thì xóa (chỉ giữ Build command + Build output directory). Nếu Cloudflare **bắt buộc** Deploy command, dùng lệnh chỉ upload thư mục đã build, không chạy setup Wrangler/Vite:
- **Deploy command:** `npx wrangler pages deploy dist --project-name=lemonaid-dms`
- Thay `lemonaid-dms` bằng đúng **Project name** trong Cloudflare. Lệnh này không cài `@cloudflare/vite-plugin`, tránh lỗi peer dependency. Lưu rồi **Retry deployment**.

### Site mở ra trang "Hello World" thay vì app DMS

**Nguyên nhân:** Deploy command đang là `true` (no-op) nên không có bước upload thư mục `dist` — Cloudflare vẫn phục vụ trang mặc định.

**Cách xử lý:** Dùng lại lệnh Wrangler để upload `dist`, và cấp token đủ quyền (xem mục dưới). Đổi **Deploy command** thành `npx wrangler pages deploy dist --project-name=lemonaid-dms`, thêm biến môi trường **CLOUDFLARE_API_TOKEN** (token có quyền Pages - Edit), rồi **Retry deployment**. Sau khi deploy thành công, site sẽ hiển thị app DMS.

### Deploy báo Authentication error [code: 10000] khi chạy `wrangler pages deploy`

**Triệu chứng:** Build thành công, nhưng bước deploy báo `A request to the Cloudflare API (.../pages/projects/...) failed. Authentication error [code: 10000]` và gợi ý kiểm tra API token.

**Nguyên nhân:** Token (biến `CLOUDFLARE_API_TOKEN` trong môi trường build) không có quyền **Cloudflare Pages - Edit** (deploy / ghi lên project Pages).

**Cách xử lý (chọn một):**

1. **Thử không dùng Wrangler deploy (nếu UI cho phép):** Đổi **Deploy command** thành lệnh “no-op” rồi lưu và chạy lại deployment:
   - **Deploy command:** `true`
   - Nếu sau khi build, Cloudflare vẫn tự deploy thư mục **Build output directory** (`dist`) thì không cần `wrangler pages deploy`. Nếu deploy vẫn báo lỗi hoặc không lên site thì dùng cách 2.

2. **Cấp token có quyền Pages và dùng cho deploy:**
   - Vào [Cloudflare Dashboard](https://dash.cloudflare.com/) → **My Profile** (góc phải) → **API Tokens** → **Create Token**.
   - Chọn **Create Custom Token** → **Get started**.
   - **Permissions:** phần **Account** → kéo danh sách tìm **"Cloudflare Pages"** hoặc **"Pages"** → chọn **Edit** (hoặc **Pages Write**). *(Lưu ý: template "Edit Cloudflare Workers" không có quyền Pages, phải tạo Custom Token.)*
   - **Account resources:** Include → chọn đúng account.
   - Tạo token, copy (chỉ hiển thị một lần).
   - Vào project **lemonaid-dms** → **Settings** → **Environment variables** → thêm/sửa **CLOUDFLARE_API_TOKEN** = token vừa tạo → Save.
   - **Retry deployment**.

3. **Lỗi "Project not found" [code: 8000007]:** Tên trong lệnh deploy không trùng với project trên Cloudflare. Vào **Workers & Pages** → xem **tên chính xác** của project (vd. `lemonaid-dms` hay `lemonaid-dms-xyz`). Sửa **Deploy command** hoặc lệnh local thành `--project-name=<tên đúng>` (ví dụ `--project-name=lemonaid-dms` nếu đúng tên là `lemonaid-dms`). Nếu chưa có project nào, tạo project Pages mới (Connect to Git → chọn repo) rồi dùng đúng tên đó.

4. **Nếu không thấy quyền Pages trong danh sách — deploy từ máy local (không cần API token):**
   - Trên máy đã clone repo, chạy: `npx wrangler login` (mở browser đăng nhập Cloudflare).
   - Build: `npm run build`
   - Deploy: `npx wrangler pages deploy dist --project-name=lemonaid-dms`
   - Mỗi lần cần cập nhật site, chạy lại hai lệnh build + deploy. Có thể thêm script trong `package.json`: `"deploy:pages": "npm run build && npx wrangler pages deploy dist --project-name=lemonaid-dms"`.

---

## 9. Tài liệu tham khảo

- [Cloudflare Pages — Getting started](https://developers.cloudflare.com/pages/get-started/)
- [Cloudflare Pages — Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages — Redirects](https://developers.cloudflare.com/pages/configuration/redirects/) (cho `_redirects`)
