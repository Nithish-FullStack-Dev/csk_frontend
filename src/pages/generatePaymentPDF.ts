import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface PaymentData {
  paymentNumber: string;
  invoice: {
    invoiceNumber: string;
    project: {
      projectId: {
        basicInfo: {
          projectName: string;
        };
      };
    };
    unit: string;
    paymentMethod: string;
    total: number;
    paymentDate: string;
    issueDate: string;
    dueDate: string;
    notes?: string;
  };
  accountant?: {
    name: string;
  };
}

export const generatePaymentPdf = async (
  paymentData: PaymentData
): Promise<Uint8Array> => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Add a page
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  // Embed fonts - using Helvetica which supports basic Latin characters
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const blackColor = rgb(0, 0, 0);
  const grayColor = rgb(0.4, 0.4, 0.4);
  const greenColor = rgb(0.133, 0.545, 0.133);

  // Starting position
  let yPosition = height - 80;

  // Header
  page.drawText("Payment Receipt", {
    x: 50,
    y: yPosition,
    size: 24,
    font: helveticaBoldFont,
    color: blackColor,
  });

  // Receipt icon (using simple text instead of emoji)
  page.drawText("Receipt", {
    x: 50,
    y: yPosition - 30,
    size: 12,
    font: helveticaBoldFont,
    color: greenColor,
  });

  yPosition -= 60;

  // Payment ID
  page.drawText(`Payment ID: ${paymentData.paymentNumber}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: grayColor,
  });

  yPosition -= 40;

  // Draw a line
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: grayColor,
  });

  yPosition -= 30;

  // Payment details in two columns
  const leftColumnX = 50;
  const rightColumnX = 300;
  const rowHeight = 40;

  // Helper function to draw a field with safe text encoding
  const drawField = (label: string, value: any, x: number, y: number) => {
    const cleanLabel =
      typeof label === "string" ? label.replace(/[^\x00-\x7F]/g, "") : "";

    let cleanValue = "";
    if (typeof value === "string") {
      cleanValue = value.replace(/[^\x00-\x7F]/g, "");
    } else if (typeof value === "number") {
      cleanValue = value.toString();
    } else {
      cleanValue = "";
    }

    page.drawText(cleanLabel, {
      x,
      y,
      size: 10,
      font: helveticaBoldFont,
      color: blackColor,
    });

    page.drawText(cleanValue, {
      x,
      y: y - 15,
      size: 10,
      font: helveticaFont,
      color: blackColor,
    });
  };

  // Left column
  drawField(
    "Invoice Number",
    paymentData.invoice.invoiceNumber,
    leftColumnX,
    yPosition
  );
  yPosition -= rowHeight;

  drawField(
    "Paid By",
    paymentData.accountant?.name || "Accountant",
    leftColumnX,
    yPosition
  );
  yPosition -= rowHeight;

  drawField(
    "Amount",
    `Rs.${paymentData.invoice.total.toLocaleString()}`,
    leftColumnX,
    yPosition
  );

  // Reset position for right column
  yPosition = height - 240;

  // Right column
  drawField(
    "Project / Unit",
    `${paymentData.invoice.project.projectId.basicInfo.projectName} / ${paymentData.invoice.unit}`,
    rightColumnX,
    yPosition
  );
  yPosition -= rowHeight;

  drawField(
    "Payment Method",
    paymentData.invoice.paymentMethod,
    rightColumnX,
    yPosition
  );
  yPosition -= rowHeight;

  drawField(
    "Payment Date",
    new Date(paymentData.invoice.paymentDate).toLocaleDateString(),
    rightColumnX,
    yPosition
  );

  yPosition -= 60;

  // Draw another line
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: grayColor,
  });

  yPosition -= 30;

  // Additional information
  page.drawText("Additional Information", {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaBoldFont,
    color: blackColor,
  });

  yPosition -= 25;

  // Issue date and due date
  page.drawText(
    `Issued on: ${new Date(
      paymentData.invoice.issueDate
    ).toLocaleDateString()}`,
    {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: grayColor,
    }
  );

  yPosition -= 15;

  page.drawText(
    `Due Date: ${new Date(paymentData.invoice.dueDate).toLocaleDateString()}`,
    {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: grayColor,
    }
  );

  // Notes section (if available)
  if (paymentData.invoice.notes) {
    yPosition -= 40;

    page.drawText("Notes", {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: blackColor,
    });

    yPosition -= 20;

    // Clean notes and split into multiple lines if needed
    const cleanNotes = paymentData.invoice.notes.replace(/[^\x00-\x7F]/g, "");
    const maxWidth = width - 100;
    const wordsPerLine = Math.floor(maxWidth / 6); // Approximate characters per line

    if (cleanNotes.length > wordsPerLine) {
      const lines = cleanNotes.match(
        new RegExp(`.{1,${wordsPerLine}}`, "g")
      ) || [cleanNotes];
      lines.forEach((line, index) => {
        page.drawText(line, {
          x: 50,
          y: yPosition - index * 15,
          size: 10,
          font: helveticaFont,
          color: blackColor,
        });
      });
    } else {
      page.drawText(cleanNotes, {
        x: 50,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: blackColor,
      });
    }
  }

  // Footer
  yPosition = 80;
  page.drawText(
    `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    {
      x: 50,
      y: yPosition,
      size: 8,
      font: helveticaFont,
      color: grayColor,
    }
  );

  // Serialize the PDF document to bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

// Helper function to download the PDF
export const downloadPaymentPdf = async (
  paymentData: PaymentData,
  filename?: string
) => {
  try {
    const pdfBytes = await generatePaymentPdf(paymentData);

    // Create blob and download
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `payment-receipt-${paymentData.paymentNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
};
