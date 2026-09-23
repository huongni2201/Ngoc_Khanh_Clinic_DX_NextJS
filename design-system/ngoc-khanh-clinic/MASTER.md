# Ngọc Khánh Clinic — Master Design System

> **Source of Truth**: Quy chuẩn thiết kế giao diện, bảng màu và tương tác dành cho hệ sinh thái quản lý phòng khám Ngọc Khánh Clinic theo tiêu chuẩn **UI-UX Pro Max**.

---

## 1. Triết lý Thiết kế (Design Philosophy)

- **Định hướng thẩm mỹ**: Healthcare Enterprise — Hiện đại, thân thiện, sạch sẽ, chuẩn mực y khoa, ít bão hòa để giảm mệt mỏi thị giác cho nhân viên y tế làm việc nhiều giờ.
- **Đối tượng trọng tâm**: Lễ tân (tiếp đón nhanh, đối soát danh sách), Bác sĩ (chẩn đoán tập trung, rõ ràng), Bệnh nhân / Doanh nghiệp (tin cậy, chuyên nghiệp).
- **Hệ thống Design Token**: `src/app/globals.css` là Single Source of Truth duy nhất. Tuyệt đối không dùng mã màu tùy tiện (`bg-[#...]`, `text-[#...]`) hay màu inline.

---

## 2. Bảng màu Chuẩn (Color Palette)

Hệ thống màu gồm 18 mã màu được tối ưu hóa cho độ tương phản WCAG 2.1 AA (tối thiểu 4.5:1 với body text, 3:1 với UI elements).

### 2.1. Brand & Actions

| Tên Token | Hex Code | Tên biến CSS | Mục đích & Áp dụng |
| :--- | :--- | :--- | :--- |
| **Primary** | `#2563EB` | `--primary`, `--sidebar-primary`, `--ring` | Nút hành động chính (CTA), liên kết nổi bật, trạng thái tích cực |
| **On Primary** | `#FFFFFF` | `--primary-foreground` | Chữ / biểu tượng trên nền Primary |
| **Secondary** | `#3B82F6` | `--brand-secondary` | Màu thương hiệu phụ, điểm nhấn phụ trợ |
| **On Secondary** | `#FFFFFF` | `--brand-secondary-foreground` | Chữ / biểu tượng trên nền Secondary |

### 2.2. Semantic Status

| Trạng thái | Hex Code | Nền Badge (Bg) | Tên biến CSS | Mục đích & Áp dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `#10B981` | `#ECFDF5` | `--status-success`, `--status-completed` | Hoàn thành khám, nhập file thành công, trạng thái hợp lệ |
| **Warning** | `#F59E0B` | `#FFFBEB` | `--status-warning` | Cảnh báo, chờ khám/chờ xử lý, dữ liệu cần rà soát |
| **Danger** | `#EF4444` | `#FEF2F2` | `--destructive`, `--status-danger` | Lỗi dữ liệu, hủy đợt khám, thao tác xóa/nguy hiểm |
| **Info** | `#0EA5E9` | `#F0F9FF` | `--status-in-progress`, `--info` | Đang thực hiện khám, thông tin hướng dẫn, thông báo |

*Lưu ý: Luôn kết hợp màu trạng thái cùng với icon hoặc nhãn văn bản (không truyền đạt thông tin chỉ bằng màu sắc).*

### 2.3. Surfaces & Interactive States

