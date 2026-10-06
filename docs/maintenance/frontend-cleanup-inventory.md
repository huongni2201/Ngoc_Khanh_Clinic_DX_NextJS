# Frontend naming và cleanup inventory

Cập nhật 2026-10-06 theo yêu cầu chủ dự án. Đây là kết quả khảo sát và danh sách thực hiện cho [plan tích hợp](../superpowers/plans/2026-10-05-fe-backend-clean-slate.md). Các bảng bên dưới giữ nguyên bằng chứng khảo sát ban đầu; trạng thái đã triển khai nằm ở [Kết quả triển khai](#kết-quả-triển-khai-2026-10-06). Phải kiểm tra source/callers lại tại lúc thực hiện.

## Tên chuẩn theo ngữ cảnh

| Khái niệm | Tên chuẩn | Tránh nhầm |
|---|---|---|
| Đơn vị khám đoàn | Organization; organizationId/organizationName; UI “Đơn vị” | Company/Enterprise không còn là alias domain. Tên pháp nhân “Công ty …” vẫn hợp lệ; contract Organization không có organizationType. |
| Địa điểm khám tại đơn vị | ORGANIZATION_SITE | examinationSiteType COMPANY là contract cũ phải thay. |
| Người khám trong đợt | HealthExaminationParticipant/Participant; participantCode; UI “Người khám” | Không phải Patient hoặc nhân viên phòng khám. EMPLOYEE có thể là phân loại đối tượng, không phải tên aggregate; cần đối chiếu contract khi bật roster. |
| Nhân sự phòng khám | StaffMember; STAFF cho principalType | Không replace chữ “nhân viên” trong màn đăng nhập/nhân viên tiếp đón thành Participant. |
| Lịch hẹn / lượt khám | Appointment / Encounter | Không rename hai domain thành một; việc tạo roster không tự tạo Encounter. |
| Dịch vụ / chỉ định / kết quả | ClinicalService / ServiceRequest / DiagnosticReport và kiểu báo cáo cụ thể được domain chấp nhận | Không rename báo cáo thành order; không đổi Physician/Practitioner chỉ để giống Doctor module nếu nghĩa khác. |
| Tài chính | Invoice / Payment / PaymentReceipt | Hóa đơn, giao dịch và chứng từ là ba khái niệm riêng; bỏ legacy type bằng mapping đúng nghĩa. |
| Trạng thái | BatchStatus / record / roster / attendance / reconciliation / encounter / payment riêng | Worklist stage là trạng thái suy ra cho UI, không thay backend lifecycle. |

Nguồn: [PROJECT_RULES](../../PROJECT_RULES.md), [medical terminology](../../src/config/medical-terminology.ts), [backend domain](../../../Ngoc_Khanh_Clinic_DX_Springboot/docs/architecture/03-domain-and-workflows.md).

## Findings và cách xử lý

| ID | Bằng chứng | Hành động dự kiến | Điều kiện hoàn tất |
|---|---|---|---|
| N01 | `src/modules/reception/components/today-appointments-dialog.tsx`: matchCompany, placeholder công ty | Đổi thành matchOrganization/đơn vị | Search vẫn lọc organizationName; không còn alias Company ở logic này. |
| N02 | `src/modules/health-examinations/types/transport.ts`, schema và basic-info form: COMPANY | Đổi site type thành ORGANIZATION_SITE cùng request/response/tests ở Task 4 | Contract đúng; `organizationType` đã bị loại khỏi Organization. |
| N03 | `src/modules/appointments/components/create-appointment-dialog.tsx`: “Chọn đoàn & Nhân viên”, “Nhân viên trong đợt khám” | Dùng “Đợt khám”, “Người khám”, “Đơn vị” đúng ngữ cảnh | Copy/table selector thống nhất; nhân viên phòng khám không bị đổi. |
| N04 | `src/modules/health-examinations/components/participants-tab/participants-tab.tsx`: lỗi “danh sách nhân viên” | Đổi thành người khám nếu còn hiển thị sau gating | UI state đúng và không suy có API roster. |
| N05 | Bốn page dưới `src/app/enterprises/` | Rà và xóa redirect hết yêu cầu compatibility; chỉ giữ tối thiểu nếu có consumer bên ngoài cần hỗ trợ | Canonical links chỉ organization; quyết định giữ redirect có lý do và test. |
| N06 | `src/app/organizations/[organizationId]/batches/[batchId]/page.tsx`; hai test batch còn mock URL /batches | Chuẩn hóa route dài health-examination-batches; xóa alias không cần | Test/mock/navigation dùng canonical path; cân nhắc deep links bên ngoài trước khi xóa route. |
| D01 | API/hook/dialog/query keys import trong health-examinations | Xóa chuỗi tính năng import đã bị bỏ | Không có upload/template/mapping/preview/confirm/cancel caller; test không đòi tính năng cũ. |
| D02 | `LegacyEmployeeImportRow` ở production types; mapLegacyEmployeeImportRow trong fixtures | Tạo fixture Participant trực tiếp nếu test hiện hành còn cần; xóa adapter/type import | Không còn production import-preview model, không giữ deprecated alias. |
| D03 | `src/modules/appointments/__tests__/fixtures/api-fixtures.ts`: LegacyAppointmentRow, employeeCode, mapLegacyAppointment | Dùng fixture Appointment hiện hành với participantCode, bỏ converter legacy | Giữ độ phủ hành vi appointment hiện hành; không chỉ xóa chữ Legacy. |
| D04 | Encounters fixtures có legacyMockEncounterDetail, legacyPatientEncounters, mapLegacyEncounterSummary/LaboratoryReport/ImagingReport | Chuyển fixtures cần thiết sang model hiện hành, xóa converter thừa | Các test tiêu thụ shape hiện hành trực tiếp; không biến fixture thành backend spec. |
| D05 | `src/modules/reception/types/index.ts`: LegacyReceptionStatus/Encounter/BillableItem/Invoice; billing fixtures import public legacy type | Trace UI/API/tests; chuyển type chỉ dùng test vào test hoặc bỏ sau đổi fixture; chuẩn hóa type còn consumer thực | Không xóa type đang cần cho screen trước khi chuyển consumer, không gộp Invoice và Payment. |
| A01 | API index của appointments/patients/encounters/reception/doctor/billing dùng typeof import từ __tests__/fixtures | Loại dependency production → test; module sở hữu chữ ký/type cần thiết, fixtures phụ thuộc module | Không còn import test/fixture trong production source kể cả type-only; đây là lỗi kiến trúc, không khẳng định fixture đang chạy trên production. |
| A02 | `src/shared/api/development-fixture-error.ts`: helper dùng trong production, tạo ApiClientError 501 tại client | Đổi thành unavailable state/error có ngữ nghĩa đúng, hoặc xóa nếu hết caller sau gating | Không giả HTTP response; giữ thông báo API chưa có; không mock fallback. |
| G01 | `scripts/check-terminology.mjs` bỏ qua cả health-examinations và chưa kiểm company/enterprise | Rà rule, kiểm paths/identifiers; thu hẹp ngoại lệ theo ngữ cảnh | Guard bắt vi phạm ở mọi module; không báo sai enum/canonical print route. |
| G02 | Guard cấm rộng HealthCheck/health-check trong khi PROJECT_RULES chấp nhận HealthCheckPrintModel và /health-check | Đồng bộ rule với policy và accepted domain; test positive/negative | Không rename route/model hợp lệ chỉ để làm script xanh. |
| G03 | Chạy guard hiện tại có 28 matches: FRONT_DESK trong appointments, CLS trong doctor copy/classes, tên test Doctor Worklist; có matches trùng do hai regex | Phân loại theo domain/policy trước khi sửa; làm rõ bookingChannel, tên workflow và token diagnostics rồi sửa đồng bộ consumers/tests/CSS | Không coi 28 matches là 28 lỗi nghiệp vụ; không đổi wire enum chưa đối chiếu contract. |
| P01 | package.json có cn, shadcn runtime dependency, lucide-react cùng Hugeicons | Theo Task 6: kiểm cn, chuyển CLI về dev, migrate icons rồi gỡ package hết caller | Lockfile/checks/build đạt; không gỡ dependency dựa vào một vài file được đọc. |
| T01 | Accepted ADR có ví dụ CreateCompanyDialog/Company List Data/employees | Giữ lịch sử; thêm clarification tên hiện hành nếu cần; sửa docs hiện hành | Không rewriting quyết định lịch sử; người đọc tìm được tên hiện hành. |
| T02 | Tài liệu FE còn “organization list chưa có” dù BE controller đã có | Sửa mô tả theo source mới trong task snapshot | Không bỏ chức năng list chỉ vì follow-up cũ. |

## Kết quả triển khai 2026-10-06

Trạng thái: **Đã xử lý** = sửa/xóa xong và đã chạy checks; **Chờ xóa file** = code đã chuyển hướng nhưng Windows từ chối xóa vật lý (xem cuối mục); **Còn lại** = nằm ngoài inventory hoặc cần dependency khác.

| ID | Trạng thái | Kết quả và bằng chứng |
|---|---|---|
| N01 | Đã xử lý | `matchCompany` → `matchOrganization`; placeholder tìm kiếm “đơn vị”. Search vẫn lọc `organizationName`. |
| N02 | Đã xử lý | `ORGANIZATION_SITE` thay `COMPANY` ở transport, schema, option form và test; đối chiếu backend `ExaminationSiteType` và `HealthExaminationBatchRequest` (`CLINIC\|ORGANIZATION_SITE`). Thêm test từ chối `COMPANY`. Nhãn UI “Tại đơn vị” giữ nguyên. |
| N03 | Đã xử lý | Tiêu đề bước “Chọn đơn vị, đợt khám & người khám”, nhãn “Người khám trong đợt khám”, placeholder “Chọn đơn vị / người khám”. Nhân sự phòng khám không bị đổi. |
| N04 | Đã xử lý | Lỗi tải danh sách dùng “người khám”; empty state không còn nhắc Excel/import và không hứa hành động chưa có. Việc chặn request roster chưa có endpoint là Plan Task 3 (xem Còn lại). |
| N05 | Chờ xóa file | Không có consumer nội bộ (rg trên src/docs/config/scripts) và không có yêu cầu external. Không giữ redirect. Bốn page đã chuyển sang `src/app/_to_delete/enterprises/` (thư mục private của App Router, không còn route); build production không còn route `/enterprises`. |
| N06 | Đã xử lý | Xóa page alias `/organizations/[organizationId]/batches/[batchId]`; hai test dùng `/health-examination-batches/`. Route build chỉ còn đường dẫn canonical. |
| D01 | Đã xử lý (3 test chờ xóa) | Xóa `participant-imports.ts`, `use-participant-imports.ts`, `participant-import-dialog.tsx`, key import trong `query-keys.ts`, CTA “Import/Tải file mẫu” và `health-examination-batch-header.tsx` (không có caller, chứa CTA import). `participants-import-visibility.test.tsx` viết lại thành regression “không còn đường kích hoạt”. |
| D02 | Đã xử lý | Xóa `LegacyEmployeeImportRow`, `ParticipantProfileStatus`, `profileStatus` khỏi `HealthExaminationParticipant` và `mapLegacyEmployeeImportRow`. Fixture roster tạo Participant trực tiếp (`participantCode`, `dateOfBirth`, …); trạng thái đủ hồ sơ chỉ còn là kiểu cục bộ của fixture. Không giữ alias deprecated. |
| D03 | Đã xử lý | Fixture appointments dùng model hiện hành (`bookingChannel`, `careProgram`, `healthExaminationBatchId`, `participantCode`); xóa `LegacyAppointmentRow` và `mapLegacyAppointment`. |
| D04 | Đã xử lý | Fixtures encounters/reception chuyển sang literal theo model hiện hành; dữ liệu trước/sau được so sánh bằng JSON dump, chỉ khác hai khóa legacy thừa của `imagingReport` (`descriptionPoints`, `conclusion`). Xóa các `mapLegacy*`. |
| D05 | Đã xử lý | `LegacyReceptionStatus/Encounter/BillableItem/Invoice` không có consumer production: bỏ khỏi `reception/types`; seed hóa đơn của reception chuyển thành `Fixture*` trong fixture reception (billing vẫn sở hữu Invoice/Payment/PaymentReceipt). Bỏ `fetchInvoiceByEncounter`, `fetchReceptionInvoices`, `processPayment`, `ProcessPaymentDto`, `processPaymentSchema` khỏi production reception (không caller). `billing-api.test` lấy `processPayment` từ fixture. |
| A01 | Đã xử lý | Sáu `api/index.ts` có chữ ký tường minh theo type của module; không còn `typeof import(.../__tests__/...)`. `src/shared/api/__tests__/module-api-fixtures.test.ts` kiểm `satisfies` + đủ export; guard cấm production import test/fixture kể cả type-only. |
| A02 | Đã xử lý | `development-fixture-error.ts` → `api-unavailable.ts` với `ApiUnavailableError` (`feature`, không có `status`, không giả HTTP 501). Query không retry lỗi này; HTTP 501 thật vẫn không retry. Thông báo tiếng Việt giữ nguyên. |
| G01 | Đã xử lý | Bỏ exclude `health-examinations`; thêm rule Company/Enterprise, site type `COMPANY`, employee-as-participant, production→test. Logic ở `scripts/terminology-guard.mjs`, CLI ở `check-terminology.mjs`; ngoại lệ là danh sách file+label có lý do. |
| G02 | Đã xử lý | Cho phép `HealthCheckPrintModel` và route `/health-check…`; vẫn bắt `HealthCheckForm`, `health-check` dạng class/biến. |
| G03 | Đã xử lý | 28 dòng guard cũ phân loại: (a) `FRONT_DESK` — `BookingChannel` chỉ tồn tại ở FE (backend không có `bookingChannel`), đổi thành `RECEPTION` cùng consumer/fixture/test; (b) “CLS” trong doctor — `WAITING_CLS` → `WAITING_DIAGNOSTIC_RESULTS` (cùng tên stage của reception), `waitingCls` → `waitingDiagnosticResults`, token `status-cls` → `status-diagnostic` (globals.css + 2 component), nhãn “Chờ kết quả” và “Chỉ định cận lâm sàng”; (c) tên test “Doctor Worklist” → “Danh sách lượt khám của bác sĩ”. |
| P01 | Đã xử lý | `cn` giữ nguyên: đây là package shadcn-ui/cn, khớp clsx+tailwind-merge trên 28 ca xung đột thực tế. `shadcn` chuyển devDependencies (còn dùng cho `@import "shadcn/tailwind.css"`). `lucide-react` gỡ sau khi 6 file billing dùng adapter Hugeicons (thêm `ArrowRight`, `Hourglass`; `Clock3`→`Clock`, `Wrench`→`RotateCcw`). Lockfile cập nhật. |
| T01 | Đã xử lý | ADR 0001/0002/0003 giữ nguyên quyết định, thêm ghi chú làm rõ ngày 2026-10-06 cho ví dụ cũ (employees, `CreateCompanyDialog`, Company List/Search). |
| T02 | Đã xử lý | PROJECT_RULES §1, ví dụ endpoint hiện có và §29, README, FRONTEND_ARCHITECTURE và code-follow-ups ghi organization list/deactivate đã có ở backend (đối chiếu `OrganizationController` và API inventory). |

**Còn lại (ngoài inventory hoặc cần quyết định):**

- Plan Task 3: `ParticipantsTab` và trang chi tiết đợt khám vẫn gọi endpoint chưa có (batch detail, participant list); chưa chặn ở route/hook.
- Plan Task 4: sau khi tạo đợt khám, dialog vẫn `router.push` sang route chi tiết; enum `BatchStatus` thừa; form còn `startDate/endDate`.
- `BookingChannel` còn giá trị `IMPORT` (kênh đặt lịch từ đơn vị). Cần chủ dự án xác nhận còn nghĩa sau khi bỏ Excel import.
- Chờ xóa file (Windows trả `Permission denied`, có thể do dev server/vitest watch đang giữ file): thư mục `src/app/_to_delete/`; ba test `src/modules/health-examinations/__tests__/participant-import-dialog.test.tsx`, `participant-imports-api.test.ts`, `participant-import-adapter.test.ts`; các thư mục rỗng `src/app/organizations/[organizationId]/exam-batches/`. Cho tới khi xóa, `node scripts/check-terminology.mjs` còn báo 19 finding (đúng các file này) và `tsc`/vitest trên thư mục này sẽ lỗi ở ba test import.

### Checks đã chạy

`node_modules` trong thư mục dự án được cài cho Windows nên không chạy được trên máy Linux của phiên. Checks chạy trên bản sao `pnpm install --frozen-lockfile` (cùng pnpm 11.26.0, Node 22), đã loại các file chờ xóa ở trên:

| Check | Trước | Sau |
|---|---|---|
| `tsc --noEmit` | exit 0 | exit 0 |
| `eslint` | chưa đo | exit 0 |
| `vitest run` | 52 file / 187 test pass | 52 file / 305 test pass (gồm test tương phản màu mới) |
| `node scripts/check-terminology.mjs` | exit 1, 28 matches (health-examinations bị bỏ qua) | exit 0, 271 file |
| `next build --webpack` | chưa đo | exit 0, danh sách route không còn `/enterprises` (chạy trước khi gỡ axios và sửa màu; chưa chạy lại sau hai thay đổi đó) |

`next build` chỉ chạy được sau hai chỉnh sửa trong bản sao scratch (không áp vào dự án): thay Google Fonts bằng font hệ thống vì sandbox không tải được font, và tạo symlink khác hoa/thường cho 6 file trong `@hugeicons/core-free-icons` (index tham chiếu `Grid2x2*Icon.js` sai hoa/thường, chỉ lỗi trên Linux). Chưa chạy: Playwright (thư mục `e2e/` chưa tồn tại), kiểm tra trình duyệt thật, backend thật. `pnpm check:terminology` qua pnpm chưa chạy trên máy dự án.

## Phần phải rà tiếp trong triển khai

Đã quét văn bản các module; chưa phải chứng nhận toàn bộ code không còn unused. Với mỗi module và vùng app/shared/widgets/providers/lib/config phải rà: public exports, import graph, dynamic imports, route entry points, query keys, stores, validators/mappers, component trùng chức năng, assets được gọi bằng chuỗi/CSS, package scripts/config và dependencies.

Mỗi mục xóa ghi tối thiểu: file/symbol → luồng cũ hoặc consumer đã chuyển → file thay thế nếu có → checks xác minh. Dùng CodeGraph trước khi tìm code, bổ sung text search khi index không bao phủ. Không cài tool audit mới nếu compiler/lint/search hiện có đủ xác minh.

## Những thứ không xóa chỉ vì trông cũ

- `AuthSessionSync` xóa localStorage nk_auth_token/nk_auth_user: đây là cleanup thông tin auth legacy có mục đích, chưa có bằng chứng hết browser cũ. Giữ trừ khi có điều kiện kết thúc migration rõ ràng.
- Fixtures/test negative còn kiểm tra hành vi hiện tại: giữ và cập nhật; không loại test để che regression.
- Export dữ liệu khác với import roster; file `export-excel.ts` không tự nằm trong phạm vi xóa import.
- Module roadmap có UI được dùng nhưng chưa có HTTP: giữ unavailable hoặc giảm phần thừa có bằng chứng; không xóa cả domain vì backend đang thiếu endpoint.
- Tên công ty thực tế, enum COMPANY của loại đơn vị, STAFF và thuật ngữ lịch sử ADR: giữ đúng ngữ cảnh, không blanket replace.

## Nghiệm thu

`pnpm check:terminology`, lint, typecheck, module tests, build và E2E cho route/flow bị ảnh hưởng phải có kết quả thực. Trước bàn giao, mọi finding có trạng thái đã xử lý hoặc dependency cụ thể; không coi một inventory mới là đã dọn xong code.

Baseline khảo sát 2026-10-06: đã chạy trực tiếp `node scripts/check-terminology.mjs` (đúng script mà package.json gọi), exit 1 với 28 matches hiện có, gồm matches trùng regex. Lệnh qua pnpm chưa trả kết quả trong lần thử. Đã kiểm liên kết nội bộ và whitespace của hai tài liệu; chưa chạy lint/typecheck/unit tests/build/E2E, chưa sửa/xóa source. Guard còn bỏ qua health-examinations nên kết quả hiện tại không chứng minh module đó sạch.
