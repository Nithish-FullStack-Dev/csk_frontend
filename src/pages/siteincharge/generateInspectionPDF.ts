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
                inspection?.project?.projectId?.basicInfo?.projectName || "N/A"
              ],
              ["Unit", inspection.unit || "N/A"],
              ["Type", inspection.type || "N/A"],
              ["Status", inspection.status || "N/A"],
              [
                "Date",
                inspection.date
                  ? new Date(inspection.date).toLocaleDateString()
                  : "N/A"
              ]
            ]
          },
          layout: "lightHorizontalLines"
        },
        {
          text: "Attached Photos",
          style: "subheader",
          margin: [0, 20, 0, 10]
        },
        ...photoElements
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 10],
          color: "#1a202c"
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5],
          color: "#4a5568"
        },
        tableExample: {
          margin: [0, 10, 0, 15],
          fontSize: 12
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    };

    pdfMake
      .createPdf(docDefinition)
      .download(`Inspection_Report_${inspection.title || "Untitled"}.pdf`);
  });
};


export const handleExportReport = async (inspection) => {
  // ✅ Declare photoElements in outer scope so it's accessible in the catch block
  let photoElements = [];

  try {
    const [{ default: pdfMake }, { default: pdfFonts }] = await Promise.all([
      import("pdfmake/build/pdfmake"),
      import("pdfmake/build/vfs_fonts"),
    ]);

    // Assign VFS
    if (pdfFonts?.pdfMake?.vfs) {
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
    } else {
      pdfMake.vfs = pdfFonts; // fallback for older builds
    }

    pdfMake.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    };

    // Convert image URLs to base64
    const convertImageToBase64 = async (url) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    };

    if (inspection.photos && inspection.photos.length > 0) {
      const base64Images = await Promise.all(
        inspection.photos.map(convertImageToBase64)
      );

      photoElements = base64Images
        .filter(base64 => base64 !== null)
        .map((base64) => ({
          image: base64,
          width: 150,
          margin: [0, 0, 10, 10],
        }));
    }

    if (photoElements.length === 0) {
      photoElements = [{
        text: inspection.photos?.length ? "Images could not be loaded." : "No photos provided.",
        italics: true
      }];
    }

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
              ["Project", inspection?.project?.projectId?.basicInfo?.projectName || "N/A"],
              ["Unit", inspection.unit || "N/A"],
              ["Type", inspection.type || "N/A"],
              ["Status", inspection.status || "N/A"],
              ["Date", inspection.date ? new Date(inspection.date).toLocaleDateString() : "N/A"]
            ]
          },
          layout: "lightHorizontalLines"
        },
        { text: "Attached Photos", style: "subheader", margin: [0, 20, 0, 10] },
        ...photoElements
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 10],
          color: "#1a202c"
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5],
          color: "#4a5568"
        },
        tableExample: {
          margin: [0, 10, 0, 15],
          fontSize: 12
        }
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10
      }
    };

    pdfMake.createPdf(docDefinition).download(`Inspection_Report_${inspection.title || "Untitled"}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    // 👇 Now this will work because photoElements is defined above
    handleExportReportFallback(inspection, photoElements);
  }
};
