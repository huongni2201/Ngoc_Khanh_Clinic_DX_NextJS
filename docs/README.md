# Mục lục tài liệu frontend

Cập nhật 2026-10-09. Tài liệu hiện hành mô tả trạng thái source và contract;
ADR ghi quyết định; báo cáo kiểm tra ghi kết quả và giới hạn theo thời điểm.

## Tài liệu hiện hành

| Cần tra cứu | Tài liệu | Vai trò |
|---|---|---|
| Chạy dự án, môi trường, trạng thái tích hợp | [README](../README.md) | Điểm bắt đầu cho người phát triển. |
| Quy định và điều kiện hoàn tất | [PROJECT_RULES](../PROJECT_RULES.md) | Nguồn chính sách frontend. |
| Hướng dẫn cho agent và chọn skill | [AGENTS](../AGENTS.md), [PROJECT_SKILLS](../PROJECT_SKILLS.md) | Chỉ dẫn theo loại công việc. |
| Module, composition, state và luồng API | [Frontend architecture](architecture/FRONTEND_ARCHITECTURE.md) | Cấu trúc đã triển khai. |
| Quyết định kiến trúc | [ADR index](adr/README.md) | Quyết định Accepted và quan hệ supersede. |
| UI và cách dùng token | [Design reference](../design-system/ngoc-khanh-clinic/MASTER.md) | Cách dùng; giá trị nằm trong globals.css. |
| Việc triển khai còn mở | [Code follow-ups](maintenance/code-follow-ups.md) | Bằng chứng, dependency và tiêu chí sửa. |

## Hợp đồng backend

Backend handlers/DTOs định nghĩa HTTP surface. Contract tồn tại chưa chứng minh
authorization production; đối chiếu các khoảng trống quyền trong inventory.

- [API inventory](../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/clean-slate-migration.md).
- [Login/session](../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/login.md).
- [Organization và Batch](../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/organizations-and-batches.md).
- [Participant list/template/import](../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/participant-import-and-list.md).
- [Participant manual changes](../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/participant-manual-crud.md).
- [Examination details và payment report](../../Ngoc_Khanh_Clinic_DX_Springboot/docs/api/examination-details-and-report.md).

Các liên kết này cần checkout backend ở thư mục cùng cấp.

## Kết quả kiểm chứng

[Module verification 2026-10-09](maintenance/backend-aligned-modules-verification.md)
ghi kết quả kiểm tra và giới hạn của lần chuyển module. Cấu trúc hiện tại nằm
trong frontend architecture; quyết định sở hữu module nằm trong ADR-0009.

## Cập nhật tài liệu

- Sửa tài liệu hiện hành khi source/contract thay đổi; dùng follow-ups cho lệch
  contract chưa được sửa trong runtime.
- Giữ nguyên quyết định ADR Accepted; quyết định mới dùng ADR mới hoặc supersede.
- Xóa tài liệu lỗi thời hoặc đã bị thay thế sau khi quyết định còn hiệu lực và
  việc còn mở đã được ghi trong ADR, kiến trúc hoặc follow-ups hiện hành.
- Kiểm link/anchor, resource skill, tính nhất quán contract và diff theo
  [definition of done](../PROJECT_RULES.md#28-definition-of-done). Kết quả kiểm tra
  runtime từ báo cáo cũ không phải kết quả của lần sửa docs mới.
