# Kế hoạch nối FE–backend clean-slate và tối ưu frontend

> **For agentic workers:** Khi được yêu cầu triển khai, dùng `superpowers:executing-plans` để thực hiện từng task; chỉ dùng `superpowers:subagent-driven-development` khi phương thức đó được chọn. Các checkbox dưới đây là công việc dự kiến, chưa phải kết quả thực hiện.

**Goal:** Đưa luồng khám đoàn lên hợp đồng backend hiện tại, loại bỏ hành vi cũ không còn được hỗ trợ và tối ưu FE bằng số đo trước/sau.

**Architecture:** Giữ Next.js App Router và module theo domain đã được chấp nhận. Route compose module; component → query/mutation hook → module API → shared HTTP → backend. Transport DTO bám HTTP; mapper chuyển sang view model khi cần.

**Tech Stack:** Next.js 16.3.5, React 19.2.8, TypeScript, TanStack Query, React Hook Form, Zod, shadcn Mira, Hugeicons, Vitest/Testing Library, Playwright; pnpm 11.26.0. Đây là phiên bản khai báo trong repo, chưa xác minh runtime máy.

**Spec:** [PROJECT_RULES](../../../PROJECT_RULES.md), [kiến trúc FE](../../architecture/FRONTEND_ARCHITECTURE.md), [ADRs](../../adr/README.md), [HTTP inventory backend](../../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md), [domain/workflows backend](../../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/architecture/03-domain-and-workflows.md).

**Trạng thái:** Đề xuất để review, chỉ viết plan; chưa sửa runtime, chạy kiểm thử hay xác nhận backend hoạt động. Phạm vi mặc định: auth → đơn vị → đợt khám; phần còn lại có roadmap và điều kiện mở. “Kiến trúc mới” được hiểu là clean-slate backend và ADR frontend hiện hành.

**Bổ sung của chủ dự án — 2026-10-06:** Thống nhất tên `company`/`enterprise` thành `organization` khi cùng chỉ domain đơn vị; rà các thuật ngữ khác trên toàn FE và xóa phần không còn cần/đã bị thay thế. Phạm vi audit tên và code cũ gồm mọi module, routes, tests, fixtures, scripts, dependencies và tài liệu hiện hành; phạm vi tích hợp backend vẫn theo thứ tự ở dưới. [Danh sách đã khảo sát và quyết định dọn dẹp](../../maintenance/frontend-cleanup-inventory.md) là checklist bắt buộc, không chỉ đổi tên ở màn đơn vị.

## 1. Kết quả khảo sát và xung đột cần xử lý

Đã đối chiếu mã FE, controller/request/response backend và tài liệu trong hai checkout. Backend và tài liệu đang có thay đổi; trước mỗi task phải kiểm tra lại các file liên quan, giữ nguyên thay đổi của người khác.

| Vùng | Bằng chứng hiện tại | Quyết định trong plan |
|---|---|---|
| Đơn vị | `OrganizationController` đã có list/create/get/update/delete. Tài liệu FE vẫn ghi list chưa có. | Ghi nhận tài liệu FE cũ; cập nhật inventory FE theo controller, không tắt list theo follow-up cũ. |
| DTO đơn vị | FE cũ dùng `contactName/contactJobTitle/note`; contract hiện hành dùng `name`, `taxCode`, liên hệ chung, `contactFullName/contactEmail`, `rowVersion`; không còn `code`, `organizationType` hoặc `contactPosition`. | Sửa schema, mapper, form và fixtures cùng task; không chỉ sửa URL. `taxCode` là tùy chọn và duy nhất khi có giá trị. |
| Ngừng hoạt động đơn vị | BE DELETE cần `rowVersion`, trả 204; FE hiện chỉ gửi ID. | Truyền version, xử lý 409; thể hiện là ngừng hoạt động, giữ lịch sử đợt khám. |
| Đợt khám | FE gửi start/end, `COMPANY`, `negotiatedUnitPrice`; BE nhận `examinationDates`, `ORGANIZATION_SITE`, `negotiatedPrice`. | Viết lại phần cấu hình form/adapter theo DTO thật. |
| Batch response | BE trả `days`, `rowVersion`, service price snapshots; FE còn đòi reason/payer/template/service labels cũ. | Parse đúng response; không chế tên dịch vụ, template ID hoặc thông tin không có. |
| Batch status | FE transport có thêm IN_PROGRESS, RESULT_PROCESSING, CANCELED, DELETED. | Chỉ DRAFT/READY/FINALIZED/CLOSED. Trạng thái hồ sơ/điểm danh/đối soát tách riêng. |
| CSRF | Auth API lấy token JSON; business `apiClient.post/put/delete` chưa thêm CSRF. BE bật CSRF cho unsafe requests. | Bổ sung cơ chế dùng chung trước khi nghiệm thu thao tác ghi. |
| Catalog | `fetchClinicalServiceCatalog` trả unavailable; chưa có handler catalog. | Chặn tạo batch trên UI cho đến khi có nguồn service ID thật được hỗ trợ. Không nhập ID tùy tiện hoặc dùng danh mục giả. |
| Các route còn thiếu | Chưa có batch detail/update/delete, participant list/add/visit preparation, print handler. | Hiển thị unavailable/disabled và không gửi request tới endpoint tự suy đoán. |
| Excel | Backend đã bỏ import; FE còn API, hook, dialog và CTA import. | Xóa chuỗi import cùng những test chỉ còn mô tả tính năng đã bỏ. Không xây import thay thế. |
| Nền auth | Cookie-aware transport, timeout, AuthBoundary, sync session đã có. | Tái sử dụng; không viết lại login hoặc thêm JWT/localStorage/BFF. |
| E2E | `playwright.config.ts` trỏ `./e2e`; thư mục đó chưa có trong lần khảo sát. | Tạo test thực tế, kiểm tra test discovery; exit code không có test không phải nghiệm thu. |

