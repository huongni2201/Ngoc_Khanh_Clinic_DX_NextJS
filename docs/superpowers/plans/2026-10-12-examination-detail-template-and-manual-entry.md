# Chi tiết khám: tải file mẫu và nhập tay cho từng người khám — Kế hoạch triển khai

> **Cho agent thực thi:** làm lần lượt từng Task, đánh dấu checkbox (`- [ ]`) khi xong. Backend trước, frontend sau, vì frontend dùng hợp đồng API mới.

**Mục tiêu**
1. Tab "Chi tiết khám" có nút **"Tải file mẫu"** rõ ràng (giống tab "Người khám"), để người dùng có file đúng cấu trúc trước khi "Nhập Excel".
2. Cho phép **cập nhật chi tiết khám cho từng người khám** ngay trên màn hình (đánh dấu đã đến / vắng, ngày khám thực tế, tick hạng mục đã khám), không bắt buộc qua Excel.

**Phạm vi:** backend `Ngoc_Khanh_Clinic_DX_Springboot` (module `healthexamination`) và frontend `ngoc_khanh_clinic_frontend` (`src/modules/healthexamination/batches`).

**Tech stack:** Next.js, React Query, Zod, TypeScript, shadcn/ui (`sheet`, `checkbox`, `dialog`…); Java 25, Spring Boot 4, MyBatis, PostgreSQL, Flyway, Apache POI.

---

## 0. Hiện trạng (đã đọc code ngày 2026-10-12)

**Template Excel**
- Backend **đã có** file dùng làm template: `GET .../examination-details/export` (`ExportExaminationDetailsUseCase` → `PoiExaminationDetailExcelWriter`). Javadoc ghi rõ "the same file is the export and the template of the import": sheet `ChiTietKham`, cột ẩn A/B = `participant_id`, `row_version`, dòng key ẩn, cột `svc:<batchServiceId>` có dropdown `X`, sheet `HuongDan`.
- Frontend: nút "Xuất Excel" trên toolbar, và trong `ExaminationDetailImportDialog` có nút "Xuất file Excel". **Không có chỗ nào gọi là "file mẫu"**, nên người dùng không biết phải tải gì để điền. Tab "Người khám" thì có "Tải file mẫu" (`GET .../participants/import-template`), nên hai tab không đồng nhất.
- Quyền: export cần `HEALTH_EXAMINATION_SERVICE_EXPORT`, import cần `HEALTH_EXAMINATION_SERVICE_RECONCILE`. Theo ADR-0015 mỗi permission bảo vệ đúng **một** endpoint. Một role có quyền import nhưng không có quyền export thì **không lấy được template**. Hiện chỉ CLINIC_MANAGER có cả hai (seed local thì TEST/ADMINISTRATOR có tất cả).

**Nhập cho từng người**
- Chưa có endpoint ghi chi tiết khám cho 1 người. Ghi duy nhất qua `POST .../examination-details/imports` (all-or-nothing, idempotency key).
- Logic nghiệp vụ "áp 1 dòng vào 1 người khám" đã tách sẵn trong `ExaminationDetailReconciler.apply(...)` (X ⇒ ATTENDED; ô trống ⇒ `performed=false`, không xoá dòng; giá snapshot lấy từ giá thoả thuận khi tick mới; hạng mục inactive không được tick mới). Hàm này **dùng lại được** cho nhập tay; chỉ cần đổi kiểu input khỏi `ExaminationDetailImportRow`.
- Kiểm tra ngày (`requireValidDates`, `requirePlannedDatesNotInFuture`) đang là private trong `ExaminationDetailImportCommitter`, cần tách ra dùng chung.
- Aggregate `HealthExaminationBatchParticipant` đã có `recordAttendance(...)` (hỗ trợ `ABSENT`), `reconcileServices(...)`; repository có `save(participant, expectedRowVersion)` và `findManyInBatchForUpdate(...)`.
- Row API trả về `rowVersion`, nên frontend có sẵn dữ liệu cho optimistic concurrency.
- `OrganizationExaminationDetailTab` + `ParticipantExaminationDetailDrawer` là màn hình cũ dùng dữ liệu mock, **không được import ở đâu**. Không dùng lại; ngoài phạm vi plan này.

