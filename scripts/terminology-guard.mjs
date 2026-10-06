/**
 * Terminology and boundary rules for frontend source.
 *
 * Rules are matched against the matched text and its context, not against whole
 * modules. A rule only stays quiet for an explicit, documented reason: either an
 * `allow` predicate (accepted domain vocabulary) or an entry in
 * TERMINOLOGY_EXCEPTIONS (a specific file that must contain the term).
 */

const identifier = "[A-Za-z0-9_]*"

export const DEPRECATED_RULES = [
  { label: "FRONT_DESK", pattern: /\bFRONT_DESK\b/g },
  { label: "FrontDesk", pattern: /\bFrontDesk\b/g },
  { label: "front desk", pattern: /\bfront[\s_-]+desk\b/gi },
  { label: "DoctorWorklist", pattern: /\bDoctorWorklist\b/g },
  { label: "Doctor Worklist", pattern: /\bDoctor\s+Worklist\b/gi },
  {
    // HealthCheckPrintModel is accepted domain vocabulary (PROJECT_RULES §13).
    label: "HealthCheck",
    pattern: new RegExp(`HealthCheck${identifier}`, "g"),
    allow: (match) => match === "HealthCheckPrintModel",
  },
  {
    label: "Health Check",
    pattern: /\bHealth[\s_-]+Check\b/gi,
    // Same accepted routes as health-check below; the hyphenated route form also matches here.
    allow: (match, context) => /^health-check$/i.test(match) && context.before.endsWith("/"),
  },
  { label: "health_check", pattern: /\bhealth_check[A-Za-z0-9_]*/g },
  {
    // /health-check and /health-check/print/preview are accepted routes (PROJECT_RULES §11).
    label: "health-check",
    pattern: /health-check[A-Za-z0-9-]*/gi,
    allow: (_match, context) => context.before.endsWith("/"),
  },
  { label: "CLS", pattern: /\bCLS\b|\bCls\b|\bcls\b/g },
  { label: "DiagnosticResult", pattern: /\bDiagnosticResult[A-Za-z0-9_]*/g },
  { label: "ImagingResult", pattern: /\bImagingResult[A-Za-z0-9_]*/g },
  { label: "XrayResult", pattern: /\bXrayResult[A-Za-z0-9_]*/g },
  {
    // Organization is the domain term. Real legal names ("Công ty …") and the
    // upper-case organizationType value COMPANY are not matched by this rule.
    label: "Company",
    pattern: new RegExp(`${identifier}(?:[Cc]ompany|[Cc]ompanies)${identifier}`, "g"),
  },
  { label: "Enterprise", pattern: new RegExp(`${identifier}[Ee]nterprise${identifier}`, "g") },
  {
    // The wire value for an on-site examination is ORGANIZATION_SITE; COMPANY is
    // only valid as an organizationType and is not matched elsewhere.
    label: "site type COMPANY",
    pattern: /SiteType[^\n]*\bCOMPANY\b|["']CLINIC["'][\s,|\]]*["']COMPANY["']/g,
  },
  {
    // A roster member is a Participant. EMPLOYEE stays valid as a subject type.
    label: "employee-as-participant",
    pattern:
      /\b[a-z]*[Ee]mployee(?:Code|Id)\b|\bLegacyEmployee[A-Za-z0-9_]*|\b[A-Za-z]*EmployeeImport[A-Za-z0-9_]*|\bemployee-imports\b|\bemployees\/import/g,
  },
]

export const TERMINOLOGY_EXCEPTIONS = [
  {
    path: "src/config/__tests__/medical-terminology.test.ts",
    labels: ["Enterprise"],
    reason: "Asserts that Enterprise is not a canonical domain term.",
  },
  {
    path: "src/modules/health-examinations/__tests__/health-examination-batch-schema.test.ts",
    labels: ["site type COMPANY"],
    reason: "Negative test: the legacy COMPANY site type must be rejected.",
  },
  {
    path: "src/config/__tests__/terminology-guard.test.ts",
    labels: "*",
    reason: "Negative fixtures that prove the guard catches deprecated terms.",
  },
]

const sourceExtensions = new Set([".js", ".mjs", ".ts", ".tsx"])

export function isSourceFile(relativePath) {
  const dot = relativePath.lastIndexOf(".")
  return dot !== -1 && sourceExtensions.has(relativePath.slice(dot).toLowerCase())
}

export function isTestPath(relativePath) {
  return /(^|\/)__tests__\//.test(relativePath) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(relativePath)
}

function isExcepted(relativePath, label) {
  return TERMINOLOGY_EXCEPTIONS.some(
    (entry) =>
      entry.path === relativePath && (entry.labels === "*" || entry.labels.includes(label))
  )
}

function locate(content, offset) {
  const lineStart = content.lastIndexOf("\n", offset - 1) + 1
  const lineEnd = content.indexOf("\n", offset)
  return {
    line: content.slice(lineStart, lineEnd === -1 ? content.length : lineEnd).trim(),
    lineNumber: content.slice(0, offset).split("\n").length,
    columnNumber: offset - lineStart + 1,
  }
}

const testImportPattern =
  /(?:\bfrom\s+|\bimport\s*\(\s*|\brequire\s*\(\s*)["']([^"']*(?:__tests__|\/fixtures(?=\/|["'])|\.(?:test|spec)(?=\.|["']))[^"']*)["']/g

/** Returns findings for one source file. Paths are repository-relative with "/". */
export function scanFile(relativePath, rawContent) {
  const content = rawContent.replace(/\r\n/g, "\n")
  const findings = []
  const seen = new Set()
  const record = (label, offset) => {
    const where = locate(content, offset)
    const key = `${where.lineNumber}:${where.columnNumber}`
    if (seen.has(key)) return
    seen.add(key)
    findings.push({ relativePath, label, ...where })
  }

  for (const rule of DEPRECATED_RULES) {
    if (isExcepted(relativePath, rule.label)) continue
    for (const match of content.matchAll(new RegExp(rule.pattern.source, rule.pattern.flags))) {
      const offset = match.index ?? 0
      const context = { before: content.slice(Math.max(0, offset - 1), offset) }
      if (rule.allow?.(match[0], context)) continue
      record(rule.label, offset)
    }
  }

  if (!isTestPath(relativePath)) {
    for (const match of content.matchAll(testImportPattern)) {
      record("production imports test code", match.index ?? 0)
    }
  }

  return findings
}

export function scanFiles(files) {
  return files.flatMap((file) => scanFile(file.relativePath, file.content))
}

export function formatFinding(finding) {
  return `${finding.relativePath}:${finding.lineNumber}:${finding.columnNumber} [${finding.label}] ${finding.line}`
}