**Điều kiện backend:** [API/security](../../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/architecture/05-api-and-security.md) và source security hiện chặn business routes ở default/production, local/test yêu cầu STAFF có role. [Backend follow-ups](../../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/maintenance/code-follow-ups.md) còn ghi controller batch tham chiếu use-case bị xóa và rủi ro profile hỗn hợp. Đây là các điểm phải xác minh lại bằng build/test/runtime backend; không kết luận backend đang build lỗi chỉ từ tài liệu, không bật local/test trên production để vượt chặn.

## 2. Hướng thực hiện

**Chọn migration theo từng luồng nghiệp vụ.** Mỗi PR có contract, UI và test tương ứng, chạy được trên phạm vi hỗ trợ. Cách này giữ UI/component tốt đang có và cô lập chỗ phụ thuộc backend.

Hai phương án không chọn: chỉ vá DTO/URL sẽ bỏ sót form, CSRF và state; viết lại toàn bộ FE sẽ tăng rủi ro và vẫn bị chặn bởi API thiếu. Không thêm lớp repository/service/use-case vào FE chỉ để giống cấu trúc Java.

Luồng dữ liệu mục tiêu:

```text
app (route/layout)
  → modules/<domain>/pages + components
    → hooks (query key, cache, mutation lifecycle)
      → api (endpoint + DTO validation + mapping)
        → shared/api (cookie, CSRF, timeout, errors, cancellation)
          → backend
```

Quyền sở hữu state: Query cho dữ liệu server, RHF cho form, Zod cho boundary, URL cho tìm kiếm/phân trang/tab cần bookmark, React cho dialog/selection cục bộ. Chỉ giữ Zustand khi có state client thực sự cần nhiều vùng giao diện.

### Global constraints

- Dùng pnpm; giữ lockfile; không nâng framework trong migration.
- Không invent endpoint, DTO, capability response, trạng thái hay production mock fallback.
- Giữ Participant khác Patient; thêm roster không tạo Patient/Encounter; visit preparation mới liên kết theo CCCD chính xác. Không chặn người dưới 18 tuổi.
- Ngày lưu ISO LocalDate; timestamp UTC; chỉ format ở presentation.
- Giữ direct browser → BE với HttpOnly cookie, `credentials: include`, no-store và timeout 15 giây theo ADR-0005/0006. Chuyển sensitive fetch sang server cần quyết định auth riêng.
- Không tự retry mutation, 400/401/403/409; 403 không phải logout, outage không phải phiên đã bị thu hồi.
- Public module exports qua `index.ts`; không tạo folder/framework capability hoặc query-key toàn cục dư thừa.
- `Organization`/`organizationId`/`organizationName` là tên domain thống nhất; UI chung dùng “Đơn vị”. Organization không có field `organizationType`; site type cũ `COMPANY` phải thành `ORGANIZATION_SITE`. Không replace chuỗi hàng loạt làm sai contract.
- Participant dùng cho người khám trong đợt; StaffMember dùng cho nhân sự phòng khám; không đổi mọi chữ “nhân viên” thành Participant. Appointment/Encounter, ClinicalService/ServiceRequest/DiagnosticReport, Invoice/Payment/PaymentReceipt giữ ý nghĩa riêng.
- Xóa code khi luồng đã bị bỏ, đã có thay thế hoặc không còn consumer/entry point; kiểm tra dynamic imports, public exports, framework routes, scripts/config và test trước. API chưa có không tự chứng minh một module là dead code.
- Dùng lại `ScreenLayout`, `PageHeader`, `ScreenLoadingSkeleton`, `DataTablePagination`, `MoneyInput`, adapter icon và primitives đang có. Chưa có lý do thêm primitive mới.
- Semantic colors chỉ từ `globals.css`; copy tiếng Việt; không ghi log payload bệnh nhân hoặc token.

### Review focus

