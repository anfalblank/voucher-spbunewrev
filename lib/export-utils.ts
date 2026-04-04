import { utils, writeFile } from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { toast } from "sonner"

// Generic Excel Exporter
export function exportToExcel(
  data: any[],
  columns: { header: string; key: string }[],
  filename: string
) {
  try {
    // Map data to sheet format using the specified columns
    const sheetData = data.map((item) => {
      const row: Record<string, any> = {}
      columns.forEach((col) => {
        // Handle nested keys like "outlet.name" or "creator.name"
        const keys = col.key.split(".")
        let value = item
        for (const k of keys) {
          if (value && typeof value === "object") {
            value = value[k]
          } else {
            value = null
          }
        }
        row[col.header] = value
      })
      return row
    })

    const worksheet = utils.json_to_sheet(sheetData)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, "Laporan")

    // Generate buffer and trigger download
    writeFile(workbook, `${filename}.xlsx`)
    toast.success("File Excel berhasil diunduh!")
    return true
  } catch (err) {
    console.error("Gagal export ke Excel:", err)
    toast.error("Gagal mengekspor data ke format Excel.")
    return false
  }
}

// Generic PDF Exporter
export function exportToPDF(
  title: string,
  data: any[],
  columns: { header: string; key: string }[],
  filename: string
) {
  try {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(16)
    doc.text(title, 14, 22)

    doc.setFontSize(10)
    // Timestamp
    doc.text(
      `Dicetak pada: ${new Date().toLocaleString("id-ID")}`,
      14,
      30
    )

    // Map data for autotable
    const head = [columns.map((col) => col.header)]
    const body = data.map((item) => {
      return columns.map((col) => {
        const keys = col.key.split(".")
        let value = item
        for (const k of keys) {
          if (value && typeof value === "object") {
            value = value[k]
          } else {
            value = ""
          }
        }
        // Format object or boolean to string
        if (typeof value === "boolean") return value ? "Ya" : "Tidak"
        if (value === null || value === undefined) return "-"
        return String(value)
      })
    })

    autoTable(doc, {
      startY: 36,
      head: head,
      body: body,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    })

    doc.save(`${filename}.pdf`)
    toast.success("Laporan PDF berhasil diunduh!")
    return true
  } catch (err) {
    console.error("Gagal export ke PDF:", err)
    toast.error("Gagal mencetak dokumen PDF.")
    return false
  }
}

export interface SheetConfig {
  sheetName: string
  data: any[]
  columns: { header: string; key: string }[]
}

export function exportMultiSheetExcel(sheets: SheetConfig[], filename: string) {
  try {
    const workbook = utils.book_new()

    sheets.forEach((sheet) => {
      const sheetData = sheet.data.map((item) => {
        const row: Record<string, any> = {}
        sheet.columns.forEach((col) => {
          const keys = col.key.split(".")
          let value = item
          for (const k of keys) {
            if (value && typeof value === "object") {
              value = value[k]
            } else {
              value = null
            }
          }
          row[col.header] = value
        })
        return row
      })
      const worksheet = utils.json_to_sheet(sheetData)
      utils.book_append_sheet(workbook, worksheet, sheet.sheetName)
    })

    writeFile(workbook, `${filename}.xlsx`)
    toast.success("File Excel detail berhasil diunduh!")
    return true
  } catch (err) {
    console.error("Gagal export Multi-Sheet Excel:", err)
    toast.error("Gagal mengekspor data ke format Excel.")
    return false
  }
}

export interface TableConfig {
  title: string
  data: any[]
  columns: { header: string; key: string }[]
}

export function exportMultiTablePDF(
  mainTitle: string,
  tables: TableConfig[],
  filename: string
) {
  try {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(16)
    doc.text(mainTitle, 14, 22)

    doc.setFontSize(10)
    // Timestamp
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 30)

    let currentY = 36

    tables.forEach((table, index) => {
      // Add table title if it's not the first text
      if (index > 0) {
        currentY += 10
      }
      
      // Check if we need a new page for the title
      if (currentY > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(12)
      doc.text(table.title, 14, currentY)
      currentY += 6

      const head = [table.columns.map((col) => col.header)]
      const body = table.data.map((item) => {
        return table.columns.map((col) => {
          const keys = col.key.split(".")
          let value = item
          for (const k of keys) {
            if (value && typeof value === "object") {
              value = value[k]
            } else {
              value = ""
            }
          }
          if (typeof value === "boolean") return value ? "Ya" : "Tidak"
          if (value === null || value === undefined) return "-"
          return String(value)
        })
      })

      autoTable(doc, {
        startY: currentY,
        head: head,
        body: body,
        theme: "striped",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        didDrawPage: function (data) {
          // Keep track of the cursor Y position after the table is drawn
          if ((data as any).cursor) {
            currentY = (data as any).cursor.y
          }
        },
      })
      
      // Get the final Y position after the table
      currentY = (doc as any).lastAutoTable.finalY + 10
    })

    doc.save(`${filename}.pdf`)
    toast.success("Laporan PDF detail berhasil diunduh!")
    return true
  } catch (err) {
    console.error("Gagal export Multi-Table PDF:", err)
    toast.error("Gagal mencetak dokumen PDF.")
    return false
  }
}