---

## 1. Quyết định thiết kế

### 1.1 File mẫu = workbook đã điền sẵn danh sách và trạng thái hiện tại
- **Không** làm file mẫu trống. Import là "overwrite theo file": ô trống nghĩa là *chưa khám*. File mẫu trống mà điền thiếu sẽ xoá X đã có. Ngoài ra import bắt buộc cột ẩn `participant_id` + `row_version` để khớp người, nên file mẫu phải sinh từ roster hiện tại.
- Thêm endpoint riêng `GET .../examination-details/import-template`, nội dung **giống hệt** export (dùng chung writer), chỉ khác:
  - tên file `mau-nhap-chi-tiet-kham-<batchCode>.xlsx`;
  - permission riêng `HEALTH_EXAMINATION_SERVICE_TEMPLATE_DOWNLOAD` (đúng ADR-0015, giống `PARTICIPANT_TEMPLATE_DOWNLOAD`);
  - audit `DOWNLOAD_EXAMINATION_DETAIL_TEMPLATE`.
- "Xuất Excel" giữ nguyên để báo cáo/xem.

### 1.2 Nhập tay = một "dòng import" cho đúng một người, đồng bộ
- Endpoint: `PUT .../examination-details/{participantId}`.
- Body:
  ```json
  {
    "attendanceStatus": "ATTENDED",            // ATTENDED | ABSENT
    "actualExaminationDate": "2026-10-09",     // bắt buộc khi ATTENDED, null khi ABSENT
    "performedBatchServiceIds": ["<uuid>", "..."],
    "rowVersion": 3
  }
  ```
- Response `200`: `ExaminationDetailRowResponse` mới nhất của người đó (cùng shape với list), để frontend cập nhật ngay.
- Quy tắc:
  - `ATTENDED`: bắt buộc **≥ 1** hạng mục và có ngày thực tế. Ngày nằm trong `[batch.startDate, hôm nay theo Asia/Ho_Chi_Minh]`, cùng quy tắc với import. Áp qua `ExaminationDetailReconciler` nên kết quả giống hệt một dòng Excel: người khám thành `ATTENDED` + `RECONCILED`; hạng mục bỏ tick giữ dòng với `performed=false`; tick mới lấy giá thoả thuận hiện tại; tick mới một hạng mục inactive trả 409.
  - `ABSENT`: `performedBatchServiceIds` phải rỗng, và người khám **chưa có hạng mục nào `performed=true`** (đã đối soát có X thì phải bỏ tick trước, trả 409 `PARTICIPANT_HAS_PERFORMED_SERVICES`). Chỉ gọi `recordAttendance(ABSENT, null, ...)`, không đụng reconciliation.
  - Người khám bị huỷ (`CANCELLED`) → 409; không thuộc đợt → 404.
  - Batch phải `DRAFT`/`READY` và organization `ACTIVE`, cùng điều kiện với import.
  - `rowVersion` lệch → 409 `PARTICIPANT_CHANGED` (`ConcurrentUpdateException`). **Ngoại lệ idempotent:** nếu lệch version nhưng trạng thái đang lưu đã đúng y như request (do retry sau khi request trước đã thành công) thì trả 200 với row hiện tại.
  - Request trùng trạng thái hiện tại → 200, không ghi gì, không tăng version.
- Permission mới `HEALTH_EXAMINATION_SERVICE_RECORD` cho `PUT` này.
- Audit `RECORD_EXAMINATION_DETAIL`: chỉ ghi id + số lượng (`organizationId`, `batchId`, `participantId`, `attendanceStatus`, `performedItems`), **không** ghi tên/CCCD (theo quy tắc audit hiện tại).
- Không cần idempotency key: `rowVersion` + quy tắc "trùng trạng thái ⇒ 200" đã đủ an toàn khi retry.