1. Token CSRF lấy lỗi/phiên đổi trong lúc ghi: không gửi write thiếu token, không tự gửi lại write (Task 1).
2. Hai người cập nhật/ngừng hoạt động cùng version: giữ dữ liệu form, báo 409 và tải lại có chủ đích (Task 2).
3. Search nhanh, đổi trang/đơn vị rồi request cũ về: không hiển thị dữ liệu scope cũ (Task 2, 5).
4. Tạo batch thành công nhưng route detail chưa có: không redirect sang màn gọi API 404; reload list vẫn thấy bản ghi (Task 4).
5. Mất quyền nhưng user ID không đổi, hoặc truy cập deep link của tính năng bị tắt: không mount business content/gửi request không hỗ trợ (Task 1, 3, 7).

## 3. Các task triển khai

### Task 0 — Chốt snapshot contract và baseline

**Files:** cập nhật `docs/maintenance/code-follow-ups.md`, `docs/architecture/FRONTEND_ARCHITECTURE.md`, các đoạn outdated trong `PROJECT_RULES.md`/`AGENTS.md` nếu còn tồn tại; tạo `docs/maintenance/fe-integration-matrix.md` và `docs/maintenance/fe-performance-baseline.md`.

**Produces:** ma trận route/HTTP method/DTO/status/quyền/profile/nguồn dữ liệu, phân biệt có source, đã chạy local và được phép production.

- [ ] Recheck git status và controller/DTO, ghi commit cùng tình trạng uncommitted của cả hai repo; không reset/stash công việc khác.
- [ ] Sửa mô tả “organization list chưa có”; ghi list/delete mới cùng version conflict và active-only semantics. Không đổi lịch sử ADR đã accepted.
- [ ] Chạy `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm check:terminology`; lưu lỗi có sẵn riêng khỏi lỗi migration.
- [ ] Ghi điều kiện backend build/start, PostgreSQL/Redis, base URL, CORS origins, test account/role qua biến môi trường. Backend build repair và RBAC là work item bên BE, không tự sửa trong task FE.
- [ ] Đo bản production tại login, danh sách đơn vị, chi tiết đơn vị/tab batch: JS tải lần đầu, số request, thời gian tương tác bằng browser profiler. Dùng dữ liệu tổng hợp, cùng máy/cấu hình, 5 lần đo và median; không đo dev build rồi so với production.

**Gate:** inventory có bằng chứng source, baseline có kết quả thật hoặc blocker cụ thể. Không đánh dấu benchmark đã có nếu chưa chạy ứng dụng.

### Task 0A — Chuẩn hóa thuật ngữ toàn FE và guard chống tái xuất hiện

**Files:** `scripts/check-terminology.mjs`, `src/config/medical-terminology.ts`, `src/config/__tests__/medical-terminology.test.ts`; `src/modules/reception/components/today-appointments-dialog.tsx`; `src/modules/appointments/components/create-appointment-dialog.tsx`; `src/modules/health-examinations/components/participants-tab/participants-tab.tsx`; các route legacy và fixtures trong [cleanup inventory](../../maintenance/frontend-cleanup-inventory.md). Contract enum batch đổi cùng Task 4 để không có trạng thái migration nửa chừng.

**Produces:** bảng tên chuẩn có ngữ cảnh, danh sách ngoại lệ cụ thể có lý do và terminology guard kiểm tra cả paths lẫn identifiers/copy thuộc domain; không miễn toàn bộ module.

- [ ] Audit tất cả module auth/organizations/health-examinations/appointments/patients/encounters/reception/doctor/billing và app/shared/widgets/providers/lib/config; phân loại mỗi finding là đổi tên, xóa, chuyển đổi, giữ hợp lệ hoặc phụ thuộc backend. Ghi consumer và bằng chứng cho quyết định xóa.
- [ ] Đổi `matchCompany` → `matchOrganization`, placeholder tìm công ty → đơn vị; appointment copy “Nhân viên trong đợt khám” → “Người khám trong đợt khám”. Sửa test description/fixture keys `employeeCode` → `participantCode` khi chỉ cùng một khái niệm, bỏ mapper trung gian cũ sau khi fixture dùng model hiện hành trực tiếp.
- [ ] Kiểm tra type/function/file/folder/props/query keys/navigation/URL/labels nhất quán. Canonical route là `/organizations/[organizationId]/health-examination-batches/[batchId]`; không phát sinh route company/enterprise mới.
- [ ] Trace 4 route `/enterprises` và alias `/organizations/[organizationId]/batches/[batchId]`. Mặc định dọn alias nội bộ đã hết consumer; nếu có yêu cầu duy trì bookmark/link bên ngoài, chỉ giữ redirect tối thiểu có lý do và tiêu chí gỡ rõ ràng. Route entry point không có import không đồng nghĩa là unused.
- [ ] Mở rộng guard bắt Company/companyId/companies, Enterprise/enterpriseId và employee-as-participant trong context dự án. Bỏ exclude toàn bộ `health-examinations`; thay các regex quá rộng bằng rule phù hợp thuật ngữ được chấp nhận. Cho phép có mục tiêu subjectType EMPLOYEE khi contract xác nhận, route `/health-check` và HealthCheckPrintModel theo policy, cùng test phủ định/fixture kiểm tra tên cũ.
- [ ] Thêm test hành vi guard: bắt camelCase/PascalCase/path cũ; bắt health-examinations vi phạm; không báo sai enum hợp lệ/nhân viên phòng khám; không cho production source lấy type từ `__tests__`. Dùng runner hiện có, không cài dependency riêng cho naming audit.
- [ ] Chạy `pnpm check:terminology`, tests glossary/guard và tests các module đã đổi; `pnpm typecheck` để bắt consumer cũ. Pass nghĩa là không còn finding chưa phân loại, không phải thêm exclude để script xanh.

