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
pnpm build
```

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

Organization CRUD và danh sách participant của batch đang gọi backend. Participant import chỉ hoạt động khi các API backend tương ứng (template, upload, mapping/validation, row preview, confirm, cancel) được triển khai cùng frontend. Batch list/create, service catalog, reports, authentication và patient/reception/doctor/appointment/billing APIs vẫn chưa có đủ contract trong checkout hiện tại. Production không nạp fixtures cho các endpoint còn thiếu.

## Quy ước

Đọc [AGENTS.md](AGENTS.md), [PROJECT_RULES.md](PROJECT_RULES.md), ADR liên quan và [kiến trúc frontend](docs/architecture/FRONTEND_ARCHITECTURE.md) trước thay đổi cấu trúc, state hoặc API. Dùng URL cho state có thể chia sẻ, TanStack Query cho server state, React Hook Form cho form state. Không thêm API hoặc trường DTO khi backend contract chưa có.
