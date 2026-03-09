# Phân tích UX & Kế hoạch cải thiện — DMS Lemonaide

Tài liệu phân tích trải nghiệm người dùng (UX) của DMS MVP hiện tại và đề xuất plan cải thiện theo từng nhóm ưu tiên.

---

## 1. Tổng quan hiện trạng

### 1.1 Điểm mạnh hiện có
- **Cấu trúc điều hướng rõ**: Sidebar cố định, menu Tổng quan / Kho xe / Lead / Deal / Khách hàng, dễ nhận diện.
- **Layout Pro**: ProLayout, PageContainer, ProTable thống nhất; màu sắc brand Lemonaide đã áp dụng.
- **Luồng nghiệp vụ đủ**: CRUD từng module, Lead → Deal, chi tiết có Sửa/Xóa/Thao tác phụ.
- **Tìm kiếm & lọc**: ProTable có search, filter (trạng thái, nguồn...), phân trang.
- **Xác nhận hành động nguy hiểm**: Modal.confirm trước khi xóa xe.
- **Loading cơ bản**: Spin khi load detail, loading trên form/nút khi submit.

### 1.2 Vấn đề UX cần cải thiện

| Nhóm | Vấn đề | Mức ảnh hưởng |
|------|--------|----------------|
| **Phản hồi** | Sau tạo/sửa/xóa không có message success → user không biết thao tác đã thành công. | Cao |
| **Phản hồi** | Lỗi (repo/network) không báo cho user, chỉ có thể thấy qua console. | Cao |
| **Đọc hiểu** | Trang chi tiết Lead/Deal hiển thị ID (assignedTo, customerId, interestedVehicleId, leadId, vehicleId) thay vì tên → khó đọc. | Cao |
| **Empty state** | Danh sách trống hoặc "Không tìm thấy" chỉ là chữ, không có Empty component hoặc CTA. | Trung bình |
| **Dashboard** | Lead/Deal theo trạng thái hiển thị bằng `<pre>` raw text → khó quét nhanh. | Trung bình |
| **Navigation** | Thiếu breadcrumb trong vùng nội dung → khó biết đang ở cấp nào (list vs detail). | Trung bình |
| **Loading** | Màn hình "Đang tải..." khi check auth chỉ là text, không thống nhất với Spin/Skeleton. | Thấp |
| **Form** | Một số form nhiều field, chưa có gợi ý (placeholder/tooltip) cho field dễ nhầm (VIN, giá triệu...). | Thấp |
| **Mobile** | Chưa kiểm tra kỹ form 2 cột, bảng dài trên màn nhỏ. | Thấp |

---

## 2. Kế hoạch cải thiện theo phase

### Phase 1 — Phản hồi & thông báo (ưu tiên cao)

**Mục tiêu:** User luôn biết thao tác thành công hay thất bại.

| # | Hạng mục | Mô tả | Cách làm gợi ý |
|---|----------|--------|-----------------|
| 1.1 | Success message | Sau khi tạo/sửa thành công (xe, lead, deal, khách) hiển thị thông báo ngắn. | Dùng `message.success()` (Ant Design) sau khi create/update thành công trong từng page/form handler. |
| 1.2 | Delete success | Sau khi xóa (xe, v.v.) hiển thị thông báo rồi redirect. | Trong `onOk` của `Modal.confirm`, sau `remove()` gọi `message.success('Đã xóa')` rồi `navigate()`. |
| 1.3 | Error handling | Khi repo/async lỗi, báo cho user thay vì im lặng. | Trong các handler async: `try/catch`, trong `catch` gọi `message.error('Lỗi: ...')` (có thể kèm nội dung lỗi đơn giản). |
| 1.4 | Form submit loading | Giữ trạng thái loading trên nút submit đến khi xong (đã có), đảm bảo không double-submit. | Đã có `loading={saving}`; có thể disable form hoặc nút khi `saving` nếu chưa có. |

**Chấp nhận:** Mọi thao tác tạo/sửa/xóa có feedback rõ ràng (success/error); lỗi không “nuốt” im.

---

### Phase 2 — Hiển thị tên thay vì ID (ưu tiên cao)

**Mục tiêu:** Trang chi tiết dễ đọc, không lộ ID nội bộ.

