import type { PermissionCatalogItem } from "../types/role"

/**
 * Pending changes of one role on the Role Permissions screen (SRS 1.3.4): permissions to grant and
 * to remove, relative to what the role has now. Only real changes are kept, so checking a box and
 * clearing it again leaves no pending change.
 */
export interface RolePermissionDraft {
  grant: ReadonlySet<string>
  revoke: ReadonlySet<string>
}

export const EMPTY_DRAFT: RolePermissionDraft = { grant: new Set(), revoke: new Set() }

export const ADMINISTRATOR_ROLE_CODE = "ADMINISTRATOR"
/** Role of patient portal accounts: always active and never a source to copy permissions from. */
export const PATIENT_ROLE_CODE = "PATIENT"

/**
 * Permissions the Administrator role never loses (backend `Role.ADMINISTRATOR_PROTECTED_PERMISSIONS`),
 * so roles can always be administered again.
 */
export const ADMINISTRATOR_PROTECTED_PERMISSIONS: ReadonlySet<string> = new Set([
  "ROLE_MANAGE",
  "ROLE_UPDATE",
  "PERMISSION_VIEW",
  "ROLE_PERMISSION_VIEW",
  "ROLE_PERMISSION_ASSIGN",
])

/** Whether the permission is locked for this role: granted and protected on the Administrator. */
export function isProtectedPermission(roleCode: string, code: string, granted: ReadonlySet<string>) {
  return (
    roleCode === ADMINISTRATOR_ROLE_CODE &&
    granted.has(code) &&
    ADMINISTRATOR_PROTECTED_PERMISSIONS.has(code)
  )
}

/** Sets each permission to granted or not, recording only differences from `granted`. */
export function setPermissions(
  draft: RolePermissionDraft,
  granted: ReadonlySet<string>,
  codes: readonly string[],
  checked: boolean
): RolePermissionDraft {
  const grant = new Set(draft.grant)
  const revoke = new Set(draft.revoke)
  for (const code of codes) {
    grant.delete(code)
    revoke.delete(code)
    if (checked && !granted.has(code)) grant.add(code)
    if (!checked && granted.has(code)) revoke.add(code)
  }
  return { grant, revoke }
}

/** Whether the permission is granted once the pending changes are saved. */
export function isGrantedAfterSave(
  draft: RolePermissionDraft,
  granted: ReadonlySet<string>,
  code: string
) {
  if (draft.grant.has(code)) return true
  if (draft.revoke.has(code)) return false
  return granted.has(code)
}

export function pendingChangeOf(draft: RolePermissionDraft, code: string): "grant" | "revoke" | null {
  if (draft.grant.has(code)) return "grant"
  if (draft.revoke.has(code)) return "revoke"
  return null
}

export function hasPendingChanges(draft: RolePermissionDraft | undefined) {
  return Boolean(draft && (draft.grant.size > 0 || draft.revoke.size > 0))
}

/**
 * Drops pending changes that the saved permissions already contain, for example after another user
 * made the same change. Returns the same object when nothing is dropped.
 */
export function rebaseDraft(
  draft: RolePermissionDraft,
  granted: ReadonlySet<string>
): RolePermissionDraft {
  const grant = [...draft.grant].filter((code) => !granted.has(code))
  const revoke = [...draft.revoke].filter((code) => granted.has(code))
  if (grant.length === draft.grant.size && revoke.length === draft.revoke.size) return draft
  return { grant: new Set(grant), revoke: new Set(revoke) }
}

/**
 * Drops from the draft the changes a successful save sent. Changes made while the save was in
 * flight stay pending. Returns null when nothing is left.
 */
export function subtractSent(
  draft: RolePermissionDraft,
  sent: { grant: readonly string[]; revoke: readonly string[] }
): RolePermissionDraft | null {
  const sentGrant = new Set(sent.grant)
  const sentRevoke = new Set(sent.revoke)
  const grant = new Set([...draft.grant].filter((code) => !sentGrant.has(code)))
  const revoke = new Set([...draft.revoke].filter((code) => !sentRevoke.has(code)))
  return grant.size === 0 && revoke.size === 0 ? null : { grant, revoke }
}

export interface PermissionModuleGroup {
  module: string
  permissions: PermissionCatalogItem[]
}

/** Groups the catalogue by module, keeping the backend order (module, then code). */
export function groupByModule(permissions: readonly PermissionCatalogItem[]): PermissionModuleGroup[] {
  const groups = new Map<string, PermissionCatalogItem[]>()
  for (const permission of permissions) {
    const group = groups.get(permission.module)
    if (group) group.push(permission)
    else groups.set(permission.module, [permission])
  }
  return [...groups].map(([module, items]) => ({ module, permissions: items }))
}

/**
 * Permissions whose name contains the search, ignoring case, optionally only those granted once the
 * pending changes are saved.
 */
export function filterPermissions(
  permissions: readonly PermissionCatalogItem[],
  search: string,
  isGranted: ((code: string) => boolean) | null
): PermissionCatalogItem[] {
  const keyword = search.trim().toLocaleLowerCase("vi")
  return permissions.filter((permission) => {
    if (isGranted && !isGranted(permission.code)) return false
    return !keyword || permission.name.toLocaleLowerCase("vi").includes(keyword)
  })
}