**Gate:** không còn company/enterprise như alias domain trong active FE ngoài ngoại lệ compatibility có chủ đích; thuật ngữ khác được kiểm tra theo nghĩa, không ép về một tên chung. Tài liệu hiện hành dùng tên chuẩn; accepted ADR giữ lịch sử, thêm clarification ngày tháng nếu ví dụ cũ gây nhầm.

### Task 1 — Hoàn thiện nền kết nối và CSRF cho nghiệp vụ

**Files:** `src/shared/api/http-client.ts`, `src/shared/api/api-client.ts`, mới `src/shared/api/csrf.ts`; `src/modules/auth/api/auth-api.ts`, `src/providers/query-provider.ts`; tests `src/shared/api/api-client.test.ts`, `src/shared/api/__tests__/http-client.test.ts`, `src/modules/auth/__tests__/auth-api.test.ts`, `src/modules/auth/__tests__/session-lifecycle.test.tsx`.

**Interfaces:** `getCsrfHeaders(signal?: AbortSignal): Promise<Record<string, string>>` lấy và validate `{headerName, token}` từ envelope của `/api/v1/auth/csrf`. Shared helper chỉ biết giao thức CSRF, không import auth module. `apiClient` giữ API hiện hành; thêm options cho post/put nếu cần truyền signal/headers, giữ tương thích caller cũ.

- [ ] Viết regression tests: CSRF GET trước write; header lấy từ JSON; token request fail thì write không chạy; logout vẫn chấp nhận 204; 403 không logout; 401 protected request hết phiên; timeout/cancel phân biệt; không replay mutation.
- [ ] Chạy `pnpm exec vitest run src/shared/api src/modules/auth/__tests__`, xác nhận test mới bắt đúng thiếu sót.
- [ ] Dùng cùng helper ở auth và business writes, lấy token mới trước write, không persist token; tránh helper tự gọi write gây recursion. Giữ GET list không tốn thêm một CSRF request.
- [ ] Giữ `withHttpResponse` làm transport chung; sửa normalization để không mất code network/timeout hoặc Retry-After. Không bắt buộc gộp hai client entry point nếu chỉ làm tăng diff.
- [ ] Bổ sung `meta.requiresAuth` cho protected queries và xử lý mutation 401 qua lifecycle auth hiện có; không import auth từ shared transport. Clear business cache khi mất quyền/đổi account.
- [ ] Chạy lại tests trên và test thật cookie/CORS/CSRF ở Task 7; không xem fetch mock là bằng chứng cookie chạy được.

**Gate:** mọi write được hỗ trợ gửi cookie + CSRF đúng, 204 không parse lỗi, 401/403/409/outage có hành vi riêng.

### Task 2 — Đơn vị: tích hợp đầy đủ list/create/detail/update/deactivate

**Files:** `src/modules/organizations/{api/index.ts,types/transport.ts,types/index.ts,schemas/index.ts,hooks/use-organizations.ts,query-keys.ts}`; `components/{create-organization-dialog.tsx,edit-organization-dialog.tsx,organization-table.tsx,organization-info-card.tsx,organization-filters.tsx}`; `pages/{organization-create-page.tsx,organization-list-page.tsx,organization-detail-page.tsx}`; bộ `__tests__/organizations-api.test.ts`, `organization-create-page.test.tsx`, `organization-detail.test.tsx`, `organization-list.test.tsx`, `organization-api-fixtures.ts`.

**Interfaces:** transport create gồm name/taxCode/phone/email/address/contactFullName/contactPhone/contactEmail đúng nullability request; `taxCode` tùy chọn nhưng duy nhất khi có giá trị. Update thêm `rowVersion`; response giữ id/status/rowVersion. Không còn `code`, `organizationType` hoặc `contactPosition`. `deactivateOrganization(id: string, rowVersion: number): Promise<void>`. Các fetch list/detail nhận `signal?: AbortSignal`.

