import { ACCOUNT_TYPES } from "../types/transport"
import type { AccountType } from "../types"

interface AccountTypeCopy {
  label: string
  description: string
  /** Profile noun used in sentences, e.g. "hồ sơ nhân viên". */
  profileNoun: string
  ownerCodeHeader: string
  searchPlaceholder: string
  searchHint: string
  /** STAFF accounts take selected roles; PATIENT accounts receive the PATIENT role. */
  selectsRoles: boolean
}

/** Everything that differs between the two account types, in one place. */
export const ACCOUNT_TYPE_COPY: Record<AccountType, AccountTypeCopy> = {
  STAFF: {
    label: "Nhân viên",
    description: "Bác sĩ, điều dưỡng, lễ tân, quản lý",
    profileNoun: "nhân viên",
    ownerCodeHeader: "Mã NV",
    searchPlaceholder: "Mã nhân viên, họ tên hoặc số điện thoại",
    searchHint: "Nhập mã nhân viên, họ tên hoặc số điện thoại.",
    selectsRoles: true,
  },
  PATIENT: {
    label: "Bệnh nhân",
    description: "Truy cập cổng bệnh nhân để xem kết quả, đơn thuốc",
    profileNoun: "bệnh nhân",
    ownerCodeHeader: "Mã BN",
    searchPlaceholder: "Mã bệnh nhân, họ tên, số điện thoại hoặc số CCCD",
    searchHint: "Nhập mã bệnh nhân, họ tên, số điện thoại hoặc số CCCD.",
    selectsRoles: false,
  },
}

export function isAccountType(value: unknown): value is AccountType {
  return (ACCOUNT_TYPES as readonly unknown[]).includes(value)
}

export function selectsRoles(accountType: AccountType): boolean {
  return ACCOUNT_TYPE_COPY[accountType].selectsRoles
}
