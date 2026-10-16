import type { PermissionCatalogItem } from "../types/role"

/**
 * Vietnamese names of the permission modules seeded by the backend migrations (V002–V005). The
 * backend stores English; a module added later falls back to its stored name.
 */
const MODULE_LABELS: Record<string, string> = {
  Appointment: "Lịch hẹn",
  "Audit Logs": "Nhật ký hệ thống",
  "Batch Examination Data": "Dữ liệu khám theo đợt",
  "Clinic Master Data": "Danh mục phòng khám",
  "Diagnostic Report": "Phiếu kết quả cận lâm sàng",
  "Diagnostic Result": "Kết quả cận lâm sàng",
  "Diagnostic Service Request": "Chỉ định cận lâm sàng",
  Encounter: "Lượt khám",
  "Health Examination Batch": "Đợt khám sức khỏe",
  "Invoice and Payment": "Hóa đơn và thanh toán",
  "National Health Data Submission": "Gửi dữ liệu y tế quốc gia",
  Organization: "Đơn vị",
  Participant: "Người khám",
  "Participant Examination Form": "Phiếu khám của người khám",
  "Participant Examination Record": "Hồ sơ khám của người khám",
  Patient: "Bệnh nhân",
  "Patient and Participant": "Bệnh nhân và người khám",
  "Patient safety and history": "Tiền sử và an toàn người bệnh",
  Prescription: "Đơn thuốc",
  "Reports and Analytics": "Báo cáo và phân tích",
  "Roles and Permissions": "Vai trò và phân quyền",
  "User Account": "Tài khoản người dùng",
}

/**
 * Vietnamese names of the permissions seeded by the backend migrations (V002–V005), by code. The
 * backend stores English names; a permission added later falls back to its stored name.
 */