- [ ] Đổi fixtures theo response BE; thêm test request body không gửi note/contactName/contactJobTitle cũ; update/delete mang đúng version, 204 thành công, 409 không tự ghi đè.
- [ ] Test list page=1, size=10 mặc định, size tối đa 100, searchKey trim/max 100, sort chỉ id/taxCode/name và ASC/DESC; không gửi status/type filter không tồn tại. Dữ liệu trả về chỉ ACTIVE, empty và page vượt cuối giữ đúng totals.
- [ ] Chạy `pnpm exec vitest run src/modules/organizations/__tests__` để thấy lỗi contract.
- [ ] Sửa form create/edit theo các field Organization hiện hành; bỏ `code`, `organizationType`, `contactPosition`, tách liên hệ đơn vị và người liên hệ. Giữ validation dùng chung giữa page và dialog; chỉ tách form component nếu giúp loại trùng thực tế.
- [ ] Giữ rowVersion từ response đến mutation; vô hiệu submit kép. Lỗi 409 giữ nội dung đang sửa và đưa lựa chọn tải lại, không thay version rồi tự submit.
- [ ] Sau deactivate thành công: bỏ detail cache đang hiển thị, invalidate list, quay về danh sách; cập nhật page nếu trang cuối vừa hết dữ liệu. Không báo xóa lịch sử/batch.
- [ ] Forward AbortSignal, giữ URL q/page và hỗ trợ Back/Forward; test request cũ không ghi đè kết quả search mới. Không đưa thông tin nhạy cảm bổ sung vào URL.
- [ ] Chạy lại test module và checks chung khi đóng PR.

**Gate:** chuỗi tạo → tìm → mở → sửa → ngừng hoạt động chạy trên backend thật; stale version hiển thị lỗi có hành động phục hồi.

### Task 3 — Gỡ import và chặn các luồng chưa có HTTP contract

**Files:** xóa sau khi trace callers `src/modules/health-examinations/api/participant-imports.ts`, `hooks/use-participant-imports.ts`, `components/participants-tab/participant-import-dialog.tsx`; sửa `components/participants-tab/{participants-tab.tsx,participants-toolbar.tsx,empty-participants-state.tsx}`, `pages/health-examination-batch-detail-page.tsx`, `api/index.ts`, `api/participants.ts`, `query-keys.ts`, module `index.ts` và export/caller tìm được.

**Tests:** sửa `__tests__/api-unavailable.test.ts`, `health-examination-batch-detail.test.tsx`, `participants-import-visibility.test.tsx`; xóa test import thuần túy sau khi thay bằng regression “không còn đường kích hoạt”.

- [ ] Thêm test deep link batch detail và participant tab không gửi GET detail/participant; không có CTA tải mẫu/upload/import/confirm/cancel trong production UI.
- [ ] Chạy test để xác nhận đang bắt các request/CTA cũ trước khi sửa.
- [ ] Gỡ chuỗi import và validation chỉ thuộc import, gồm quy tắc tuổi cũ nếu còn. Giữ validation ngày/CCCD có caller hợp lệ; không xóa `export-excel.ts` chỉ vì tên có Excel.
- [ ] Dùng unavailable state tiếng Việt phân biệt “chưa hỗ trợ” với “chưa có dữ liệu” và “không có quyền”. Chặn từ route composition/hook để không fetch rồi mới hiển thị chặn.
- [ ] Không cho catalog/report/export/print placeholder tự chạy query khi tab/dialog chưa mở; tính năng thiếu contract không có nút retry giả vờ có thể thành công.
- [ ] Rà app shell/sidebar của các module còn lại, khoanh các entry chưa có backend vào trạng thái chưa hỗ trợ; không tuyên bố đã chuyển reception/doctor/billing chỉ vì tắt link.
- [ ] Chạy tests liên quan, `pnpm check:terminology` và kiểm tra network ở Task 7; test fixtures phát triển phải không nằm trong production execution path.

**Gate:** không production request nào đến các route đã bỏ/chưa tồn tại; không còn luồng import, không có mock success.

### Task 3A — Xóa cấu trúc cũ, loại phụ thuộc production → test trên mọi module

**Files:** `src/modules/{appointments,patients,encounters,reception,doctor,billing}/api/index.ts`, các `types/index.ts`, public `index.ts` và `__tests__/fixtures/api-fixtures.ts` tương ứng; `src/modules/health-examinations/types/index.ts` và fixtures; `src/shared/api/development-fixture-error.ts` cùng callers; các file/dependency có bằng chứng unused trong cleanup inventory.

**Interfaces:** production UI/API contracts do module sở hữu; fixtures phụ thuộc contracts đó theo một chiều. Type chưa có backend chỉ là view model/contract nội bộ tạm thời, không gọi là HTTP DTO đã xác thực.