| # | Hạng mục | Mô tả | Cách làm gợi ý |
|---|----------|--------|-----------------|
| 2.1 | Lead detail | Hiển thị tên nhân viên (assignedTo), tên khách (customerId), tên/xe (interestedVehicleId). | Load thêm profiles, customers, vehicles (hoặc dùng map từ list); render tên + link đến detail tương ứng (optional). |
| 2.2 | Deal detail | Hiển thị tên nhân viên, lead (mô tả ngắn hoặc link), xe (brand/model), khách (tên). | Tương tự: resolve assignedTo, leadId, vehicleId, customerId sang tên; có thể link đến /leads/:id, /inventory/:id, /customers/:id. |
| 2.3 | List columns (optional) | Cột “Người phụ trách” / “Khách” hiển thị tên thay vì ID nếu dễ bổ sung. | ProTable columns: dùng render với map profile/customer đã load. |

**Chấp nhận:** Trang chi tiết Lead/Deal không còn hiển thị raw ID cho người dùng cuối.

---

### Phase 3 — Empty state & “Không tìm thấy” (ưu tiên trung bình)

**Mục tiêu:** Trạng thái trống rõ ràng, có hướng hành động.

| # | Hạng mục | Mô tả | Cách làm gợi ý |
|---|----------|--------|-----------------|
| 3.1 | Table empty | Khi ProTable không có bản ghi, hiển thị Empty đẹp + CTA (vd: “Thêm xe đầu tiên”). | Dùng `locale.empty` của ProTable hoặc `options.renderEmpty`; copy/icon phù hợp với từng module. |
| 3.2 | Not found | Trang detail khi không tìm thấy (id sai / đã xóa) dùng Empty + nút quay lại. | Thay `<p>Không tìm thấy...</p>` bằng `<Empty description="Không tìm thấy" />` + Button “Quay lại danh sách”. |

**Chấp nhận:** Không còn màn “trống trơn” chỉ toàn chữ; có nút/quay lại rõ ràng.

---

### Phase 4 — Dashboard dễ đọc (ưu tiên trung bình)

**Mục tiêu:** Số liệu Lead/Deal dễ quét, có thể click vào để đi sâu.

| # | Hạng mục | Mô tả | Cách làm gợi ý |
|---|----------|--------|-----------------|
| 4.1 | Lead theo trạng thái | Thay `<pre>` bằng danh sách Tag/Badge hoặc Row nhỏ (trạng thái + số). | Map `leadCounts` thành các Tag/Badge có số, hoặc Row Col với Statistic nhỏ. |
| 4.2 | Deal theo giai đoạn | Tương tự, hiển thị từng giai đoạn + số (Tag/Statistic). | Giống 4.1, có thể dùng màu nhẹ theo giai đoạn (vd closed_won xanh, closed_lost xám). |
| 4.3 | Link đến list (optional) | Click vào “Sẵn sàng: 5” → chuyển đến /inventory với filter status=available. | Wrap số liệu trong Link/Button với state hoặc query filter. |

**Chấp nhận:** Dashboard không còn block `<pre>`; số liệu đọc nhanh, tùy chọn click-through.

---

### Phase 5 — Navigation & ngữ cảnh (ưu tiên trung bình)

**Mục tiêu:** User luôn biết đang ở đâu và có thể quay lại nhanh.

| # | Hạng mục | Mô tả | Cách làm gợi ý |
|---|----------|--------|-----------------|
| 5.1 | Breadcrumb | Trong vùng nội dung (PageContainer) bật breadcrumb theo route. | PageContainer có prop `breadcrumb` hoặc dùng route để sinh breadcrumb (vd: Kho xe / Chi tiết / Honda City). |
| 5.2 | Link chéo trang | Ở Lead detail: link “Khách hàng” → /customers/:id; “Xe quan tâm” → /inventory/:id. Tương tự Deal. | Sau khi đã resolve ID → tên (Phase 2), thêm Link/Navigate đến URL tương ứng. |
| 5.3 | Protected route loading | Thay “Đang tải...” bằng Spin full page hoặc Skeleton ngắn. | Trong ProtectedRoute dùng `<Spin size="large" />` hoặc layout Skeleton thống nhất với app. |

**Chấp nhận:** Có breadcrumb trên các trang chính; link giữa Lead/Deal/Customer/Inventory rõ ràng.

---

### Phase 6 — Form & nhập liệu (ưu tiên thấp)

**Mục tiêu:** Giảm nhầm lẫn khi nhập, gợi ý rõ đơn vị.

