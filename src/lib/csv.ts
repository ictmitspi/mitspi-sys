// Excel runs a cell that starts with one of these as a formula (OWASP: CSV Injection).
const FORMULA_START = /^[=+\-@\t\r]/

function escapeCell(value: string) {
  const safe = FORMULA_START.test(value) ? `'${value}` : value
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export function toCsv(rows: string[][]) {
  return rows.map((row) => row.map(escapeCell).join(",")).join("\r\n")
}

// The BOM makes Excel read the file as UTF-8, so names keep their letters.
export function downloadCsv(fileName: string, rows: string[][]) {
  const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
