# Ngọc Khánh Clinic — Master Design System

> Tham chiếu thiết kế giao diện và tương tác. [PROJECT_RULES §15](../../PROJECT_RULES.md#15-ui--ux)
> sở hữu chính sách màu; [globals.css](../../src/app/globals.css) sở hữu giá trị token light/dark đang chạy.
> Cập nhật 2026-10-09: bảng dưới hướng dẫn cách dùng token, tránh chép lại giá trị màu.

## 1. Triết lý thiết kế

- Healthcare enterprise: chuyên nghiệp, bình tĩnh, ít bão hòa, dễ đọc khi làm việc nhiều giờ.
- Desktop-first, workflow-first; ưu tiên khám sức khỏe đơn vị và giảm tải nhận thức.
- Typography: Inter; primitives: shadcn Mira; icons: Hugeicons qua adapter dùng chung.
- Component dùng semantic tokens theo PROJECT_RULES; màu trạng thái đi cùng icon hoặc nhãn.

## 2. Token màu và cách dùng

Đọc giá trị trong globals.css; kiểm tra từng cặp foreground/background ở trạng
thái thực tế. Dùng cặp token tương ứng, bao gồm foreground và background.

### 2.1. Brand & Actions

| Vai trò | Token | Cách dùng |
|---|---|---|
| Hành động chính | `primary` / `primary-foreground` | CTA; dùng foreground tương ứng cho chữ/icon. |
| Thương hiệu phụ | `brand-secondary` / `brand-secondary-foreground` | Điểm nhấn phụ trợ. |
| Sidebar | `sidebar` / `sidebar-foreground`, `sidebar-accent` / `sidebar-accent-foreground` | Navigation theo cặp token sidebar riêng. |
| Focus | `ring` / `sidebar-ring` | Focus indicator của control và navigation. |

### 2.2. Semantic Status

| Trạng thái | Token chữ / nền | Cách dùng |
|---|---|---|
| Success | `status-success` / `status-success-bg`, `status-completed` / `status-completed-bg` | Lưu thành công hoặc hoàn thành theo nhãn nghiệp vụ. |
| Warning | `status-warning` / `status-warning-bg` | Cảnh báo, chờ xử lý. |
| Danger | `status-danger` / `status-danger-bg` | Lỗi/hủy; action destructive dùng cặp `destructive` / `destructive-foreground`. |
| Info | `status-in-progress` / `status-in-progress-bg`, `info` / `info-bg` | Đang thực hiện, hướng dẫn. |
| Workflow | `status-diagnostic` / `status-diagnostic-bg`, `status-conclusion` / `status-conclusion-bg` | Stage suy ra cho UI; không thay lifecycle backend. |

### 2.3. Surfaces & Interactive States

| Bề mặt | Token | Cách dùng |
|---|---|---|
| Nền trang | `background` / `foreground` | Nền và nội dung chính. |
| Card / popover | `card` / `card-foreground`, `popover` / `popover-foreground` | Card, modal và nội dung nổi. |
| Nền phụ | `surface-alt`, `secondary`, `muted`, `accent` | Dùng foreground tương ứng khi token có cặp. |
| Header bảng | `table-header-bg` / `table-header-fg` | Header dùng cặp token riêng. |
| Tương tác | `hover`, `active`, `selected` | Hover, nhấn và chọn; kiểm tra chữ/focus trên từng nền. |

### 2.4. Typography, Borders & Disabled

| Thành phần | Token | Cách dùng |
|---|---|---|
| Chữ chính | `foreground`, `card-foreground` | Tiêu đề, nội dung và danh tính. |
| Chữ phụ | `secondary-text`, `secondary-foreground`, `muted-foreground` | Nhãn, ghi chú, placeholder; kiểm tra trên nền thực tế. |
| Viền control | `input` | Ranh giới ô nhập; phân biệt với viền trang trí. |
| Viền trang trí | `border`, `sidebar-border`, `divider`, `table-divider` | Card, sidebar và phân cách dòng. |
| Disabled | `disabled` / `disabled-foreground` | Control vô hiệu; vẫn cần nhãn/trạng thái rõ ràng. |

## 3. Quy tắc áp dụng nhanh

1. Dùng `bg-primary` cho hành động chính. Hành động bổ trợ dùng Button
   `variant="outline"` hoặc `variant="ghost"` hiện có.
2. Nền trang dùng `bg-background`; card dùng `bg-card`, `text-card-foreground`,
   `border-border`. Kiểm tra cả light và dark mode.
3. Card ưu tiên `rounded-lg` hoặc `rounded-xl`, `shadow-2xs` hoặc `shadow-xs`.
4. Ưu tiên [StatusPill](../../src/shared/ui/status-pill.tsx) và các component hiện có;
   kiểm tra tương phản khi ghép `text-status-*` với `bg-status-*-bg`.
5. Dùng foreground tương ứng với nền; giữ chữ phụ rõ ràng thay vì giảm opacity.

## 4. Kiểm tra trước bàn giao

- [ ] Component dùng semantic tokens và tái sử dụng UI hiện có.
- [ ] Đo các cặp chữ/nền ở light/dark và trạng thái tương tác.
- [ ] Kiểm tra keyboard, focus, thông báo trạng thái và khả năng đọc trên màn hình thực.

Các ô trên là việc cần kiểm tra cho mỗi thay đổi UI, không phải kết quả đã chạy.
[Test tương phản](../../src/config/__tests__/color-contrast.test.ts) kiểm tra những
cặp token đã khai báo; không chứng nhận mọi component hoặc trạng thái tương tác.
Lần sửa docs này không chạy lại kiểm thử UI hoặc xác nhận focus/hover trong trình duyệt.