- [ ] Bỏ cả 6 `typeof import('../__tests__/fixtures/api-fixtures')` khỏi production API. Giữ chữ ký public cần cho UI đang có bằng type explicit thuộc module; không chuyển fixture wholesale sang production để hết lỗi import.
- [ ] Chuyển fixture cần thiết sang model hiện hành trực tiếp rồi xóa LegacyAppointmentRow/mapLegacyAppointment, các mapLegacyEncounter/Report và LegacyReception* khi hết consumer. Type billing legacy chỉ còn phục vụ test thì chuyển vào test; nếu UI còn dùng, chuẩn hóa owner và ý nghĩa trước khi xóa.
- [ ] Xóa `LegacyEmployeeImportRow`, adapter import và import-preview fields khi caller cuối cùng đã được xử lý ở Task 3; không giữ alias deprecated “để phòng sau này”. Giữ fixture tổng hợp còn chứng minh hành vi hiện hành.
- [ ] Thay tên helper `development-fixture-error` bằng tên mô tả trạng thái API unavailable nếu nó vẫn phục vụ production UI; model unavailable ở client không giả làm HTTP 501 nhận từ server. Gỡ helper nếu route gating đã thay mọi caller. Không thay lỗi này bằng mock hoặc success.
- [ ] Dọn export mồ côi, key/cache branch cũ, schema/map/config/script/asset không còn được dùng; kiểm tra public asset paths, CSS references, route entry points và scripts trước khi xóa. Không giữ file backup/old/v2 song song hoặc code comment-out cho tính năng đã bỏ.
- [ ] Rà docs/README/design examples và scripts test/build: sửa hướng dẫn đang hoạt động nhưng sai; xóa bản nháp/hướng dẫn bị thay thế nếu không còn giá trị tham chiếu; nếu cần lịch sử, ghi superseded và link tài liệu thay thế. Không sửa nội dung lịch sử ADR accepted để giả rằng quyết định cũ chưa từng có.
- [ ] Ghi từng deletion/move/rename vào cleanup inventory, chạy checks Task 7. Test kiến trúc bảo đảm production source không import test/fixture kể cả type-only. Không dùng noUnused/static search làm bằng chứng duy nhất cho xóa route hay asset.

**Gate:** không còn production → test dependency, legacy adapter đã được thay thế không còn caller/export, file xóa có bằng chứng và module tests vẫn kiểm tra hành vi hiện hành. Module chưa có HTTP contract được giữ ở unavailable khi còn nằm trong roadmap; không xóa toàn bộ module chỉ vì chưa nối backend.

### Task 4 — Đợt khám: list đúng contract, create đúng cấu hình ngày/dịch vụ

**Files:** `src/modules/health-examinations/{types/transport.ts,types/index.ts,api/index.ts,schemas/health-examination-batch.schema.ts,utils/batch-status.ts,hooks/use-health-examination-batches.ts,query-keys.ts}`; `components/batch-form/{create-health-examination-batch-dialog.tsx,health-examination-batch-basic-info-section.tsx,examination-item-price-table.tsx}` và `components/organization-health-examination-batches-tab.tsx`.

**Tests:** `__tests__/health-examination-batch-schema.test.ts`, `batch-status.test.ts`, `health-examination-date-format.test.ts`, `query-keys.test.ts`; `src/modules/organizations/__tests__/create-health-examination-batch.test.tsx`.

**Interfaces:** create payload `{batchCode,batchName,examinationDates: string[],examinationSiteType: 'CLINIC'|'ORGANIZATION_SITE',examinationSiteName,examinationSiteAddress,services: {serviceId,negotiatedPrice}[]}`. Response theo `BatchDetailResponse`: days, bounds, rowVersion, services gồm referencePriceSnapshot/negotiatedPrice/displayOrder/active/rowVersion; không giả định serviceName/code/currency/template fields cũ.

- [ ] Test schema chấp nhận đúng 4 BatchStatus và từ chối 4 giá trị thừa; kiểm tra list DTO và create response mới. Không map unknown enum thành DRAFT.
- [ ] Test payload ngày rời nhau, ngày trùng/ngày không hợp lệ, service trùng, giá âm/quá 12 chữ số nguyên hoặc quá 2 chữ số thập phân; giữ LocalDate qua timezone. Backend vẫn quyết định nghiệp vụ.
- [ ] Chạy bộ schema/status/create tests để thấy lỗi trước khi thay adapter/form.
- [ ] Form chọn danh sách ngày thực tế, không tự suy mọi ngày giữa start/end là ngày khám. Hiển thị bounds từ dữ liệu ngày; site address bắt buộc cho cả hai loại theo request hiện tại.
- [ ] Sửa DTO/map/form giá; giữ giá reference và negotiated riêng, không tự đổi giá lịch sử. Tiền nhận từ backend là dữ liệu thẩm quyền.
- [ ] List dùng pagination/sort contract thực tế từ `HealthExaminationBatchListRequest`; không lấy allowlist organization áp sang batch.
- [ ] Sau create thành công, ở lại tab danh sách và invalidate list của đúng organization. Không gọi detail endpoint chưa có hoặc dùng cache create để giả vờ deep link được hỗ trợ.
- [ ] Khi catalog chưa có: hoàn tất adapter/schema và giữ CTA create disabled với lý do rõ; chưa nghiệm thu create E2E. Chỉ mở khi BE cung cấp contract catalog/nguồn service hợp lệ và đối chiếu DTO xong.
- [ ] Chạy lại tests và checks chung; cập nhật inventory trạng thái list và create riêng biệt.

**Gate:** list chạy thật; create chỉ được đánh dấu hoàn tất khi nguồn catalog thật, BE build/runtime và E2E đều đạt. Contract test của create không thay thế gate này.

### Task 5 — Củng cố module boundaries và cache trong các luồng đã sửa