### 1.3 Giao diện nhập tay: Sheet bên phải, mở từ từng dòng
- Mỗi dòng của bảng ma trận có nút "Cập nhật" (icon bút) ở cột cuối, và click vào dòng cũng mở Sheet. Chỉ hiện khi có quyền `RECORD` và batch cho phép sửa.
- Sheet gồm: thông tin người khám; chọn **Đã đến / Vắng** (segmented button); **Ngày khám thực tế** (date input có min/max); danh sách hạng mục dạng checkbox kèm "Chọn tất cả"; nút **Lưu** và **Lưu & người tiếp theo** để nhập nhanh theo thứ tự trang hiện tại.
- Không làm "click ô để bật/tắt X" trong phase này: mỗi click thành một request, khó xử lý concurrency và dễ bấm nhầm. Ghi vào mục "Để sau".

### 1.4 Quyết định của chủ dự án (đã duyệt 2026-10-12: làm theo khuyến nghị)
| # | Câu hỏi | Quyết định |
|---|---|---|
| D1 | Cho phép đánh "Vắng" khi nhập tay? | **Có** (bộ lọc "Vắng" đã tồn tại nhưng hiện không có cách nào đặt). |
| D2 | Cho phép trả về "Chưa đến" (undo)? | **Không** ở phase này. |
| D3 | Role nào nhận `SERVICE_RECORD` và `SERVICE_TEMPLATE_DOWNLOAD`? | **Các role đang có `SERVICE_RECONCILE`** (hiện là CLINIC_MANAGER). RECEPTIONIST / DATA_ENTRY_STAFF chỉ bổ sung bằng migration sau nếu có yêu cầu. |
| D4 | File mẫu có điền sẵn X hiện tại? | **Có** (lý do ở mục 1.1). |

---

## 2. Backend

### Task B1 — Tách logic dùng chung khỏi import (refactor, không đổi hành vi)
**Files**
- Modify: `application/service/ExaminationDetailReconciler.java`
- Create: `application/service/ExaminationDetailEntry.java` (record input trung lập)
- Create: `application/service/ExaminationDateRules.java`
- Modify: `application/service/ExaminationDetailImportCommitter.java`
- Modify test: `ExaminationDetailReconcilerTest.java`, `ExaminationDetailImportCommitterTest.java`

**Các bước**
- [ ] Tạo `record ExaminationDetailEntry(UUID participantId, long rowVersion, Set<UUID> performedServiceIds, LocalDate actualExaminationDate, String locator)`. `locator` là tiền tố thông điệp lỗi: import dùng `"Row 7"`, nhập tay dùng `"Participant"`.
- [ ] `ExaminationDetailImportRow` thêm `toEntry()`; `ExaminationDetailReconciler.apply(...)` nhận `ExaminationDetailEntry` thay vì `ExaminationDetailImportRow`; thông điệp lỗi dùng `entry.locator()`.
- [ ] Tạo `ExaminationDateRules` (package-private hoặc `@Component` nhận `Clock`) chứa `BUSINESS_ZONE`, `requireActualDateInRange(batch, date, locator)` và `requirePlannedDateNotInFuture(...)`, chuyển nguyên logic từ committer sang.
- [ ] Committer gọi `ExaminationDateRules` và `reconciler.apply(..., row.toEntry(), ...)`.
- [ ] Chạy lại toàn bộ test import hiện có: phải xanh, không sửa assertion (chỉ sửa chỗ khởi tạo input).

### Task B2 — Endpoint tải file mẫu
**Files**
- Modify: `application/usecase/ExportExaminationDetailsUseCase.java` (tách phần dựng `ExaminationDetailExportData` + render thành method dùng chung, hoặc tạo `ExaminationDetailWorkbookBuilder`)
- Create: `application/usecase/GetExaminationDetailImportTemplateUseCase.java`
- Modify: `application/service/ExaminationDetailAccessPolicy.java`: thêm `SERVICE_TEMPLATE_DOWNLOAD_PERMISSION = "HEALTH_EXAMINATION_SERVICE_TEMPLATE_DOWNLOAD"` + `requireServiceTemplateDownload`
- Modify: `api/controller/ExaminationDetailController.java`: `@GetMapping("/import-template")`
- Create: `src/main/resources/db/migration/V<next>__seed_examination_detail_entry_permissions.sql` (dùng chung với B3; số version lấy số kế tiếp **tại thời điểm làm**, kiểm tra cả các plan đang mở như V008 xoá site name)
- Modify: `src/main/resources/db/local/R__local_access_control_seed.sql` nếu seed local liệt kê permission tường minh (nếu grant "tất cả" thì không cần)

