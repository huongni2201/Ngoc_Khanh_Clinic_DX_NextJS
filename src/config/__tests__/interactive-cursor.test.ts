import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8")
const dropdownMenu = readFileSync(join(process.cwd(), "src/components/ui/dropdown-menu.tsx"), "utf8")

/** The `@layer base` block that restores the pointer cursor Tailwind v4 removed from buttons. */
function pointerRuleSelectors(): string {
  const match = css.match(/([^{}]*button:not\(:disabled\)[^{}]*)\{\s*cursor:\s*pointer;\s*\}/)
  return match?.[1] ?? ""
}

describe("pointer cursor on interactive controls", () => {
  it("declares a pointer cursor for buttons and the ARIA roles Base UI renders", () => {
    const selectors = pointerRuleSelectors()

    expect(selectors).not.toBe("")
    for (const role of ["button", "tab", "menuitem", "option", "checkbox", "radio", "switch"]) {
      expect(selectors).toContain(`[role="${role}"]`)
    }
  })

  it("does not apply the pointer to disabled controls", () => {
    const selectors = pointerRuleSelectors()

    expect(selectors).toContain("button:not(:disabled)")
    expect(selectors).toContain('[aria-disabled="true"]')
    expect(selectors).toContain("[data-disabled]")
  })

  it("keeps dropdown menu items from overriding it with the default arrow", () => {
    expect(dropdownMenu).not.toContain("cursor-default")
  })
})
