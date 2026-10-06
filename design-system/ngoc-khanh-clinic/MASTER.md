# Ngọc Khánh Clinic — Master Design System

> Tham chiếu thiết kế giao diện và tương tác. [PROJECT_RULES §15](../../PROJECT_RULES.md#15-ui--ux)
> sở hữu chính sách màu; `src/app/globals.css` sở hữu giá trị token đang chạy.
> Bảng dưới mô tả palette hiện tại, không phải chứng nhận đạt WCAG AA.

---

## 1. Triết lý Thiết kế (Design Philosophy)

- **Định hướng thẩm mỹ**: Healthcare Enterprise — Hiện đại, thân thiện, sạch sẽ, chuẩn mực y khoa, ít bão hòa để giảm mệt mỏi thị giác cho nhân viên y tế làm việc nhiều giờ.
- **Đối tượng trọng tâm**: Lễ tân (tiếp đón nhanh, đối soát danh sách), Bác sĩ (chẩn đoán tập trung, rõ ràng), Bệnh nhân / Doanh nghiệp (tin cậy, chuyên nghiệp).
- **Hệ thống Design Token**: Theo [chính sách token](../../PROJECT_RULES.md#15-ui--ux);
  kiểm tra `src/app/globals.css` khi sửa UI, thay vì chép giá trị từ bảng này.

---

## 2. Bảng màu Chuẩn (Color Palette)

Kiểm tra từng cặp foreground/background ở trạng thái thực tế. Màu riêng lẻ không
thể được gắn nhãn “đạt AA”. Các giới hạn đo được được ghi ở phần kiểm tra bên dưới.

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
| **Success** | `#10B981` | `#ECFDF5` | `--status-success`, `--status-completed` | Hoàn thành khám, lưu dữ liệu thành công, trạng thái hợp lệ |
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
   - Kiểm tra tương phản cặp token trước khi dùng `bg-status-*-bg` với `text-status-*`.
     Palette hiện tại có cặp chưa đủ tương phản cho chữ nhỏ; cần sửa token trong task UI riêng.
5. **Typography Sans-serif, Dễ đọc, Chuyên nghiệp**:
   - Phông chữ chủ đạo: Inter (sans-serif).
   - Tương phản tối ưu giữa Text Primary (`#0F172A`) trên nền trắng hoặc xanh nhạt.

---

## 4. Bảng Kiểm tra Trước khi Chuyển giao (Pre-Delivery Checklist)

- [ ] Kiểm tra component dùng semantic tokens và không có màu tùy tiện.
- [ ] Đo từng cặp chữ/nền ở light/dark và các trạng thái tương tác.
- [ ] Kiểm tra keyboard, focus, thông báo trạng thái và khả năng đọc ở màn hình thực tế.

Các ô trên là việc cần kiểm tra cho mỗi thay đổi UI, không phải kết quả đã chạy.
Cập nhật 2026-10-06: giá trị trong `globals.css` đã được chỉnh theo số đo. Trước khi
sửa, `#94A3B8` trên `#FFFFFF` chỉ đạt khoảng **2.56:1**, và đo các cặp chữ/nền ở light
và dark thì có 48 cặp dưới 4.5:1 (muted, các màu trạng thái, destructive, chữ trắng trên
brand-secondary và trên nút primary ở dark mode). Sau khi sửa, mọi cặp chữ/nền dùng bởi
component đạt tối thiểu 4.5:1 theo [WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
kể cả chữ trạng thái trên nền tint 10% của chính nó; viền `--input` của ô nhập liệu
đạt 3:1. Ràng buộc này được test `src/config/__tests__/color-contrast.test.ts` giữ lại:
đổi token trong `globals.css` làm tụt dưới ngưỡng sẽ làm test fail.

Ngoại lệ có chủ ý: `--disabled-foreground` trên `--disabled` (thành phần bị vô hiệu hóa được
WCAG miễn trừ, hiện chưa có component dùng) và `--border`/`--divider` (đường kẻ trang trí,
không phải ranh giới của control). Chưa kiểm tra trạng thái focus/hover trên màn hình thực
bằng trình duyệt.