**Các bước**
- [ ] Use case: `access.requireServiceTemplateDownload(principal)` → đọc `readAllActive` + services giống export → `writer.write(data)` → trả `ExaminationDetailExportResponse` với `fileName = "mau-nhap-chi-tiet-kham-" + batchCode + ".xlsx"`. Audit `DOWNLOAD_EXAMINATION_DETAIL_TEMPLATE` (id + `rowCount`).
- [ ] Không chặn theo trạng thái batch (giống export); frontend tự ẩn nút khi batch không cho import.
- [ ] Controller: header giống `export()` (`Content-Disposition: attachment`, `no-store`, content-type xlsx).
- [ ] Migration: insert permission `HEALTH_EXAMINATION_SERVICE_TEMPLATE_DOWNLOAD` (name "Download examination detail import template"), map `GET /api/v1/organizations/{organizationId}/health-examination-batches/{batchId}/examination-details/import-template`, grant cho mọi role đang có `HEALTH_EXAMINATION_SERVICE_RECONCILE` (dùng `SELECT ... FROM role_permissions JOIN permissions WHERE code = 'HEALTH_EXAMINATION_SERVICE_RECONCILE'` để không hard-code role). `ON CONFLICT DO NOTHING`. Không sửa V002.
- [ ] Tests:
  - `ExaminationDetailUseCasesTest`: 403 khi thiếu permission; tên file đúng; nội dung workbook giống export (cùng `templateVersion`, cùng cột `svc:`).
  - `ExaminationDetailAndReportControllerTest`: 200 + header; 403; 404 batch không tồn tại.
  - Test vòng tròn: tải template → import lại nguyên file → 201, `updatedParticipants = 0`.
  - Migration integration test: permission có endpoint và được grant cho CLINIC_MANAGER.

### Task B3 — Endpoint nhập tay cho một người
**Files**
- Create: `api/request/RecordExaminationDetailRequest.java` (Jakarta Validation)
- Create: `application/command/RecordExaminationDetailCommand.java`
- Create: `application/usecase/RecordExaminationDetailUseCase.java`
- Modify: `application/service/ExaminationDetailAccessPolicy.java`: `SERVICE_RECORD_PERMISSION = "HEALTH_EXAMINATION_SERVICE_RECORD"` + `requireServiceRecord`
- Modify: `application/port/out/ExaminationDetailReader.java` + `MyBatisExaminationDetailReader` + `ExaminationDetailMyBatisMapper.xml`: thêm `Optional<ExaminationDetailRow> readOne(organizationId, batchId, participantId)` (dùng lại SELECT của list, thêm điều kiện id)
- Modify: `api/controller/ExaminationDetailController.java`: `@PutMapping("/{participantId}")`
- Modify: migration của B2: thêm permission `HEALTH_EXAMINATION_SERVICE_RECORD` + endpoint `PUT .../examination-details/{participantId}` + grant như B2

**Request validation**
- `attendanceStatus`: `@NotNull`, chỉ nhận `ATTENDED` | `ABSENT` (400 nếu `UNCONFIRMED`).
- `actualExaminationDate`: `LocalDate`, bắt buộc khi `ATTENDED`, phải null khi `ABSENT` (cross-field validation trong `toCommand()` → 400 có tên trường, theo envelope lỗi hiện tại).
- `performedBatchServiceIds`: `@NotNull`, tối đa 100 phần tử, không trùng; `ATTENDED` ⇒ size ≥ 1; `ABSENT` ⇒ rỗng.
- `rowVersion`: `@NotNull`, ≥ 0.

