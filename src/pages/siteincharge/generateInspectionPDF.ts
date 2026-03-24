// ✅ Define fallback first
const handleExportReportFallback = (inspection, photoElements) => {
  import("pdfmake/build/pdfmake").then(({ default: pdfMake }) => {
    const reportDate = new Date().toLocaleDateString();

    const docDefinition = {
      content: [
        { text: "Inspection Report", style: "header" },
        { text: `Report Date: ${reportDate}`, style: "subheader" },
        {
          style: "tableExample",
          table: {
            widths: ["30%", "70%"],
            body: [
              ["Title", inspection.title || "N/A"],
              ["Location", inspection.locations || "N/A"],
              [
                "Project",
                inspection?.project?.projectId?.basicInfo?.projectName || "N/A",
              ],
              ["Unit", inspection.unit || "N/A"],
              ["Type", inspection.type || "N/A"],
              ["Status", inspection.status || "N/A"],
              [
                "Date",
                inspection.date
                  ? new Date(inspection.date).toLocaleDateString()
                  : "N/A",
              ],
            ],
          },
          layout: "lightHorizontalLines",
        },
        {
          text: "Attached Photos",
          style: "subheader",
          margin: [0, 20, 0, 10],
        },
        ...photoElements,
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 10],
          color: "#1a202c",
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5],
          color: "#4a5568",
        },
        tableExample: {
          margin: [0, 10, 0, 15],
          fontSize: 12,
        },
      },
      defaultStyle: {
        fontSize: 10,
      },
    };

    pdfMake
      .createPdf(docDefinition)
      .download(`Inspection_Report_${inspection.title || "Untitled"}.pdf`);
  });
};

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const handleExportReport = (inspection) => {
  try {
    const data = [
      {
        Title: inspection?.title || "N/A",
        Location: inspection?.locations || "N/A",
        Project:
          inspection?.project?.projectId?.basicInfo?.projectName || "N/A",
        Unit: inspection?.unit || "N/A",
        Type: inspection?.type || "N/A",
        Status: inspection?.status || "N/A",
        Date: inspection?.date
          ? new Date(inspection.date).toLocaleDateString()
          : "N/A",
      },
    ];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Inspection Report");

    // Write file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Inspection_Report_${inspection?.title || "Report"}.xlsx`);
  } catch (err) {
    console.error("Excel export failed", err);
  }
};
