import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

interface ExportOptions {
  title: string;
  headers: string[];
  rows: string[][];
  fileName: string;
}

export function exportToPDF({ title, headers, rows, fileName }: ExportOptions) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Colors
  const darkNavy = [13, 27, 42]; // #0d1b2a
  const slateGray = [100, 116, 139]; // #64748b
  const emeraldGreen = [16, 185, 129]; // #10b981

  // Brand Header
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, 210, 32, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("NUMAN & ASSOCIATES", 15, 13);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Premium consultancy & Advisory Services Firm", 15, 19);

  // Date
  doc.setFontSize(8);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 25);

  // Divider Line
  doc.setDrawColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.setLineWidth(1);
  doc.line(0, 32, 210, 32);

  // Report Section Title
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title.toUpperCase(), 15, 43);

  // Table
  (doc as any).autoTable({
    startY: 48,
    head: [headers],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: darkNavy,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
    },
    bodyStyles: {
      textColor: [51, 65, 85],
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 15, right: 15 },
    styles: {
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
  });

  // Footer page numbering
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text(
      `Page ${i} of ${pageCount} | Numan & Associates Consultancy | Confidential`,
      15,
      287
    );
  }

  doc.save(`${fileName}.pdf`);
}

export function exportToExcel({ title, headers, rows, fileName }: ExportOptions) {
  // Prep Data
  const data = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, title.slice(0, 31));

  // Save Workbook
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function triggerPrint() {
  window.print();
}
