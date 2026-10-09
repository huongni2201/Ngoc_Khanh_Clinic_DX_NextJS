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

Chuẩn bị Node.js và pnpm đúng phiên bản ở mục Công nghệ, sau đó chạy:

```bash
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

Đối chiếu ngày 2026-10-09 với [API inventory](../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md).
FE đã có các tích hợp sau; quyền truy cập backend vẫn quyết định từng request:

- Đăng nhập, khôi phục phiên và đăng xuất bằng session cookie.
- Đơn vị và đợt khám: danh sách, tạo, xem, sửa; ngừng hoạt động đơn vị và xóa đợt khám.
- Danh mục dịch vụ, cấu hình ngày khám và giá thỏa thuận của đợt khám.
- Participant: danh sách, thêm/sửa/hủy/khôi phục, tải mẫu và nhập Excel một bước.
- Chi tiết khám: danh sách, tổng hợp, xuất Excel và nhập file đối soát dịch vụ.
- Báo cáo thanh toán: JSON và tải DOCX.

**Còn lệch quyền Participant:** FE vẫn dùng mã quyền cũ và gộp quyền quản lý;
backend đã tách quyền theo thao tác. Các action/tab có thể bị ẩn với phiên có quyền mới.
Ngoài ra, Organization DELETE, Batch DELETE và catalog lookup có handler nhưng
chưa có rule cho phép trong authorization production. Chi tiết và tiêu chí sửa
ở [code follow-ups](docs/maintenance/code-follow-ups.md).

Visit preparation/check-in Participant → Patient → Encounter, chuyển trạng thái
đợt khám, in hồ sơ chính thức và các nghiệp vụ lâm sàng/tài chính phía sau chưa có
HTTP contract. Các workspace chưa được tích hợp hiển thị trạng thái chưa khả dụng.
Import roster hiện tại được khôi phục ngày 2026-10-06; luồng upload/mapping/preview/confirm/cancel cũ vẫn đã gỡ.

## Chạy với backend thật (local)

1. Chạy backend với profile `local`, PostgreSQL và Redis theo
   [backend operations](../Ngoc_Khanh_Clinic_DX_Springboot/docs/architecture/06-testing-and-operations.md).
   Dùng schema/migration tương thích và tài khoản STAFF có quyền theo contract của thao tác cần kiểm tra.
2. Đặt `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` (xem `.env.example`) rồi `pnpm dev`.
3. Smoke test trình duyệt thật (bỏ qua nếu thiếu biến môi trường; không commit thông tin đăng nhập):

```powershell
$env:E2E_STAFF_USERNAME = "<staff>"
$env:E2E_STAFF_PASSWORD = "<mật khẩu>"
pnpm test:e2e:backend
```

Ví dụ trên dùng PowerShell. Chỉ đặt credential trong môi trường local.
`pnpm test:e2e` chạy các spec Playwright dùng backend giả lập trong trình duyệt
(`e2e/support/mock-backend.ts`) cho auth, đợt khám, Participant, đối soát/báo cáo
và các workspace chưa hỗ trợ. Mock E2E không xác nhận authorization backend thật.

## Quy ước

Tra cứu [mục lục tài liệu](docs/README.md) cho hướng dẫn hiện hành, ADR và kết quả kiểm chứng.

Đọc [AGENTS.md](AGENTS.md), [PROJECT_RULES.md](PROJECT_RULES.md), ADR liên quan và [kiến trúc frontend](docs/architecture/FRONTEND_ARCHITECTURE.md) trước thay đổi cấu trúc, state hoặc API. Dùng URL cho state có thể chia sẻ, TanStack Query cho server state, React Hook Form cho form state. Không thêm API hoặc trường DTO khi backend contract chưa có.
