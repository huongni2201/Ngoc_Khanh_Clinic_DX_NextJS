import { apiClient } from "@/shared/api/api-client"
import { selectsRoles } from "../utils/account-type"
import {
  eligibleOwnerListSchema,
  assignableRoleListSchema,
  createUserAccountResponseSchema,
  usernameAvailabilitySchema,
  type CreateUserAccountRequestDto,
} from "../types/transport"
import type {
  EligibleOwnerList,
  AccountType,
  AssignableRole,
  CreatedUserAccount,
  CreateUserAccountInput,
} from "../types"

const USER_ACCOUNTS_ENDPOINT = "/api/v1/user-accounts"

function requireData<T>(data: T | undefined, message: string): T {
  if (data === undefined || data === null) throw new Error(message)
  return data
}

export async function fetchAssignableRoles(signal?: AbortSignal): Promise<AssignableRole[]> {
  const response = await apiClient.get<unknown>(`${USER_ACCOUNTS_ENDPOINT}/assignable-roles`, {
    signal,
  })
  const roles = assignableRoleListSchema.parse(
    requireData(response.data, "Phản hồi danh sách vai trò không có dữ liệu.")
  )
  return roles.map((role) => ({
    roleId: role.roleId,
    code: role.code,
    name: role.name,
    description: role.description ?? undefined,
  }))
}

export async function searchEligibleOwners(
  accountType: AccountType,
  keyword: string,
  signal?: AbortSignal
): Promise<EligibleOwnerList> {
  const query = new URLSearchParams({ accountType, keyword })
  const response = await apiClient.get<unknown>(
    `${USER_ACCOUNTS_ENDPOINT}/eligible-owners?${query.toString()}`,
    { signal }
  )
  const list = eligibleOwnerListSchema.parse(
    requireData(response.data, "Phản hồi tìm hồ sơ chủ tài khoản không có dữ liệu.")
  )
  return {
    limited: list.limited,
    items: list.items.map((item) => ({
      ownerId: item.ownerId,
      ownerCode: item.ownerCode,
      fullName: item.fullName,
      departmentName: item.departmentName ?? undefined,
      dateOfBirth: item.dateOfBirth ?? undefined,
      phone: item.phone ?? undefined,
      email: item.email ?? undefined,
      smsPhoneNumber: item.smsPhoneNumber ?? undefined,
    })),
  }
}

export async function checkUsernameAvailability(
  username: string,
  signal?: AbortSignal
): Promise<boolean> {
  const query = new URLSearchParams({ username })
  const response = await apiClient.get<unknown>(
    `${USER_ACCOUNTS_ENDPOINT}/username-availability?${query.toString()}`,
    { signal }
  )
  return usernameAvailabilitySchema.parse(
    requireData(response.data, "Phản hồi kiểm tra tên đăng nhập không có dữ liệu.")
  ).available
}

export async function createUserAccount(input: CreateUserAccountInput): Promise<CreatedUserAccount> {
  const request: CreateUserAccountRequestDto = {
    accountType: input.accountType,
    ownerId: input.ownerId,
    username: input.username,
    temporaryPassword: input.temporaryPassword,
    roleIds: selectsRoles(input.accountType) ? input.roleIds : [],
  }
  const response = await apiClient.post<CreateUserAccountRequestDto, unknown>(
    USER_ACCOUNTS_ENDPOINT,
    request
  )
  return createUserAccountResponseSchema.parse(
    requireData(response.data, "Phản hồi tạo tài khoản không có dữ liệu.")
  )
}