**Files:** public `index.ts` của organizations/health-examinations/auth, hai `query-keys.ts`, các hook đã liệt kê; `src/modules/health-examinations/__tests__/module-boundary.test.ts` và tests query keys hiện có. Chỉ chỉnh app/widgets callers có dependency vi phạm được tìm thấy.

**Interfaces:** keys batch/list/detail bao gồm organizationId khi có scope; các mutation dùng cùng factory và invalidation prefix. Không tạo query-key framework chung.

- [ ] Trace public callers và kiểm tra route chỉ compose; chuyển domain logic ra module khi thực sự đang ở app/shared.
- [ ] Đổi deep cross-module imports sang public exports; xóa import keys sau Task 3; không xóa key participant chỉ vì endpoint chưa bật nếu còn test/consumer hợp lệ.
- [ ] Thu hẹp invalidation create batch về `healthExaminationKeys.batches(organizationId)`; test cache của organization khác không bị tác động. Query key của mọi list gồm params đã normalize.
- [ ] Loại bản sao server data trong client store nếu tìm thấy; giữ form/local selection đúng chủ sở hữu. Không đập lại URL state đã có.
- [ ] Test đổi organization liên tục, abort request cũ, logout/đổi quyền; chạy tests query-key/module-boundary và tests affected screens.

**Gate:** dependency đi một chiều, cache không lẫn scope, mutation không refetch toàn bộ domain không cần thiết.

### Task 6 — Tối ưu có số đo và sửa khả năng đọc giao diện

**Files:** các page/dialog có chi phí được Task 0 xác nhận; `src/app/globals.css`, `src/lib/utils.ts`, `src/shared/ui/product-icon.tsx`, billing icon callers được trace; `package.json`, `pnpm-lock.yaml`; cập nhật `docs/maintenance/fe-performance-baseline.md`.

- [ ] Dùng baseline để chọn vấn đề: số request trên một thao tác, JS route, render long task. Ưu tiên bỏ request/tab/dialog chạy sớm và code import đã bỏ.
- [ ] Nếu search đang gửi mỗi phím, debounce 300 ms ở input trước cập nhật URL/query; không debounce nút chuyển trang. Fake timer test một request sau một chuỗi gõ, Enter gửi ngay và không gửi lặp sau timer.
- [ ] Lazy-load dialog/preview nặng còn được hỗ trợ khi người dùng mở. Giữ client boundary hẹp, không chuyển authenticated data lên Server Components trong task hiệu năng. Chỉ virtualization khi đo ra nhu cầu sau server pagination.
- [ ] Đánh giá `cn` bằng case conflict class thực tế; nếu không merge đúng, thay bằng clsx/tailwind-merge sau kiểm tra dependency tương thích. Chuyển CLI-only shadcn sang devDependencies; đổi billing icons sang Hugeicons adapter rồi mới gỡ lucide-react khi hết caller. Không gỡ axios/dependency khác chỉ vì không thấy trong vài file.
- [ ] Sửa contrast tại semantic tokens cho light/dark và states; tái dùng Button/Input/Dialog/Alert/Table/Badge hiện có. Đo cặp text/background, kiểm tra focus/keyboard; không recolor mỗi component bằng giá trị tùy tiện.
- [ ] Đo lại production cùng 5 lần/cấu hình/dataset; ghi trước/sau. Mục tiêu nghiệm thu: zero request không hỗ trợ, không double-submit, dialog đóng không fetch catalog, list render tối đa page size, JS route không tăng quá 5% nếu không có lý do được review. Ngưỡng 5% là budget đề xuất, không phải kết quả đo.

**Gate:** mỗi thay đổi hiệu năng có số đo hoặc giảm request/code được xác minh; không tuyên bố “nhanh hơn” chỉ từ memo/useCallback hoặc số file giảm.

