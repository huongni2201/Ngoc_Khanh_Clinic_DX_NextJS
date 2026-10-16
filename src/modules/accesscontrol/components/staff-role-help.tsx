/** Explains the workspace attached to the role selected for the new staff account. */
export function StaffRoleHelp({ roleCode }: { roleCode: string | undefined }) {
  if (roleCode !== "ADMINISTRATOR" && roleCode !== "CLINIC_MANAGER") return null
  return (
    <p role="status" className="rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
      {roleCode === "CLINIC_MANAGER"
        ? "Quản lý phòng khám quản lý các danh mục khoa, phòng, chuyên khoa, dịch vụ, giá dịch vụ và thuốc. Các mục được cấp quyền sẽ hiện trên thanh điều hướng sau khi đăng nhập."
        : "Quản trị viên quản lý tài khoản nhân viên và phân quyền. Để giao quản lý các danh mục của phòng khám, hãy chọn vai trò Quản lý phòng khám."}
    </p>
  )
}