| # | Hạng mục | Mô tả | Cách làm gợi ý |
|---|----------|--------|-----------------|
| 6.1 | Placeholder & đơn vị | Field giá (triệu VNĐ), VIN, số km có placeholder hoặc suffix rõ. | Form.Item với `addonAfter` hoặc placeholder "VD: 500", "17 ký tự", "km". |
| 6.2 | Tooltip gợi ý (optional) | Trường dễ nhầm (VIN, expectedPrice) có tooltip ngắn. | Wrap label trong Tooltip với mô tả 1 dòng. |
| 6.3 | Validation message | Message lỗi validate tiếng Việt, đủ rõ (đã có một phần, kiểm tra toàn bộ form). | rules: message: 'Vui lòng nhập Hãng', 'Giá phải lớn hơn 0', v.v. |

**Chấp nhận:** Form quan trọng có đơn vị/placeholder rõ; message validate thân thiện.

---

### Phase 7 — Responsive & a11y (ưu tiên thấp)

**Mục tiêu:** Dùng tốt trên màn nhỏ và trình đọc màn hình.

| # | Hạng mục | Mô tả | Cách làm gợi ý |
|---|----------|--------|-----------------|
| 7.1 | Form mobile | Form 2 cột (Row/Col) trên mobile nên 1 cột. | Col responsive: `xs={24} sm={24} md={12}` đã phổ biến; kiểm tra VehicleForm, LeadForm, DealForm, CustomerForm. |
| 7.2 | Table mobile | ProTable đã có scroll.x; đảm bảo không tràn ngang, có thể ẩn bớt cột trên mobile (optional). | ProTable columns có thể dùng hideInSetting / responsive. |
| 7.3 | Focus & keyboard | Sau khi tạo mới (vd xe) chuyển đến trang detail, focus vào tiêu đề hoặc nút Sửa (optional). | Sau navigate, không bắt buộc; nếu làm thì dùng ref + useEffect focus. |
| 7.4 | ~~Reset demo~~ (đã bỏ) | ~~Thay window.confirm bằng Modal.confirm~~. Tính năng Reset demo data đã được gỡ. | — |

**Chấp nhận:** Form và bảng dùng được trên mobile. (Reset demo đã bỏ.)

---

## 3. Thứ tự triển khai đề xuất

1. **Phase 1** — Phản hồi (message success/error): nhanh, ảnh hưởng lớn.
2. **Phase 2** — Hiển thị tên thay ID ở detail: cải thiện rõ độ “pro” của app.
3. **Phase 3** — Empty & Not found: ít thay đổi logic, cải thiện cảm giác hoàn thiện.
4. **Phase 4** — Dashboard: cải thiện trang đầu tiên sau đăng nhập.
5. **Phase 5** — Breadcrumb & link chéo: tăng mạch điều hướng.
6. **Phase 6 & 7** — Form và responsive/a11y: làm dần khi có thời gian.

---

## 4. Checklist tổng (để theo dõi)

- [x] **1.1** Message success khi tạo/sửa (xe, lead, deal, khách)
- [x] **1.2** Message success khi xóa
- [x] **1.3** Message error khi repo/async lỗi (try/catch)
- [x] **2.1** Lead detail: hiển thị tên assignedTo, customerId, interestedVehicleId
- [x] **2.2** Deal detail: hiển thị tên assignedTo, lead, xe, khách
- [x] **3.1** ProTable empty state (locale/empty component)
- [x] **3.2** Detail “Không tìm thấy” dùng Empty + nút quay lại
- [x] **4.1** Dashboard: Lead theo trạng thái không dùng `<pre>`
- [x] **4.2** Dashboard: Deal theo giai đoạn không dùng `<pre>`
- [x] **5.1** Breadcrumb trong PageContainer (hoặc tương đương)
- [x] **5.2** Link chéo từ Lead/Deal sang Customer, Inventory
- [x] **5.3** Protected route loading: Spin/Skeleton
- [x] **6.1** Placeholder/đơn vị cho field giá, VIN, km
- [x] **7.1** Form responsive (kiểm tra)
- [x] **7.4** Reset demo đã bỏ (không còn trong UI)

---

## 5. Ghi chú

- **Scope:** Plan này tập trung UX trong phạm vi MVP hiện tại (mock data, single dealer).
- **Supabase:** Khi chuyển sang Supabase, giữ nguyên pattern message/error và empty state; chỉ đổi nguồn dữ liệu và có thể bổ sung loading/error từ API.
- **Đo lường:** Sau khi làm Phase 1–3 có thể demo với 2–3 user nội bộ để thu thêm ý kiến (clarity, thao tác, lỗi).

Nếu bạn muốn, có thể bắt đầu triển khai từ **Phase 1** (message success/error) trước.
