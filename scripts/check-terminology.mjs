import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const sourceRoot = path.join(root, "src")
const sourceExtensions = new Set([".js", ".mjs", ".ts", ".tsx"])
const excludedPrefixes = [
  "src/modules/health-examinations/",
]
const deprecatedPatterns = [
  ["FRONT_DESK", /\bFRONT_DESK\b/g],
  ["FrontDesk", /\bFrontDesk\b/g],
  ["front desk", /\bfront[\s_-]+desk\b/gi],
  ["DoctorWorklist", /\bDoctorWorklist\b/g],
  ["Doctor Worklist", /\bDoctor\s+Worklist\b/gi],
  ["HealthCheck", /HealthCheck[A-Za-z0-9_]*/g],
  ["Health Check", /\bHealth[\s_-]+Check\b/gi],
  ["health_check", /\bhealth_check[A-Za-z0-9_]*/g],
  ["health-check", /\bhealth-check[A-Za-z0-9-]*/gi],
  ["CLS", /\bCLS\b|\bCls\b|\bcls\b/g],
  ["DiagnosticResult", /\bDiagnosticResult[A-Za-z0-9_]*/g],
  ["ImagingResult", /\bImagingResult[A-Za-z0-9_]*/g],
  ["XrayResult", /\bXrayResult[A-Za-z0-9_]*/g],
]

function relative(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/")
}

async function collect(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collect(fullPath)))
    } else if (sourceExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath)
    }
  }
  return files
}

const findings = []
for (const filePath of await collect(sourceRoot)) {
  const relativePath = relative(filePath)
  if (excludedPrefixes.some((prefix) => relativePath.startsWith(prefix))) continue
  const content = await readFile(filePath, "utf8")
  for (const [label, pattern] of deprecatedPatterns) {
    for (const match of content.matchAll(pattern)) {
      const offset = match.index ?? 0
      const lineStart = content.lastIndexOf("\n", offset - 1) + 1
      const lineEnd = content.indexOf("\n", offset)
      findings.push({
        relativePath,
        label,
        line: content.slice(lineStart, lineEnd === -1 ? content.length : lineEnd).trim(),
        lineNumber: content.slice(0, offset).split("\n").length,
        columnNumber: offset - lineStart + 1,
      })
    }
    pattern.lastIndex = 0
  }
}

if (findings.length > 0) {
  console.error("Frontend terminology guard failed with " + findings.length + " finding(s):")
  for (const finding of findings) {
    console.error(
      finding.relativePath +
        ":" +
        finding.lineNumber +
        ":" +
        finding.columnNumber +
        " [" +
        finding.label +
        "] " +
        finding.line,
    )
  }
  process.exitCode = 1
} else {
  console.log("Frontend terminology guard passed.")
}
