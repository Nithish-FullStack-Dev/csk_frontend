import * as XLSX from "xlsx";
import { ColumnConfig } from "../types";
import { formatValue } from "./formatters";

interface ExportOptions {
  rows: any[];
  columns: ColumnConfig[];
  sheetName: string;
  fileName: string;
  reportTitle: string;
  dateRange: string;
  filters?: string;
}

export function exportToExcel({
  rows,
  columns,
  sheetName,
  fileName,
  reportTitle,
  dateRange,
  filters,
}: ExportOptions) {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Prepare data with headers
  const data: any[] = [];

  // Add title row
  data.push([reportTitle]);
  data.push([`Date Range: ${dateRange}`]);
  if (filters) {
    data.push([`Filters: ${filters}`]);
  }
  data.push([]); // Empty row

  // Add column headers
  const headers = columns.map((col) => col.header);
  data.push(headers);

  // Add data rows
  rows.forEach((row) => {
    const rowData = columns.map((col) => {
      const value = row[col.key];
      return formatValue(value, col.format);
    });
    data.push(rowData);
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const colWidths = columns.map((col) => ({
    wch: Math.max(col.header.length, 15),
  }));
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate Excel file and download
  XLSX.writeFile(wb, fileName);
}