| Trạng thái / Bề mặt | Hex Code | Tên biến CSS | Mục đích & Áp dụng |
| :--- | :--- | :--- | :--- |
| **Background** | `#F8FCFF` | `--background`, `--table-header-bg` | Nền trang tổng thể, sắc xanh pha trắng dịu mắt |
| **Surface** | `#FFFFFF` | `--card`, `--popover`, `--sidebar` | Bề mặt thẻ Card, hàng trong bảng dữ liệu, Modal / Dialog |
| **Surface Alt** | `#F1F5FF` | `--surface-alt`, `--secondary`, `--muted`, `--accent` | Vùng nền phụ, ô tìm kiếm phụ, header nhóm |
| **Hover** | `#E0EDFF` | `--hover`, `--login-decor-shape` | Nền khi rê chuột qua hàng bảng, nút thứ cấp, menu |
| **Active** | `#DBEAFE` | `--active` | Nền khi nhấn giữ hoặc khi đang tương tác |
| **Selected** | `#EFF6FF` | `--selected`, `--sidebar-active-bg`, `--sidebar-accent` | Nền menu đang mở, tab đang chọn, dòng đang chọn |

### 2.4. Typography, Borders & Disabled

| Thành phần | Hex Code | Tên biến CSS | Mục đích & Áp dụng |
| :--- | :--- | :--- | :--- |
| **Text Primary** | `#0F172A` | `--foreground`, `--card-foreground` | Tiêu đề chính, tên bệnh nhân, số CCCD, nội dung cốt lõi |
| **Text Secondary** | `#475569` | `--secondary-text`, `--secondary-foreground` | Mô tả phụ, nhãn thông số, tên công ty phụ |
| **Text Muted** | `#94A3B8` | `--muted-foreground` | Thời gian ghi nhận, ghi chú mờ, placeholder |
| **Border** | `#E2E8F0` | `--border`, `--input`, `--sidebar-border` | Đường viền thẻ card, ô nhập liệu, đường phân chia cụm |
| **Divider** | `#F1F5F9` | `--divider`, `--table-divider` | Đường phân cách thanh mảnh giữa các dòng dữ liệu |
| **Disabled** | `#CBD5E1` | `--disabled` | Nút, checkbox, ô nhập ở trạng thái vô hiệu |

---

## 3. Quy tắc Áp dụng Nhanh (Quick Rules)

1. **Primary dành riêng cho CTA & Trạng thái Quan trọng**:
   - Chỉ dùng nút `bg-primary` cho hành động chính của màn hình (ví dụ: "Tạo đợt khám", "In sổ khám", "Xác nhận kết quả").
   - Các hành động bổ trợ dùng `variant="outline"`, `variant="ghost"` hoặc nền `bg-surface-alt`.
2. **Nền tổng thể sáng, sạch, ít bão hòa**:
   - Sử dụng `bg-background` (`#F8FCFF`) để tạo cảm giác không gian y tế vô trùng, hiện đại và thanh lịch.
3. **Card trắng, Border nhẹ, Shadow rất mềm**:
   - Card dùng `bg-card` (`#FFFFFF`), `border-border` (`#E2E8F0`), bo góc `rounded-lg` (hoặc `rounded-xl`), kết hợp `shadow-2xs` hoặc `shadow-xs`. Tránh shadow đen nặng.
4. **Trạng thái dùng màu Semantic rõ ràng**:
   - Luôn sử dụng cặp màu chuẩn: `bg-status-*-bg` kết hợp chữ `text-status-*` và icon tương ứng.
5. **Typography Sans-serif, Dễ đọc, Chuyên nghiệp**:
   - Phông chữ chủ đạo: Inter (sans-serif).
   - Tương phản tối ưu giữa Text Primary (`#0F172A`) trên nền trắng hoặc xanh nhạt.

---

## 4. Bảng Kiểm tra Trước khi Chuyển giao (Pre-Delivery Checklist)

- [x] Không sử dụng mã hex tự do trong component JSX/TSX.
- [x] Mọi màu sắc tham chiếu thông qua semantic utility classes (`bg-background`, `bg-primary`, `bg-card`, `border-border`, `text-secondary-foreground`, v.v.).
- [x] Chế độ Dark mode đồng bộ tương phản và ánh xạ hợp lý.
- [x] Tương phản văn bản đạt chuẩn WCAG AA (>= 4.5:1).
- [x] Trạng thái tương tác (Hover, Active, Focus-visible, Disabled) phản hồi mượt mà và trực quan.
