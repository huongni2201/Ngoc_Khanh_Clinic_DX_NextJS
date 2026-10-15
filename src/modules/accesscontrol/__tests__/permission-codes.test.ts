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

/** Codes the backend migrations insert into `public.permissions`. */
function backendPermissionCodes(): Set<string> {
  const codes = new Set<string>()
  for (const file of readdirSync(MIGRATIONS).filter((name) => /^V.*\.sql$/.test(name))) {
    const sql = readFileSync(join(MIGRATIONS, file), "utf-8")
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
  })
})