Tham chiếu framework: đã tra Context7 và guide của Next cài trong repo. Khi viết code dùng guide local làm chuẩn phiên bản; Context7 không có snapshot đúng 16.3.5 trong kết quả resolve. [Next lazy loading](https://nextjs.org/docs/app/guides/lazy-loading) hướng dẫn trì hoãn Client Components; không dùng `ssr: false` toàn cây để tối ưu.

### Task 7 — E2E, nghiệm thu từng khả năng và tài liệu vận hành

**Files:** tạo `e2e/corporate-workflow.spec.ts`, `e2e/corporate-workflow.backend.spec.ts`, `e2e/auth-session.backend.spec.ts`; chỉnh `playwright.config.ts` nếu route khởi động đã đổi; cập nhật matrix/baseline và architecture doc.

- [ ] Kiểm tra `/login` và đường legacy `/auth/login` thực tế; cấu hình webServer readiness trỏ route có thật. Chạy `pnpm exec playwright test --list` để xác nhận test discovery.
- [ ] Browser tests fixture: loading/empty/error/403/409, invalid payload, unavailable deep link, không import request, search/pagination/back-forward, keyboard và dialog submit.
- [ ] Backend project dùng account/seed tổng hợp trong môi trường test riêng: login → list → create → detail → edit → deactivate; xác minh Cookie/CSRF/CORS thực tế, refresh, nhiều tab, phiên hết hạn, mất role và logout lỗi. Không hardcode credentials hoặc chạy destructive test trên production.
- [ ] Batch backend test list; test create khi dependency catalog và backend ready. Trường hợp bị skip phải ghi blocker và không được tính là hoàn tất workflow.
- [ ] Chạy `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm check:terminology`, `pnpm test:e2e`, `pnpm test:e2e:backend`. Kiểm tra số test đã chạy, không chỉ exit code.
- [ ] Nghiệm thu từng PR, ghi contract còn thiếu. Chỉ stage file thuộc task nếu được yêu cầu commit; không lẫn thay đổi đang có trong worktree.

**Gate production:** BE có RBAC được phép cho các endpoint tương ứng; profile guard và identity của actor được xác minh; HTTPS/same-site/CORS/cookie đúng; backend build/test và browser tests đạt. Không phát hành chỉ vì local/test chạy thành công.

## 4. Thứ tự bàn giao và roadmap còn lại

| Đợt | Deliverable | Dependency |
|---|---|---|
| PR 0 | Task 0 + Task 0A: contract snapshot, thuật ngữ và cleanup inventory toàn FE | Có thể bắt đầu ngay; enum đổi đồng bộ cùng PR batch |
| PR 1 | Task 1: transport/CSRF | Auth backend hoạt động |
| PR 2 | Task 2: đơn vị end-to-end | PR 1, handlers/DB/test account |
| PR 3 | Task 3 + Task 3A: bỏ import, chặn route thiếu, dọn legacy và production/test boundaries | Sau snapshot; chia theo module nếu diff lớn |
| PR 4 | Task 4: list và DTO/form batch mới | PR 1; create UI phụ thuộc catalog/BE readiness |
| PR 5 | Task 5 + phần đo được của Task 6 | Các luồng tương ứng đã ổn định |
| PR 6 | Task 7, báo cáo nghiệm thu và readiness | Tests bổ sung ngay từng PR; đây là gate tích hợp cuối |

Không chờ catalog mới làm đơn vị hoặc cleanup. Không để batch create bị chặn khiến PR list và enum bị treo.

Roadmap sau khi backend mở contract, theo thứ tự:

1. Catalog + batch detail/configuration: thống nhất routes, DTO, quyền, version conflict và lifecycle trước khi enable.
2. Participant roster thủ công: list/add/edit, planned BatchDay, search/pagination, identity/version rules; không phục hồi Excel import.
3. Visit preparation/attendance/reconciliation: Patient và Encounter chỉ được chuẩn bị qua thao tác có chủ đích; tách roster/attendance/reconciliation, giá snapshot lịch sử và cập nhật đồng thời.
4. Hồ sơ khám/in Mẫu 03: lấy nguồn record/version/snapshot hợp lệ, dùng một print model và renderer chung; preview, A4, page break, số lượng, lỗi từng người, reprint. Không tự điền kết quả lâm sàng.
5. Reception/doctor/diagnostics/billing: từng plan theo HTTP contract được duyệt; số tiền backend tính là thẩm quyền, trạng thái encounter/order/result/payment không gộp. Các module này chưa được khảo sát chi tiết trong plan hiện tại.

Mỗi mục mở rộng chỉ bắt đầu khi có contract đọc/ghi, authorization, fixtures tổng hợp, error/concurrency behavior và test backend; domain tables/use cases không tự tạo HTTP contract.

## 5. Định nghĩa hoàn tất của plan này

- Auth và đơn vị dùng backend thật; batch list dùng backend thật, batch create được ghi rõ ready hoặc blocked bởi catalog/BE.
- FE không gửi DTO/status/path cũ, không import và không giả thành công khi API thiếu.
- Organization là tên domain thống nhất trên toàn FE; tất cả module đã được rà thuật ngữ/code cũ, mỗi finding trong cleanup inventory có kết quả hoặc dependency rõ. Không còn exclude cả module để né terminology guard.
- Code/schema/adapter/export/fixture/docs/dependency hết vai trò đã được xóa hoặc thay thế; production source không suy type từ test fixtures. Không giữ hai model cũ/mới cùng mô tả một khái niệm.
- Module/state boundaries được giữ, component có loading/empty/error/permission/unavailable rõ ràng và tái dùng UI hiện có.
- Có kết quả lint/typecheck/tests/build/E2E thật và số đo hiệu năng trước/sau; nêu rõ những checks chưa chạy và lý do.
- Production readiness tách khỏi local integration. API roster/in/clinical thiếu được ghi dependency, không tuyên bố toàn FE đã nối xong.

**Khảo sát hiện tại:** đọc source/docs và lập plan; ngày 2026-10-06 chạy trực tiếp `node scripts/check-terminology.mjs`, exit 1 với 28 matches có sẵn (có trùng regex; script còn bỏ qua health-examinations). Chưa chạy lint/typecheck/unit tests/build/E2E; không có số đo hiệu năng hoặc xác nhận backend đang chạy. Chưa sửa/xóa source.
