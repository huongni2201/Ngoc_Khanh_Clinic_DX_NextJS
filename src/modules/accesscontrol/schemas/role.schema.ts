import { z } from "zod"

export const ROLE_CODE_MAX_LENGTH = 80
export const ROLE_NAME_MAX_LENGTH = 100
export const ROLE_DESCRIPTION_MAX_LENGTH = 500
/** Uppercase letters, digits and underscores, starting with a letter (SRS 1.3.2, backend V005). */
export const ROLE_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/

const roleName = z
  .string()
  .trim()
  .min(1, { message: "Tên vai trò là bắt buộc" })
  .max(ROLE_NAME_MAX_LENGTH, {
    message: `Tên vai trò không được vượt quá ${ROLE_NAME_MAX_LENGTH} ký tự`,
  })

const roleDescription = z.string().max(ROLE_DESCRIPTION_MAX_LENGTH, {
  message: `Mô tả không được vượt quá ${ROLE_DESCRIPTION_MAX_LENGTH} ký tự`,
})

/**
 * Form rules of the New Role panel (SRS 1.3.2). They only catch typing mistakes early: the backend
 * decides uniqueness of the code and the name.
 */
export const createRoleSchema = z.object({
  name: roleName,
  code: z
    .string()
    .trim()
    .min(1, { message: "Mã vai trò là bắt buộc" })
    .max(ROLE_CODE_MAX_LENGTH, {
      message: `Mã vai trò không được vượt quá ${ROLE_CODE_MAX_LENGTH} ký tự`,
    })
    .regex(ROLE_CODE_PATTERN, {
      message: "Mã vai trò chỉ gồm chữ in hoa, chữ số và dấu gạch dưới, bắt đầu bằng chữ cái",
    }),
  description: roleDescription,
  /** Empty means "do not copy". */
  copyFromRoleId: z.string(),
  active: z.boolean(),
})

export type CreateRoleFormValues = z.input<typeof createRoleSchema>
export type ValidatedCreateRoleFormValues = z.output<typeof createRoleSchema>

export const EMPTY_CREATE_ROLE_FORM: CreateRoleFormValues = {
  name: "",
  code: "",
  description: "",
  copyFromRoleId: "",
  active: true,
}

/** Form rules of the Edit Role panel (SRS 1.3.3). The code is read-only. */
export const updateRoleSchema = z.object({
  name: roleName,
  description: roleDescription,
  active: z.boolean(),
})

export type UpdateRoleFormValues = z.input<typeof updateRoleSchema>
export type ValidatedUpdateRoleFormValues = z.output<typeof updateRoleSchema>
