const USERNAME_BASE_MAX_LENGTH = 140

/**
 * Preview of the username prefix the backend will generate, shown while typing the name: the last
 * word followed by the first letter of each earlier word, without diacritics (`Nguyễn Văn An` →
 * `annv`). The backend owns the rule and appends the next free number (`annv1`, `annv2`, …), so the
 * preview is never sent and never shown as the final username.
 */
export function previewUsernameBase(fullName: string): string | null {
  const words = fullName
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z]/g, ""))
    .filter((word) => word.length > 0)

  if (words.length === 0) return null
  const last = words[words.length - 1]
  const initials = words.slice(0, -1).map((word) => word[0]).join("")
  return `${last}${initials}`.slice(0, USERNAME_BASE_MAX_LENGTH)
}
