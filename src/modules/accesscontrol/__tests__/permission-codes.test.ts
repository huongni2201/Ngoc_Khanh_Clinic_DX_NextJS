import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { PERMISSION } from "../permissions"

// The backend repository sits next to this one. Without it (a checkout of the frontend alone) the
// comparison is skipped instead of failing.
const MIGRATIONS = resolve(
  process.cwd(),
  "../Ngoc_Khanh_Clinic_DX_Springboot/src/main/resources/db/migration"
)

/** `SET code = 'NEW_' || substr(code, char_length('OLD_') + 1) WHERE starts_with(code, 'OLD_')`. */
const PREFIX_RENAME =
  /SET code = '([A-Z0-9_]+)' \|\| substr\(code, char_length\('([A-Z0-9_]+)'\) \+ 1\)\s*WHERE starts_with\(code, '([A-Z0-9_]+)'\)/g

/** `SET code = 'NEW' WHERE code = 'OLD'`. */
const SINGLE_RENAME = /SET code = '([A-Z0-9_]+)' WHERE code = '([A-Z0-9_]+)'/g

/**
 * Codes the backend migrations leave in `public.permissions`: the ones they insert, minus the ones
 * a later migration renames (V007 renames the BATCH permissions to AGREEMENT ones). A file applies
 * its renames before its inserts, which is the order of the migration that renames.
 */
function backendPermissionCodes(): Set<string> {
  const codes = new Set<string>()
  const files = readdirSync(MIGRATIONS)
    .filter((name) => /^V.*\.sql$/.test(name))
    .sort()
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS, file), "utf-8")

    for (const [, next, previous] of sql.matchAll(PREFIX_RENAME)) {
      for (const code of [...codes]) {
        if (!code.startsWith(previous)) continue
        codes.delete(code)
        codes.add(next + code.slice(previous.length))
      }
    }
    for (const [, next, previous] of sql.matchAll(SINGLE_RENAME)) {
      if (codes.delete(previous)) codes.add(next)
    }

    for (const insert of sql.matchAll(/^INSERT INTO public\.permissions\b/gm)) {
      const rest = sql.slice(insert.index)
      const next = rest.slice(1).search(/^INSERT INTO /m)
      const block = next === -1 ? rest : rest.slice(0, next + 1)
      for (const row of block.matchAll(/^\s*\('([A-Z][A-Z0-9_]*)',/gm)) codes.add(row[1])
    }
  }
  return codes
}

describe("PERMISSION codes", () => {
  it("name themselves, so a code is written once", () => {
    for (const [key, value] of Object.entries(PERMISSION)) expect(value).toBe(key)
  })

  describe.skipIf(!existsSync(MIGRATIONS))("against the backend migrations", () => {
    it("are all permissions the backend defines", () => {
      const backend = backendPermissionCodes()

      // A parse that finds nothing would make the check below pass for any typo.
      expect(backend.size).toBeGreaterThan(50)
      const unknown = Object.values(PERMISSION).filter((code) => !backend.has(code))
      expect(unknown).toEqual([])
    })

    it("no longer holds the renamed BATCH permissions", () => {
      const backend = backendPermissionCodes()

      expect([...backend].filter((code) => code.startsWith("HEALTH_EXAMINATION_BATCH_"))).toEqual([])
      expect(backend.has("HEALTH_EXAMINATION_AGREEMENT_ACTIVATE")).toBe(true)
      expect(backend.has("HEALTH_EXAMINATION_AGREEMENT_START")).toBe(false)
    })
  })
})
