import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel } from "../utils/exportToExcel";
import { ColumnConfig, ReportFilters } from "../types";
import { format } from "date-fns";

interface ExportButtonProps {
  reportTitle: string;
  data: any[];
  columns: ColumnConfig[];
  filters: ReportFilters;
  fileName?: string;
}

export function ExportButton({
  reportTitle,
  data,
  columns,
  filters,
  fileName,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    setIsExporting(true);
    try {
      const dateRange = `${format(filters.dateFrom, "MMM dd, yyyy")} - ${format(filters.dateTo, "MMM dd, yyyy")}`;
      const filterText = [
        `Group by: ${filters.groupBy}`,
        filters.search ? `Search: ${filters.search}` : null,
      ].filter(Boolean).join(", ");

      const exportFileName = fileName || `${reportTitle.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      exportToExcel({
        rows: data,
        columns,
        sheetName: reportTitle,
        fileName: exportFileName,
        reportTitle,
        dateRange,
        filters: filterText,
      });

      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting || data.length === 0}>
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </>
      )}
    </Button>
  );
}