**Use case (`@Transactional`)**
- [ ] `access.requireServiceRecord(principal)`.
- [ ] `batches.findDetails(orgId, batchId, true)` (khoá batch giống import để tuần tự với import đang chạy) → 404 nếu không có; organization `ACTIVE` và `batch.acceptsParticipantChanges()`, nếu không thì 409.
- [ ] `participants.findManyInBatchForUpdate(batchId, [participantId])` → 404 nếu không có; `CANCELLED` → 409.
- [ ] Mọi `performedBatchServiceIds` phải thuộc `batch.services()`, nếu không thì 400 `"performedBatchServiceIds contains a service outside this batch"`.
- [ ] So version:
  - Nếu `participant.getRowVersion() != command.rowVersion()`: nếu trạng thái hiện tại **đã bằng** request (attendance, ngày, tập performed, `RECONCILED` với ATTENDED) thì trả `readOne(...)` với 200; ngược lại ném `ConcurrentUpdateException("PARTICIPANT_CHANGED", ...)`.
- [ ] `ATTENDED`: `ExaminationDateRules.requireActualDateInRange(...)`; `reconciler.apply(participant, batch, entry, actor, now, plannedDate)`; nếu `UPDATED` thì `participants.save(participant, command.rowVersion())`.
- [ ] `ABSENT`: nếu `!participant.performedBatchServiceIds().isEmpty()` → `ConflictException("PARTICIPANT_HAS_PERFORMED_SERVICES", ...)`; nếu đang `ABSENT` thì không ghi; ngược lại `participant.recordAttendance(ABSENT, null, actor, now, participant.getAttendanceNote())` + save.
- [ ] Chỉ ghi audit `RECORD_EXAMINATION_DETAIL` khi có ghi.
- [ ] Trả `ExaminationDetailRowResponse.from(reader.readOne(...).orElseThrow())`.
- [ ] Log info chỉ có id + kết quả (`UPDATED`/`UNCHANGED`).

**Tests**
- [ ] Unit (`RecordExaminationDetailUseCaseTest`): ATTENDED tick mới; bỏ tick giữ dòng `performed=false`; giá snapshot đúng; ngày ngoài khoảng → 400; ngày tương lai → 400; tick mới hạng mục inactive → 409; ABSENT khi chưa có X → OK; ABSENT khi có X → 409; CANCELLED → 409; batch FINALIZED → 409; version lệch → 409; version lệch nhưng trạng thái trùng → 200 (retry); request trùng trạng thái → không gọi `save`; thiếu permission → 403.
- [ ] Controller test: 200 shape row; 400 validation (thiếu ngày, rỗng hạng mục khi ATTENDED, UNCONFIRMED); 403; 404; 409.
- [ ] Integration (`ExaminationDetailIntegrationTest`): PUT rồi GET list thấy X + `RECONCILED`; summary đếm đúng; payment report tăng `examinedCount`; PUT rồi export/import lại file cũ → 409 `PARTICIPANT_CHANGED_AFTER_EXPORT` (vì version đã đổi).

### Task B4 — Tài liệu backend
- [ ] `docs/api/examination-details-and-report.md`: thêm 2 permission vào bảng, 2 route, mục "Nhập tay cho một người khám" (body, quy tắc, mã lỗi), audit action mới.
- [ ] `docs/adr/0015-endpoint-permission-rbac.md`: thêm đoạn amendment 2026-10-12 cho 2 permission mới.
- [ ] Nhắc trong doc: permission là snapshot lúc đăng nhập, phải **đăng nhập lại** sau migration.

---

## 3. Frontend

### Task F1 — API, types, hooks
**Files**
- Modify: `batches/api/examination-details.ts`
- Modify: `batches/types/index.ts`, `batches/types/transport.ts`
- Modify: `batches/hooks/use-examination-details.ts`
- Modify: file khai báo permission (nơi định nghĩa `EXAMINATION_SERVICE_RECONCILE_PERMISSION`)
- Create: `batches/utils/examination-detail-record-errors.ts`

