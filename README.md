# Ngọc Khánh Clinic Frontend

Frontend production cho hệ thống quản lý khám sức khỏe của Ngọc Khánh Clinic. Ưu tiên hiện tại là luồng khám sức khỏe đơn vị.

## Công nghệ

- Node.js 24.21.0 LTS
- pnpm 11.26.0
- Next.js 16.3.5, React 19, TypeScript
- TanStack Query, React Hook Form, Zod
- shadcn/ui, Tailwind CSS
- Vitest, Testing Library, Playwright

## Cài đặt và chạy

```bash
corepack enable
pnpm install
pnpm dev
```

Mở `http://localhost:3000`.

Các lệnh kiểm tra:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm check:terminology
pnpm build
```

Với thay đổi chỉ tài liệu/skill/hygiene, kiểm tra link, contract và git diff theo
[definition of done](PROJECT_RULES.md#28-definition-of-done).

## Cấu hình API

Đặt `NEXT_PUBLIC_API_BASE_URL` thành URL của backend, ví dụ:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Trong development, nếu biến này chưa được đặt, client dùng `http://localhost:8080`. Production phải đặt biến này khi build; Next.js đóng gói `NEXT_PUBLIC_*` vào client bundle nên đổi biến lúc chạy không cập nhật URL. Đây là URL công khai, không đặt secret vào biến `NEXT_PUBLIC_*`.

## Cấu trúc

```text
src/
├── app/          routes, layouts và composition
├── components/ui shadcn primitives
├── modules/      business modules
├── shared/       frontend capabilities dùng chung
├── widgets/      app shell và compositions lớn
├── providers/    React providers
└── lib/          framework utilities nhỏ
```

Luồng dữ liệu dùng module API và shared HTTP client:

```text
Page → Query/Mutation Hook → Module API → Shared HTTP Client → Backend
```

Backend HTTP contract là nguồn chuẩn. Fixtures chỉ được Vitest nạp trong test; ứng dụng không nạp fixtures khi chạy development hoặc production. Khi backend chưa có endpoint, UI báo tính năng chưa khả dụng.

## Trạng thái tích hợp

Backend hiện có list/tạo/xem/sửa/ngừng hoạt động organization, list/tạo/xem/sửa/xóa
batch, list danh mục dịch vụ đang hoạt động (`GET /api/v1/catalog/services`) và auth. Luồng
Staff đã nối đủ: **Đơn vị → Đợt khám** (danh sách trong tab Đợt khám của đơn vị, tạo, xem, sửa, xóa).
Đối chiếu [API inventory](../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md)
trước tích hợp; handler tồn tại không đồng nghĩa production đã cấp quyền truy cập.

Chưa hỗ trợ (backend chưa có endpoint): danh sách người khám, chi tiết khám (ma trận tiến độ),
báo cáo và xuất file. Ba tab tương ứng trong trang đợt khám hiển thị "Chưa hỗ trợ" và không gửi
request nào. Excel import đã bị bỏ khỏi hợp đồng ngày 2026-10-05 và code import FE đã được gỡ
ngày 2026-10-06 (xem [cleanup inventory](docs/maintenance/frontend-cleanup-inventory.md)).
Các việc còn lại được ghi tại [code follow-ups](docs/maintenance/code-follow-ups.md).
Production không dùng fixtures làm fallback.

## Chạy với backend thật (local)

1. Chạy backend với profile `local` (Flyway nạp thêm `db/local`: 2 khoa và 5 dịch vụ mẫu, không có
   tài khoản nào) cùng Redis; cấp một tài khoản STAFF có role cho môi trường local.
2. Đặt `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` (xem `.env.example`) rồi `pnpm dev`.
3. Smoke test trình duyệt thật (bỏ qua nếu thiếu biến môi trường; không commit thông tin đăng nhập):

```bash
E2E_STAFF_USERNAME=<staff> E2E_STAFF_PASSWORD=<mật khẩu> pnpm test:e2e:backend
```

`pnpm test:e2e` chạy các spec Playwright dùng backend giả lập trong trình duyệt
(`e2e/support/mock-backend.ts`, có trạng thái, 409/404/403) để kiểm tra luồng đợt khám và các tab chưa hỗ trợ.

## Quy ước

Đọc [AGENTS.md](AGENTS.md), [PROJECT_RULES.md](PROJECT_RULES.md), ADR liên quan và [kiến trúc frontend](docs/architecture/FRONTEND_ARCHITECTURE.md) trước thay đổi cấu trúc, state hoặc API. Dùng URL cho state có thể chia sẻ, TanStack Query cho server state, React Hook Form cho form state. Không thêm API hoặc trường DTO khi backend contract chưa có.