const PERMISSION_LABELS: Record<string, string> = {
  APPOINTMENT_CANCEL: "Hủy lịch hẹn",
  APPOINTMENT_CREATE: "Tạo lịch hẹn hoặc lịch tái khám",
  APPOINTMENT_NO_SHOW_MARK: "Đánh dấu không đến hẹn",
  APPOINTMENT_RESCHEDULE: "Đổi lịch hẹn",
  APPOINTMENT_VIEW: "Xem lịch hẹn",
  OWN_APPOINTMENT_VIEW: "Xem lịch hẹn của bản thân",
  AUDIT_LOG_VIEW: "Xem nhật ký hoạt động hệ thống",
  BATCH_EXAMINATION_DATA_COMPLETION_VIEW: "Xem mức độ hoàn thành dữ liệu người khám và đợt khám",
  BATCH_EXAMINATION_DATA_IMPORT_REVIEW: "Rà soát dữ liệu khám đã nhập",
  BATCH_EXAMINATION_DATA_MISSING_REVIEW: "Rà soát dữ liệu khám còn thiếu",
  BATCH_EXAMINATION_DATA_UPLOAD: "Tải lên dữ liệu khám",
  HEALTH_EXAMINATION_REPORT_EXPORT: "Xuất báo cáo thanh toán đợt khám",
  HEALTH_EXAMINATION_REPORT_READ: "Xem báo cáo thanh toán đợt khám",
  HEALTH_EXAMINATION_SERVICE_EXPORT: "Xuất chi tiết dịch vụ khám",
  HEALTH_EXAMINATION_SERVICE_READ: "Xem chi tiết dịch vụ khám",
  HEALTH_EXAMINATION_SERVICE_RECONCILE: "Đối soát dịch vụ khám",
  HEALTH_EXAMINATION_SERVICE_RECORD: "Ghi nhận chi tiết khám của một người khám",
  HEALTH_EXAMINATION_SERVICE_SUMMARY_READ: "Xem tổng hợp dịch vụ khám",
  HEALTH_EXAMINATION_SERVICE_TEMPLATE_DOWNLOAD: "Tải mẫu nhập chi tiết khám",
  MASTER_DATA_DOCUMENT_TEMPLATE_MANAGE: "Quản lý mẫu tài liệu",
  MASTER_DATA_LAB_MEDICATION_MANAGE: "Quản lý danh mục xét nghiệm và thuốc",
  MASTER_DATA_NOTIFICATION_TEMPLATE_MANAGE: "Quản lý mẫu thông báo",
  MASTER_DATA_SERVICE_CATALOG_MANAGE: "Quản lý danh mục và giá dịch vụ",
  MASTER_DATA_STAFF_FACILITY_MANAGE: "Quản lý hồ sơ nhân viên, khoa, chuyên khoa và phòng",
  SERVICE_CATALOG_VIEW: "Xem danh mục dịch vụ",
  OWN_DIAGNOSTIC_REPORT_VIEW: "Xem phiếu kết quả cận lâm sàng đã trả của bản thân",
  DIAGNOSTIC_RESULT_AMEND: "Sửa kết quả đã chốt và lưu phiên bản cũ",
  DIAGNOSTIC_RESULT_FINALIZE: "Chốt kết quả cận lâm sàng",
  DIAGNOSTIC_RESULT_PRINT: "In kết quả đã chốt cho bệnh nhân",
  DIAGNOSTIC_RESULT_RECORD: "Ghi kết quả cận lâm sàng",
  DIAGNOSTIC_RESULT_REVIEW: "Xem các kết quả đã có của lượt khám",
  DIAGNOSTIC_RESULT_VIEW: "Xem kết quả và trạng thái cận lâm sàng",
  DIAGNOSTIC_PROGRESS_VIEW: "Xem tiến độ cận lâm sàng của lượt khám",
  DIAGNOSTIC_SERVICE_REQUEST_CANCEL: "Hủy chỉ định trước khi thực hiện",
  DIAGNOSTIC_SERVICE_REQUEST_CREATE: "Tạo chỉ định cận lâm sàng",
  DIAGNOSTIC_SERVICE_REQUEST_PRINT: "In phiếu chỉ định",
  DIAGNOSTIC_SERVICE_REQUEST_UPDATE: "Sửa chỉ định trước khi xử lý",
  ENCOUNTER_AMEND: "Sửa hồ sơ đã hoàn tất và lưu lịch sử thay đổi",
  ENCOUNTER_CANCEL: "Hủy lượt khám trước khi khám",
  ENCOUNTER_COMPLETE: "Hoàn tất lượt khám",
  ENCOUNTER_CONCLUSION_RECORD: "Ghi kết luận và hướng dẫn tái khám",
  ENCOUNTER_CREATE: "Tiếp nhận bệnh nhân ngoại trú và tạo lượt khám",
  ENCOUNTER_DIAGNOSIS_RECORD: "Ghi chẩn đoán xác định",
  ENCOUNTER_FINDINGS_RECORD: "Ghi kết quả khám lâm sàng",
  ENCOUNTER_ROOM_CHANGE: "Đổi phòng khám của lượt khám",
  GENERAL_PRACTITIONER_WORKLIST_VIEW: "Xem danh sách chờ khám của bác sĩ",
  OWN_ENCOUNTER_VIEW: "Xem lịch sử và chi tiết khám của bản thân",
  RECEPTION_WORKLIST_VIEW: "Xem danh sách tiếp đón",
  HEALTH_EXAMINATION_BATCH_CANCEL: "Hủy đợt khám",
  HEALTH_EXAMINATION_BATCH_CLOSE: "Đóng đợt khám",
  HEALTH_EXAMINATION_BATCH_CREATE: "Tạo đợt khám sức khỏe",
  HEALTH_EXAMINATION_BATCH_DELETE: "Xóa đợt khám",
  HEALTH_EXAMINATION_BATCH_DETAIL_VIEW: "Xem chi tiết đợt khám",
  HEALTH_EXAMINATION_BATCH_PRICE_CONFIGURE: "Cấu hình giá dịch vụ của đợt khám",
  HEALTH_EXAMINATION_BATCH_SERVICE_CONFIGURE: "Cấu hình dịch vụ khám của đợt khám",
  HEALTH_EXAMINATION_BATCH_START: "Bắt đầu đợt khám",
  HEALTH_EXAMINATION_BATCH_UPDATE: "Cập nhật đợt khám",
  HEALTH_EXAMINATION_BATCH_VIEW: "Xem các đợt khám của đơn vị",
  PAYMENT_CANCEL: "Hủy thanh toán đang chờ",
  PAYMENT_COLLECT: "Thu phí khám và dịch vụ cận lâm sàng",
  PAYMENT_QR_CREATE: "Tạo yêu cầu thanh toán QR",
  PAYMENT_RECEIPT_PRINT: "In biên lai thanh toán",
  PAYMENT_RECONCILE: "Đối soát thanh toán",
  PAYMENT_REFUND: "Hoàn tiền",
  PAYMENT_VIEW: "Xem chi phí và lịch sử thanh toán của lượt khám",
  NATIONAL_SUBMISSION_ERROR_REVIEW: "Xem lỗi gửi dữ liệu",
  NATIONAL_SUBMISSION_PREPARE: "Chuẩn bị gói dữ liệu",
  NATIONAL_SUBMISSION_RETRY: "Gửi lại dữ liệu lỗi sau khi xử lý",
  NATIONAL_SUBMISSION_STATUS_VIEW: "Xem trạng thái gửi dữ liệu",
  NATIONAL_SUBMISSION_SUBMIT: "Gửi dữ liệu",
  NATIONAL_SUBMISSION_VALIDATE: "Kiểm tra gói dữ liệu",
  ORGANIZATION_CREATE: "Tạo đơn vị",
  ORGANIZATION_DELETE: "Xóa đơn vị",
  ORGANIZATION_SEARCH: "Tìm kiếm đơn vị",
  ORGANIZATION_UPDATE: "Cập nhật đơn vị",
  ORGANIZATION_VIEW: "Xem chi tiết đơn vị",
  PARTICIPANT_CREATE: "Thêm người khám vào đợt khám",
  PARTICIPANT_DETAIL_VIEW: "Xem chi tiết người khám",
  PARTICIPANT_IMPORT: "Nhập danh sách người khám",
  PARTICIPANT_REACTIVATE: "Khôi phục người khám",
  PARTICIPANT_REMOVE: "Hủy người khám khỏi đợt khám",
  PARTICIPANT_TEMPLATE_DOWNLOAD: "Tải mẫu nhập danh sách người khám",
  PARTICIPANT_UPDATE: "Cập nhật thông tin người khám",
  PARTICIPANT_VIEW: "Xem danh sách người khám",
  DOCUMENT_RENDER_JOB_DOWNLOAD: "Tải một phần của lệnh in",
  DOCUMENT_RENDER_JOB_READ: "Xem lệnh in",
  PARTICIPANT_EXAMINATION_FORM_BULK_PRINT: "In hàng loạt phiếu khám",
  PARTICIPANT_EXAMINATION_FORM_CREATE: "Tạo phiếu khám sức khỏe",
  PARTICIPANT_EXAMINATION_FORM_PRINT: "In một phiếu khám",
  PARTICIPANT_EXAMINATION_CONCLUSION_RECORD: "Ghi kết luận khám sức khỏe",
  PARTICIPANT_EXAMINATION_DATA_ENTER: "Nhập dữ liệu khám",
  PARTICIPANT_EXAMINATION_RECORD_AMEND: "Sửa hồ sơ đã phát hành",
  PARTICIPANT_EXAMINATION_RECORD_COMPLETE: "Hoàn tất khám sức khỏe cho người khám",
  PARTICIPANT_EXAMINATION_RECORD_ISSUE: "Phát hành hồ sơ đã hoàn tất",
  PARTICIPANT_EXAMINATION_RECORD_PREPARE: "Chuẩn bị hồ sơ và liên kết bệnh nhân",
  PARTICIPANT_EXAMINATION_RECORD_REVIEW: "Rà soát dữ liệu khám của người khám",
  PARTICIPANT_EXAMINATION_RECORD_VIEW: "Xem chi tiết khám sức khỏe của người khám",
  OWN_CONTACT_UPDATE: "Cập nhật thông tin liên hệ của bản thân",
  PATIENT_CREATE: "Tạo hồ sơ bệnh nhân",
  PATIENT_UPDATE: "Cập nhật thông tin cá nhân và liên hệ",
  PATIENT_VIEW: "Tìm bệnh nhân và xem thông tin tóm tắt",
  PARTICIPANT_IDENTITY_CONFLICT_RESOLVE: "Xử lý xung đột thông tin định danh và nhân khẩu",
  PATIENT_HISTORY_VIEW: "Xem các lần khám trước và tiền sử bệnh",
  PATIENT_SAFETY_UPDATE: "Ghi hoặc cập nhật dị ứng, bệnh lý và cảnh báo",
  PATIENT_SAFETY_VIEW: "Xem tiền sử và thông tin an toàn liên quan",
  OWN_PRESCRIPTION_VIEW: "Xem đơn thuốc được kê cho bản thân",
  PRESCRIPTION_CREATE: "Kê đơn thuốc",
  PRESCRIPTION_PRINT: "In đơn thuốc",
  PRESCRIPTION_UPDATE: "Sửa đơn thuốc trước khi chốt",
  ANALYTICS_DIAGNOSTIC_APPOINTMENT_VIEW: "Phân tích hiệu suất cận lâm sàng và lịch hẹn",
  ANALYTICS_REVENUE_VIEW: "Phân tích doanh thu và thanh toán",
  ANALYTICS_STAFF_ACTIVITY_VIEW: "Phân tích hoạt động theo khoa, phòng và bác sĩ",
  ANALYTICS_VISIT_VIEW: "Phân tích lượt khám, kết quả khám và sử dụng dịch vụ",
  DASHBOARD_VIEW: "Xem bảng điều khiển vận hành",
  REPORT_BATCH_DATA_COMPLETION_EXPORT: "Xuất báo cáo hoàn thành dữ liệu đợt khám",
  REPORT_BATCH_FINANCIAL_SUMMARY_EXPORT: "Xuất tổng hợp tài chính đợt khám",
  REPORT_EXAMINATION_SERVICE_SUMMARY_EXPORT: "Xuất báo cáo tổng hợp dịch vụ khám",
  REPORT_OPERATIONAL_EXPORT: "Xuất báo cáo vận hành",
  REPORT_PARTICIPANT_EXAMINATION_EXPORT: "Xuất báo cáo chi tiết khám của người khám",
  PERMISSION_VIEW: "Xem danh mục quyền",
  ROLE_CREATE: "Tạo vai trò",
  ROLE_MANAGE: "Xem, tạo, cập nhật và ngừng hoạt động vai trò",
  ROLE_PERMISSION_ASSIGN: "Cấp hoặc gỡ quyền của vai trò",
  ROLE_PERMISSION_VIEW: "Xem quyền của vai trò",
  ROLE_UPDATE: "Cập nhật, kích hoạt hoặc ngừng hoạt động vai trò",
  ROLE_VIEW: "Xem các vai trò có thể gán",
  USER_ROLE_ASSIGN: "Gán hoặc gỡ vai trò của người dùng",
  STAFF_MEMBER_VIEW: "Xem danh sách nhân viên",
  USER_ACCOUNT_CREATE: "Tạo tài khoản người dùng",
  USER_ACCOUNT_STATUS_UPDATE: "Khóa hoặc mở lại tài khoản người dùng",
}

export function moduleLabel(module: string) {
  return MODULE_LABELS[module] ?? module
}

export function permissionLabel(permission: Pick<PermissionCatalogItem, "code" | "name">) {
  return PERMISSION_LABELS[permission.code] ?? permission.name
}

/**
 * The catalogue as shown on the Role Permissions screen: Vietnamese names and modules, ordered by
 * module, then by name, in Vietnamese collation.
 */
export function toDisplayCatalog(
  catalog: readonly PermissionCatalogItem[]
): PermissionCatalogItem[] {
  return catalog
    .map((permission) => ({
      ...permission,
      name: permissionLabel(permission),
      module: moduleLabel(permission.module),
    }))
    .sort(
      (a, b) => a.module.localeCompare(b.module, "vi") || a.name.localeCompare(b.name, "vi")
    )
}