**Các bước**
- [ ] `EXAMINATION_DETAIL_TEMPLATE_FALLBACK_FILE_NAME = "mau-nhap-chi-tiet-kham.xlsx"`; `buildExaminationDetailTemplateUrl(orgId, batchId)`; `downloadExaminationDetailTemplate(orgId, batchId, signal)` dùng `apiClient.getBlob` giống export.
- [ ] `buildExaminationDetailRecordUrl(orgId, batchId, participantId)`; `recordExaminationDetail(request)` gọi `apiClient.put`, parse response bằng schema row hiện có (`examinationDetailRowResponseSchema`), map qua `mapRow`.
- [ ] Types: `RecordExaminationDetailRequest { organizationId; batchId; participantId; attendanceStatus: "ATTENDED" | "ABSENT"; actualExaminationDate?: string; performedBatchServiceIds: string[]; rowVersion: number }`.
- [ ] Hooks:
  - `useDownloadExaminationDetailTemplate(orgId, batchId)`: mutation + `saveBlobAs`, `retry: false`.
  - `useRecordExaminationDetail()`: mutation, `retry: false`; `onSuccess` dùng `setQueriesData` để thay row trong mọi page cache của `examinationDetailsRoot` (UI cập nhật ngay), rồi invalidate `examinationSummary`, `paymentReport`, `participantsRoot`.
- [ ] Permission constants: `EXAMINATION_SERVICE_TEMPLATE_DOWNLOAD_PERMISSION`, `EXAMINATION_SERVICE_RECORD_PERMISSION`.
- [ ] `describeExaminationDetailRecordError(error)`: map `PARTICIPANT_CHANGED` → "Thông tin người khám vừa được cập nhật ở nơi khác. Tải lại để xem dữ liệu mới nhất." (`needsReload: true`); `PARTICIPANT_HAS_PERFORMED_SERVICES` → "Người khám đã có hạng mục được ghi nhận. Bỏ chọn các hạng mục trước khi đánh vắng."; 400 có tên trường → gắn vào field; 409 batch không cho sửa → "Đợt khám không còn cho phép cập nhật chi tiết khám."; 403 → "Bạn không có quyền cập nhật chi tiết khám."

### Task F2 — Nút "Tải file mẫu" + làm rõ dialog nhập Excel
**Files**
- Modify: `components/examination-detail-tab/examination-detail-tab.tsx`
- Modify: `components/examination-detail-tab/examination-detail-import-dialog.tsx`
- Modify: `pages/health-examination-batch-detail-page.tsx` (truyền `canDownloadTemplate`, `canRecord`)

**Các bước**
- [ ] Toolbar actions theo thứ tự: `Xuất Excel` (outline) · `Tải file mẫu` (outline, icon `FileSpreadsheet`/`Download`, chỉ hiện khi `importAllowed && canDownloadTemplate`) · `Nhập Excel` (primary). Trên màn hẹp, cụm nút xuống dòng (toolbar đã `flex-wrap`).
- [ ] Dialog nhập Excel chia 2 bước có đánh số, giống form đợt khám:
  - **Bước 1: Tải file mẫu.** Mô tả: "File mẫu đã có sẵn danh sách người khám và các hạng mục đã ghi nhận. Chỉ điền X vào hạng mục đã khám và cột Ngày khám thực tế nếu cần." Nút "Tải file mẫu".
  - **Bước 2: Tải file đã điền lên.** Ô chọn file như hiện tại.
  - Cảnh báo nhỏ: "Ô để trống nghĩa là chưa khám. Xoá X trong file sẽ bỏ ghi nhận hạng mục đó."
  - Khi lỗi `needsNewExport`: đổi nhãn thành "Tải lại file mẫu".
- [ ] Đổi prop `onExport`/`isExporting` của dialog thành `onDownloadTemplate`/`isDownloadingTemplate`. Nếu user thiếu quyền template thì fallback về export (giữ hành vi cũ).
- [ ] Hiện lỗi tải file mẫu (role `alert`) giống lỗi export.

