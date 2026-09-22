import { ExamBatchReportItem } from "../types"

export interface ExportDetailMatrixData {
  batchName: string
  batchCode: string
  columns: { id: string; name: string }[]
  rows: {
    employeeCode: string
    fullName: string
    cccd: string
    department: string
    completedItemIds: string[]
  }[]
}

export interface ExportSummaryData {
  batchName: string
  batchCode: string
  items: ExamBatchReportItem[]
  totalAmount: number
}

// Download helper with UTF-8 BOM
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = "text/csv;charset=utf-8;"
) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Format sanitized filename
export function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * 1. Export Excel Chi tiết (ngang)
 * Mỗi row = 1 nhân sự
 * Columns: Mã NV, Họ tên, CCCD, Phòng ban, các hạng mục khám...
 * Rule: X = thực tế COMPLETED, không X = chưa khám/skipped.
 */
export function generateDetailHorizontalCSV(data: ExportDetailMatrixData): string {
  const BOM = "\uFEFF"
  const headers = [
    "Mã NV",
    "Họ tên",
    "CCCD",
    "Phòng ban",
    ...data.columns.map((c) => `"${c.name.replace(/"/g, '""')}"`),
  ]

  const lines = [headers.join(",")]

  for (const row of data.rows) {
    const itemMarks = data.columns.map((col) =>
      row.completedItemIds.includes(col.id) ? "X" : ""
    )

    const rowData = [
      `"${row.employeeCode.replace(/"/g, '""')}"`,
      `"${row.fullName.replace(/"/g, '""')}"`,
      `"${row.cccd.replace(/"/g, '""')}"`,
      `"${row.department.replace(/"/g, '""')}"`,
      ...itemMarks,
    ]
    lines.push(rowData.join(","))
  }

  return BOM + lines.join("\r\n")
}

/**
 * 2. Export Excel Tổng hợp (dọc)
 * Dùng để tổng hợp thanh toán
 * Mỗi row = một hạng mục
 * Columns: Hạng mục, Số người khám, Đơn giá, Thành tiền
 * Cuối: Tổng tiền
 */
export function generateSummaryVerticalCSV(data: ExportSummaryData): string {
  const BOM = "\uFEFF"
  const headers = ["Hạng mục", "Số người khám", "Đơn giá", "Thành tiền"]
  const lines = [headers.join(",")]

  for (const item of data.items) {
    lines.push(
      [
        `"${item.name.replace(/"/g, '""')}"`,
        item.examinedCount,
        item.unitPrice,
        item.totalAmount,
      ].join(",")
    )
  }

  // Row Tổng tiền
  lines.push(`"Tổng tiền",,,${data.totalAmount}`)

  return BOM + lines.join("\r\n")
}

/**
 * Generate XML Spreadsheet 2003 (SpreadsheetML) format for full native Excel support
 * with bold headers, bold totals, and formatted numeric/currency cells.
 */
export function generateSummaryVerticalSpreadsheetML(data: ExportSummaryData): string {
  const rowsXml = data.items
    .map(
      (item) => `
    <Row>
      <Cell ss:StyleID="TextCell"><Data ss:Type="String">${escapeXml(item.name)}</Data></Cell>
      <Cell ss:StyleID="NumberCenter"><Data ss:Type="Number">${item.examinedCount}</Data></Cell>
      <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${item.unitPrice}</Data></Cell>
      <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${item.totalAmount}</Data></Cell>
    </Row>`
    )
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Inter" x:Family="Swiss" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Inter" x:Family="Swiss" ss:Size="11" ss:Bold="1" ss:Color="#1E293B"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
  <Style ss:ID="HeaderLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Inter" x:Family="Swiss" ss:Size="11" ss:Bold="1" ss:Color="#1E293B"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
  <Style ss:ID="TextCell">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="NumberCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="CurrencyCell">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0&quot; đ&quot;"/>
  </Style>
  <Style ss:ID="TotalLabel">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Inter" x:Family="Swiss" ss:Size="12" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
  <Style ss:ID="TotalBlank">
   <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
  <Style ss:ID="TotalAmount">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Inter" x:Family="Swiss" ss:Size="12" ss:Bold="1" ss:Color="#0D6EFD"/>
   <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0&quot; đ&quot;"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="Báo cáo tổng hợp">
  <Table ss:ExpandedColumnCount="4">
   <Column ss:Width="200"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Column ss:Width="140"/>
   <Row>
    <Cell ss:StyleID="HeaderLeft"><Data ss:Type="String">Hạng mục</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Số người khám</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Đơn giá</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Thành tiền</Data></Cell>
   </Row>${rowsXml}
   <Row>
    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">Tổng tiền</Data></Cell>
    <Cell ss:StyleID="TotalBlank"/>
    <Cell ss:StyleID="TotalBlank"/>
    <Cell ss:StyleID="TotalAmount"><Data ss:Type="Number">${data.totalAmount}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
