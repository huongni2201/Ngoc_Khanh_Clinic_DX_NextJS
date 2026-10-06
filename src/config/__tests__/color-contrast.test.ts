import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

type Rgb = readonly [number, number, number]
type Tokens = Record<string, string>

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8")

function block(selector: string): Tokens {
  const start = css.indexOf(`\n${selector} {`)
  const end = css.indexOf("\n}", start)
  const body = css.slice(start, end)
  const tokens: Tokens = {}
  for (const match of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    tokens[match[1]] = match[2].trim()
  }
  return tokens
}

function parse(value: string): { rgb: Rgb; alpha: number } {
  const hex = /^#([0-9a-f]{6})$/i.exec(value)
  if (hex) {
    const n = hex[1]
    return {
      rgb: [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)) as unknown as Rgb,
      alpha: 1,
    }
  }
  const rgba = /^rgba?\(([^)]+)\)$/.exec(value)
  if (rgba) {
    const [r, g, b, a] = rgba[1].split(",").map((part) => Number(part.trim()))
    return { rgb: [r, g, b], alpha: a ?? 1 }
  }
  throw new Error(`Unsupported colour value: ${value}`)
}

function composite(foreground: string, surface: string, alpha?: number): Rgb {
  const fg = parse(foreground)
  const bg = parse(surface).rgb
  const a = alpha ?? fg.alpha
  return fg.rgb.map((channel, i) => Math.round(channel * a + bg[i] * (1 - a))) as unknown as Rgb
}

function luminance([r, g, b]: Rgb): number {
  const linear = (channel: number) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

function contrast(a: Rgb, b: Rgb): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

const themes: Record<string, Tokens> = { light: block(":root"), dark: block(".dark") }

const STATUSES = [
  "status-danger",
  "status-in-progress",
  "status-completed",
  "status-success",
  "status-warning",
  "status-diagnostic",
  "status-conclusion",
  "info",
] as const

/** Text pairs rendered by components: [foreground token, background token, translucent alpha over card]. */
const TEXT_PAIRS: Array<[string, string, number?]> = [
  ["foreground", "background"],
  ["foreground", "card"],
  ["secondary-text", "background"],
  ["secondary-foreground", "secondary"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["muted-foreground", "muted"],
  ["muted-foreground", "surface-alt"],
  ["muted-foreground", "table-header-bg"],
  ["muted-foreground", "hover"],
  ["muted-foreground", "selected"],
  ["primary-foreground", "primary"],
  ["brand-secondary-foreground", "brand-secondary"],
  ["destructive-foreground", "destructive"],
  ["sidebar-foreground", "sidebar"],
  ["sidebar-primary-foreground", "sidebar-primary"],
  ["sidebar-accent-foreground", "sidebar-accent"],
  ["primary", "background"],
  ["primary", "card"],
  ["destructive", "card"],
  ["destructive", "background"],
  ...STATUSES.flatMap((token): Array<[string, string, number?]> => [
    [token, "card"],
    [token, "background"],
  ]),
]

describe("semantic colour tokens meet WCAG AA", () => {
  for (const [theme, tokens] of Object.entries(themes)) {
    describe(`${theme} theme`, () => {
      it.each(TEXT_PAIRS)("%s on %s has contrast of at least 4.5:1", (fg, bg) => {
        const surface = tokens[bg]
        expect(contrast(composite(tokens[fg], surface), composite(surface, tokens.background))).toBeGreaterThanOrEqual(4.5)
      })

      it.each(STATUSES)("%s text is readable on its own tinted background", (token) => {
        const background = composite(tokens[`${token}-bg`], tokens.card)
        expect(contrast(composite(tokens[token], tokens.card), background)).toBeGreaterThanOrEqual(4.5)
      })

      it.each(["destructive", ...STATUSES])("%s text is readable on a 10% tint of itself over card", (token) => {
        const tint = composite(tokens[token], tokens.card, 0.1)
        expect(contrast(composite(tokens[token], tokens.card), tint)).toBeGreaterThanOrEqual(4.5)
      })

      it("keeps the form control border distinguishable (3:1) from its surface", () => {
        expect(contrast(composite(tokens.input, tokens.card), composite(tokens.card, tokens.background))).toBeGreaterThanOrEqual(3)
        expect(contrast(composite(tokens.input, tokens.background), composite(tokens.background, tokens.background))).toBeGreaterThanOrEqual(3)
      })
    })
  }

  it("maps destructive-foreground so text-destructive-foreground generates a class", () => {
    expect(css).toContain("--color-destructive-foreground: var(--destructive-foreground);")
  })
})