### Task F3 — Sheet nhập tay cho một người
**Files**
- Create: `components/examination-detail-tab/examination-detail-entry-sheet.tsx`
- Create: `batches/schemas/examination-detail-entry-schema.ts` (Zod)
- Create: `batches/utils/examination-detail-entry-defaults.ts`
- Modify: `components/examination-detail-tab/examination-matrix-table.tsx`
- Modify: `components/examination-detail-tab/examination-detail-tab.tsx`
- Modify: `batches/utils/examination-detail-labels.ts`: đổi tên `isExaminationImportAllowed` → `isExaminationEditAllowed` (giữ alias cũ để không vỡ import)

**Bảng ma trận**
- [ ] Prop mới `onEditRow?: (row) => void`. Khi có thì thêm cột cuối không tiêu đề (sticky phải), nút icon `Pencil` có `aria-label="Cập nhật chi tiết khám của {fullName}"`. Dòng có `cursor-pointer`, click mở Sheet, Enter/Space trên dòng cũng mở (`tabIndex=0`). `colSpan` của dòng trống +1.
- [ ] Dòng vừa lưu được highlight nhẹ khoảng 1.5s (`bg-primary/5`) để người dùng thấy thay đổi.

**Sheet `ExaminationDetailEntrySheet`**
- Props: `open`, `onOpenChange`, `organizationId`, `batch` (`id`, `startDate`, `services`), `row`, `onSaved(row)`, `onNext?()`, `hasNext`.
- [ ] Header: họ tên, mã người khám, đơn vị, ngày khám dự kiến, badge trạng thái hiện tại (dùng `getExaminationStatusLabel` + tone của bảng).
- [ ] Trường **Tình trạng**: 2 nút segmented "Đã đến" / "Vắng" (`role="radiogroup"`). Không có radix radio-group trong `components/ui`, nên tự dựng bằng `Button` + `aria-checked`.
- [ ] Trường **Ngày khám thực tế** (`<Input type="date">`): `min = batch.startDate`, `max = hôm nay (Asia/Ho_Chi_Minh)`. Mặc định là `row.actualExaminationDate`, nếu không có thì `row.examinationDate` khi ngày đó ≤ hôm nay, còn lại là hôm nay. Ẩn khi chọn "Vắng".
- [ ] **Hạng mục đã khám**: list checkbox theo thứ tự `batch.services`, có "Chọn tất cả / Bỏ chọn tất cả" và đếm `n/m`. Hạng mục `active === false` mà chưa tick thì disabled kèm chú thích "Không còn áp dụng"; đã tick thì vẫn bỏ tick được. Chọn "Vắng" thì toàn bộ disabled và bị xoá chọn.
- [ ] Zod schema: `ATTENDED` ⇒ có ngày hợp lệ trong khoảng và ≥ 1 hạng mục ("Chọn ít nhất một hạng mục đã khám"); `ABSENT` ⇒ không có hạng mục.
- [ ] Gợi ý: nếu đang có X mà chọn "Vắng" thì hiện inline note "Các hạng mục đã ghi nhận sẽ cần bỏ chọn trước". Backend vẫn là nơi quyết định (409).
- [ ] Footer: `Hủy` · `Lưu` · `Lưu & người tiếp theo` (chỉ khi `hasNext`). Nút disabled khi form không đổi so với giá trị ban đầu hoặc đang gửi. `Ctrl/⌘+Enter` = Lưu.
- [ ] Gửi `rowVersion` của `row` lúc mở. Khi 409 `PARTICIPANT_CHANGED`: hiện `Alert` kèm nút "Tải lại dữ liệu"; bấm thì refetch list, lấy row mới, reset form và giữ Sheet mở.
- [ ] Đóng Sheet khi đang có thay đổi chưa lưu thì hỏi xác nhận bằng `Dialog` nhỏ (không dùng `window.confirm`).
- [ ] Thành công: toast/inline status "Đã cập nhật chi tiết khám của {fullName}"; gọi `onSaved`. Với "Lưu & người tiếp theo" thì chuyển sang row kế tiếp trong `items` của trang hiện tại; hết trang thì `hasNext=false` (không tự nhảy trang, tránh lệch khi đang lọc).

