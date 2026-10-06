import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { formatFinding, isSourceFile, scanFiles } from "./terminology-guard.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const sourceRoot = path.join(root, "src")

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
    } else if (isSourceFile(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

const files = []
for (const filePath of await collect(sourceRoot)) {
  files.push({ relativePath: relative(filePath), content: await readFile(filePath, "utf8") })
}

const findings = scanFiles(files)

if (findings.length > 0) {
  console.error("Frontend terminology guard failed with " + findings.length + " finding(s):")
  for (const finding of findings) console.error(formatFinding(finding))
  process.exitCode = 1
} else {
  console.log("Frontend terminology guard passed (" + files.length + " source files scanned).")
}