**Tab**
- [ ] `ExaminationDetailTab` nhận thêm `canRecord`; `editAllowed = canRecord && isExaminationEditAllowed(batch.status)`; giữ state `editingRowId`; truyền `onEditRow` vào bảng chỉ khi `editAllowed`.
- [ ] Batch cần có `startDate` trong prop `batch`; page detail đã có dữ liệu này.

### Task F4 — Tests frontend
- [ ] `examination-detail-import-dialog.test.tsx`: có "Bước 1/Bước 2"; nút "Tải file mẫu" gọi template download; lỗi stale hiện "Tải lại file mẫu".
- [ ] `examination-detail-tab.test.tsx`: nút "Tải file mẫu" và cột "Cập nhật" hiện/ẩn theo permission + trạng thái batch (`DRAFT`/`READY` hiện; `FINALIZED` ẩn).
- [ ] `examination-detail-entry-sheet.test.tsx` (mới):
  - mặc định ngày + hạng mục đúng theo row;
  - ATTENDED không tick gì → lỗi validation, không gọi API;
  - chọn Vắng → hạng mục disabled, body gửi `ABSENT` + `[]`;
  - hạng mục inactive chưa tick thì disabled;
  - submit body đúng (có `rowVersion`);
  - 409 PARTICIPANT_CHANGED → alert + "Tải lại dữ liệu";
  - "Lưu & người tiếp theo" chuyển sang row kế.
- [ ] Hook test: `useRecordExaminationDetail` cập nhật cache row + invalidate summary/report/participants.
- [ ] API test: URL `import-template`, PUT URL encode `participantId`.
- [ ] E2E Playwright (`e2e/examination-detail-entry.spec.ts`): mở đợt khám → tab Chi tiết khám → Cập nhật dòng 1 → tick 2 hạng mục → Lưu → dòng có 2 X, trạng thái "Đã đối soát", thẻ "Đã đối soát" tăng 1; tải file mẫu có tên `mau-nhap-chi-tiet-kham-*.xlsx`.
- [ ] Chụp màn hình 1280px và 375px: không cuộn ngang trang, Sheet full-width ở mobile.

---

## 4. Thứ tự làm và kiểm chứng

1. B1 (refactor) → chạy `./mvnw test` cho nhóm ExaminationDetail*, phải xanh không đổi assertion.
2. B2 + B3 + migration → `./mvnw test` (integration cần Docker).
3. B4 docs.
4. F1 → F2 → F3 → F4.
5. Kiểm chứng: `npm run typecheck`, `npm run lint`, `npm test -- src/modules/healthexamination`, `npx playwright test e2e/examination-detail-entry.spec.ts e2e/batch-flow.spec.ts`.
6. Thử tay trên môi trường local: áp migration → **đăng nhập lại** → nhập tay 1 người → xuất / tải file mẫu → import lại file vừa tải (`updated = 0`).

## 5. Rủi ro và lưu ý
- **Nhập tay rồi import file cũ:** nhập tay làm tăng `rowVersion`, file Excel tải trước đó sẽ bị từ chối toàn bộ (409 "xuất lại file"). Đây là hành vi đúng, nhưng dialog phải nói rõ "Tải lại file mẫu".
- **Đổi chữ ký `ExaminationDetailReconciler`** ảnh hưởng test import: làm B1 thành commit riêng.
- **Permission snapshot:** user đang đăng nhập sẽ không thấy nút mới cho tới khi đăng nhập lại.
- **Số migration:** kiểm tra số V kế tiếp ngay lúc làm, không đoán.
- Audit/log không chứa tên, CCCD, giá trị ô.

## 6. Để sau (ngoài phạm vi)
- Bật/tắt X trực tiếp trên ô của bảng ma trận (inline toggle), hoặc nhập hàng loạt nhiều người đã chọn.
- Undo về "Chưa đến" (D2: chủ dự án quyết định không làm ở phase này).
- Ghi chú điểm danh (`attendanceNote`) trong Sheet.
- Xoá `OrganizationExaminationDetailTab` / `ParticipantExaminationDetailDrawer` (mock, không dùng).
