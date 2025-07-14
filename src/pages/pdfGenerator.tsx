// import jsPDF from 'jspdf';

// interface InvoiceItem {
//   _id: string;
//   description: string;
//   quantity: number;
//   unit: string;
//   rate: number;
//   amount: number;
// }

// interface Invoice {
//   id: string;
//   invoiceNumber: string;
//   status: string;
//   issueDate: string;
//   project: {
//     projectId: {
//       basicInfo: {
//         projectName: string;
//       };
//     };
//   };
//   paymentDate?: string;
//   items: InvoiceItem[];
//   subtotal: number;
//   sgst: number;
//   cgst: number;
//   total: number;
//   notes?: string;
// }

// // SOLUTION 1: Isolated PDF generation function (most likely to fix the issue)
// export const generateInvoicePDF = (invoice: Invoice) => {
//   // Wrap everything in requestAnimationFrame to avoid blocking the main thread
//   return new Promise<void>((resolve, reject) => {
//     requestAnimationFrame(() => {
//       try {
//         const doc = new jsPDF();
//         const pageWidth = doc.internal.pageSize.width;
//         let yPosition = 20;

//         // Helper function to add text with proper positioning
//         const addText = (text: string, x: number, y: number, options?: any) => {
//           doc.text(text, x, y, options);
//         };

//         // Helper function to set font
//         const setFont = (style: string, size: number) => {
//           doc.setFont('helvetica', style);
//           doc.setFontSize(size);
//         };

//         // Title
//         setFont('bold', 20);
//         addText(`Invoice`, 20, yPosition);
//         yPosition += 15;

//         // Invoice header section
//         setFont('bold', 16);
//         addText('INVOICE', 20, yPosition);
//         yPosition += 8;

//         setFont('normal', 10);
//         doc.setTextColor(128, 128, 128);
//         addText(invoice.invoiceNumber, 20, yPosition);
//         doc.setTextColor(0, 0, 0);

//         // Status badge
//         setFont('normal', 10);
//         let statusColor = [128, 128, 128];
//         if (invoice.status === 'Paid') statusColor = [34, 197, 94];
//         else if (invoice.status === 'Pending') statusColor = [59, 130, 246];
//         else if (invoice.status === 'Overdue') statusColor = [239, 68, 68];

//         doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
//         addText(invoice.status, pageWidth - 40, yPosition);
//         doc.setTextColor(0, 0, 0);

//         yPosition += 20;

//         // Invoice details section
//         setFont('normal', 9);
//         doc.setTextColor(128, 128, 128);
//         addText('Issue Date:', 20, yPosition);
//         doc.setTextColor(0, 0, 0);
//         setFont('normal', 9);
//         const issueDate = new Date(invoice.issueDate).toLocaleDateString('en-GB', {
//           day: '2-digit',
//           month: '2-digit',
//           year: '2-digit',
//         });
//         addText(issueDate, 80, yPosition);
//         yPosition += 10;

//         setFont('normal', 9);
//         doc.setTextColor(128, 128, 128);
//         addText('Due Date:', 20, yPosition);
//         doc.setTextColor(0, 0, 0);
//         setFont('normal', 9);
//         const dueDate = new Date(invoice.issueDate).toLocaleDateString('en-GB', {
//           day: '2-digit',
//           month: '2-digit',
//           year: '2-digit',
//         });
//         addText(dueDate, 80, yPosition);
//         yPosition += 10;

//         setFont('normal', 9);
//         doc.setTextColor(128, 128, 128);
//         addText('Project:', 20, yPosition);
//         doc.setTextColor(0, 0, 0);
//         setFont('normal', 9);
//         addText(invoice.project.projectId.basicInfo.projectName || '-', 80, yPosition);
//         yPosition += 10;

//         if (invoice.paymentDate) {
//           setFont('normal', 9);
//           doc.setTextColor(128, 128, 128);
//           addText('Payment Date:', 20, yPosition);
//           doc.setTextColor(0, 0, 0);
//           setFont('normal', 9);
//           addText(invoice.paymentDate, 80, yPosition);
//           yPosition += 10;
//         }

//         yPosition += 10;

//         // Table header
//         const tableStartY = yPosition;
//         const tableWidth = pageWidth - 40;
//         const colWidths = [tableWidth * 0.5, tableWidth * 0.15, tableWidth * 0.175, tableWidth * 0.175];
//         const colPositions = [20, 20 + colWidths[0], 20 + colWidths[0] + colWidths[1], 20 + colWidths[0] + colWidths[1] + colWidths[2]];

//         // Draw table border
//         doc.setDrawColor(200, 200, 200);
//         doc.rect(20, tableStartY, tableWidth, 10);

//         setFont('bold', 9);
//         addText('Description', colPositions[0] + 2, tableStartY + 7);
//         addText('Qty', colPositions[1] + 2, tableStartY + 7);
//         addText('Rate (Rs.)', colPositions[2] + 2, tableStartY + 7);
//         addText('Amount (Rs.)', colPositions[3] + 2, tableStartY + 7);

//         yPosition = tableStartY + 10;

//         // Table rows
//         setFont('normal', 9);
//         invoice.items.forEach((item) => {
//           doc.rect(20, yPosition, tableWidth, 10);

//           addText(item.description, colPositions[0] + 2, yPosition + 7);
//           addText(`${item.quantity} ${item.unit}`, colPositions[1] + 2, yPosition + 7);
//           addText(`Rs. ${item.rate.toLocaleString()}`, colPositions[2] + 2, yPosition + 7);
//           addText(`Rs. ${item.amount.toLocaleString()}`, colPositions[3] + 2, yPosition + 7);

//           yPosition += 10;
//         });

//         yPosition += 15;

//         // Totals section
//         const totalsX = pageWidth - 100;

//         setFont('normal', 9);
//         doc.setTextColor(128, 128, 128);
//         addText('Subtotal:', totalsX - 50, yPosition);
//         doc.setTextColor(0, 0, 0);
//         addText(`Rs. ${invoice.subtotal.toLocaleString()}`, totalsX, yPosition);
//         yPosition += 10;

//         doc.setTextColor(128, 128, 128);
//         addText(`SGST (${invoice.sgst}%):`, totalsX - 50, yPosition);
//         doc.setTextColor(0, 0, 0);
//         const sgstAmount = (invoice.subtotal * (invoice.sgst / 100));
//         addText(`Rs. ${sgstAmount.toLocaleString()}`, totalsX, yPosition);
//         yPosition += 10;

//         doc.setTextColor(128, 128, 128);
//         addText(`CGST (${invoice.cgst}%):`, totalsX - 50, yPosition);
//         doc.setTextColor(0, 0, 0);
//         const cgstAmount = (invoice.subtotal * (invoice.cgst / 100));
//         addText(`Rs. ${cgstAmount.toLocaleString()}`, totalsX, yPosition);
//         yPosition += 15;

//         // Draw separator line
//         doc.setDrawColor(200, 200, 200);
//         doc.line(totalsX - 50, yPosition - 5, totalsX + 30, yPosition - 5);

//         // Total amount
//         setFont('bold', 10);
//         addText('Total Amount:', totalsX - 50, yPosition);
//         addText(`Rs. ${invoice.total.toLocaleString()}`, totalsX, yPosition);
//         yPosition += 15;

//         // Notes section
//         if (invoice.notes) {
//           setFont('bold', 10);
//           addText('Notes:', 20, yPosition);
//           yPosition += 8;

//           setFont('normal', 9);
//           doc.setTextColor(128, 128, 128);
//           addText(invoice.notes, 20, yPosition);
//           doc.setTextColor(0, 0, 0);
//         }

//         // CRITICAL FIX: Use jsPDF's built-in save method
//         const fileName = `Invoice-${invoice.invoiceNumber}.pdf`;
//         doc.save(fileName);

//         resolve();
//       } catch (error) {
//         reject(error);
//       }
//     });
//   });
// };

// // SOLUTION 2: Alternative method using blob with proper cleanup
// export const generateInvoicePDFBlob = (invoice: Invoice) => {
//   return new Promise<void>((resolve, reject) => {
//     try {
//       // Same PDF generation code as above...
//       const doc = new jsPDF();
//       // ... (abbreviated for space, use the same content as above)

//       // Create blob and download
//       const fileName = `Invoice-${invoice.invoiceNumber}.pdf`;
//       const pdfOutput = doc.output('bloburl');

//       // Create a temporary anchor element
//       const anchor = document.createElement('a');
//       anchor.href = pdfOutput;
//       anchor.download = fileName;
//       anchor.style.display = 'none';

//       // Trigger download
//       document.body.appendChild(anchor);
//       anchor.click();

//       // Clean up immediately
//       document.body.removeChild(anchor);

//       // Clean up blob URL after a delay
//       setTimeout(() => {
//         URL.revokeObjectURL(pdfOutput);
//       }, 1000);

//       resolve();
//     } catch (error) {
//       reject(error);
//     }
//   });
// };

// import { jsPDF } from "jspdf";

// interface InvoiceItem {
//   _id: string;
//   description: string;
//   quantity: number;
//   unit: string;
//   rate: number;
//   amount: number;
// }

// interface Invoice {
//   id: string;
//   invoiceNumber: string;
//   status: string;
//   issueDate: string;
//   project: {
//     projectId: {
//       basicInfo: {
//         projectName: string;
//       };
//     };
//   };
//   paymentDate?: string;
//   items: InvoiceItem[];
//   subtotal: number;
//   sgst: number;
//   cgst: number;
//   total: number;
//   notes?: string;
// }

// export const generateInvoicePDFWithExtras = (
//   invoice: Invoice,
//   logoBase64: string, // PNG or JPEG base64 string
//   qrCodeBase64: string // Payment QR code base64 string
// ) => {
//   return new Promise<void>((resolve, reject) => {
//     requestAnimationFrame(() => {
//       try {
//         const doc = new jsPDF();
//         const pageWidth = doc.internal.pageSize.width;
//         let y = 20;

//         const setFont = (style: string, size: number) => {
//           doc.setFont("helvetica", style);
//           doc.setFontSize(size);
//         };

//         const addText = (text: string, x: number, y: number, options?: any) => {
//           doc.text(text, x, y, options);
//         };

//         // 🔷 Add Company Logo
//         if (logoBase64) {
//           doc.addImage(logoBase64, "PNG", 20, 10, 30, 20); // (image, type, x, y, width, height)
//         }

//         // Title
//         setFont("bold", 18);
//         addText("INVOICE", pageWidth - 40, 20, { align: "right" });

//         y = 35;

//         // Company Name & Subtitle
//         setFont("bold", 14);
//         addText("CSK Realtors", 20, y);
//         y += 6;
//         setFont("italic", 10);
//         addText("Subtitle (if any)", 20, y);
//         y += 10;

//         // Invoice Header
//         setFont("normal", 10);
//         addText(`INVOICE #${invoice.invoiceNumber}`, pageWidth - 40, y, { align: "right" });
//         y += 5;
//         addText(`DATE: ${new Date(invoice.issueDate).toLocaleDateString("en-GB")}`, pageWidth - 40, y, { align: "right" });
//         y += 10;

//         // Bill To
//         setFont("bold", 10);
//         addText("BILL TO:", 20, y);
//         y += 6;
//         setFont("normal", 10);
//         addText(`Project: ${invoice.project.projectId.basicInfo.projectName}`, 20, y);
//         y += 5;
//         addText(`Unit: ${invoice.items[0]?.description?.split("(")[0]?.trim() || "Villa-1"}`, 20, y);
//         y += 5;
//         addText("Type: Villa", 20, y);
//         y += 10;

//         // Comments
//         setFont("bold", 10);
//         addText("COMMENTS OR SPECIAL INSTRUCTIONS:", 20, y);
//         y += 5;
//         setFont("normal", 10);
//         addText(invoice.notes || "Shipment contains fragile goods", 20, y);
//         y += 10;

//         // Table Headers
//         const tableTop = y;
//         const colXs = [20, 50, 130, 160];

//         setFont("bold", 10);
//         doc.rect(20, tableTop, 170, 8);
//         ["QUANTITY", "DESCRIPTION", "UNIT PRICE", "TOTAL"].forEach((title, i) => {
//           addText(title, colXs[i] + 1, tableTop + 6);
//         });

//         y = tableTop + 8;

//         // Table Rows
//         setFont("normal", 10);
//         invoice.items.forEach((item) => {
//           doc.rect(20, y, 170, 8);
//           addText(`${item.quantity}`, colXs[0] + 1, y + 6);
//           addText(item.description, colXs[1] + 1, y + 6);
//           addText(`${item.rate.toFixed(2)}`, colXs[2] + 1, y + 6);
//           addText(`${item.amount.toFixed(2)}`, colXs[3] + 1, y + 6);
//           y += 8;
//         });

//         y += 10;

//         // Totals
//         const rightX = 160;
//         setFont("normal", 10);
//         addText("SUBTOTAL", rightX - 30, y);
//         addText(`${invoice.subtotal.toFixed(2)}`, rightX, y, { align: "right" });
//         y += 6;

//         const cgstAmount = invoice.subtotal * (invoice.cgst / 100);
//         addText("CGST", rightX - 30, y);
//         addText(`${cgstAmount.toFixed(2)}`, rightX, y, { align: "right" });
//         y += 6;

//         const sgstAmount = invoice.subtotal * (invoice.sgst / 100);
//         addText("SGST", rightX - 30, y);
//         addText(`${sgstAmount.toFixed(2)}`, rightX, y, { align: "right" });
//         y += 6;

//         setFont("bold", 11);
//         addText("TOTAL DUE", rightX - 30, y);
//         addText(`${invoice.total.toFixed(2)}`, rightX, y, { align: "right" });
//         y += 15;

//         // 📱 QR Code (bottom right corner)
//         if (qrCodeBase64) {
//           doc.addImage(qrCodeBase64, "PNG", pageWidth - 60, y, 40, 40);
//         }

//         // ✍️ Custom Footer: Bank details and Signature
//         y += 45;
//         setFont("normal", 9);
//         addText("Make all checks payable to CSK Realtors.", 20, y);
//         y += 5;
//         addText("Bank: ICICI Bank, A/C: 123456789, IFSC: ICIC0001234", 20, y);
//         y += 5;
//         addText("For queries, contact: contact@cskrealtors.com | +91-9876543210", 20, y);
//         y += 10;

//         // Signature
//         setFont("italic", 10);
//         addText("Authorized Signatory", pageWidth - 60, y);
//         doc.line(pageWidth - 80, y - 2, pageWidth - 30, y - 2);

//         y += 10;
//         setFont("bold", 10);
//         addText("THANK YOU FOR YOUR BUSINESS!", 20, y);

//         // Save PDF
//         doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
//         resolve();
//       } catch (error) {
//         reject(error);
//       }
//     });
//   });
// };

import { jsPDF } from "jspdf";

interface InvoiceItem {
  quantity: number;
  description: string;
  rate: number;
  amount: number;
}

interface Project {
  projectId: {
    basicInfo: {
      projectName: string;
    };
  };
}

interface Invoice {
  invoiceNumber: string;
  issueDate: string;
  project: Project;
  items: InvoiceItem[];
  notes?: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  dueDate?: string;
  billTo?: {
    name?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
  };
}

interface CompanyInfo {
  name: string;
  tagline?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  gst?: string;
  pan?: string;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch?: string;
  accountHolderName?: string;
}

interface PDFOptions {
  companyInfo?: CompanyInfo;
  bankDetails?: BankDetails;
  showTermsAndConditions?: boolean;
  customFooterText?: string;
}

// export const generateInvoicePDFWithExtras = (
//   invoice: Invoice,
//   logoBase64?: string,
//   qrCodeBase64?: string,
//   options: PDFOptions = {}
// ): Promise<void> => {
//   return new Promise<void>((resolve, reject) => {
//     requestAnimationFrame(() => {
//       try {
//         // Input validation
//         if (!invoice) {
//           throw new Error("Invoice data is required");
//         }
//         if (!invoice.invoiceNumber?.trim()) {
//           throw new Error("Invoice number is required");
//         }
//         if (!invoice.items || invoice.items.length === 0) {
//           throw new Error("Invoice must contain at least one item");
//         }
//         if (!invoice.issueDate) {
//           throw new Error("Issue date is required");
//         }

//         // Validate invoice items
//         invoice.items.forEach((item, index) => {
//           if (!item.description?.trim()) {
//             throw new Error(`Item ${index + 1}: Description is required`);
//           }
//           if (item.quantity <= 0) {
//             throw new Error(
//               `Item ${index + 1}: Quantity must be greater than 0`
//             );
//           }
//           if (item.rate < 0) {
//             throw new Error(`Item ${index + 1}: Rate cannot be negative`);
//           }
//         });

//         const doc = new jsPDF({
//           orientation: "portrait",
//           unit: "mm",
//           format: "a4",
//         });

//         const pageWidth = doc.internal.pageSize.width;
//         const pageHeight = doc.internal.pageSize.height;
//         const margin = 20;
//         const contentWidth = pageWidth - margin * 2;

//         // Default company info
//         const companyInfo: CompanyInfo = {
//           name: "CSK REALTORS",
//           address: "123, Business Complex, Commercial Street",
//           city: "Hyderabad, Telangana - 500081",
//           phone: "+91-9876543210",
//           email: "contact@cskrealtors.com",
//           website: "www.cskrealtors.com",
//           gst: "36XXXXX1234X1ZX",
//           pan: "ABCDE1234F",
//           ...options.companyInfo,
//         };

//         const bankDetails: BankDetails = {
//           bankName: "ICICI BANK LIMITED",
//           accountNumber: "123456789012",
//           ifsc: "ICIC0001234",
//           branch: "HYDERABAD MAIN BRANCH",
//           accountHolderName: "CSK REALTORS",
//           ...options.bankDetails,
//         };

//         let currentY = margin;

//         // Utility functions
//         const setFont = (style: "normal" | "bold" | "italic", size: number) => {
//           doc.setFont("helvetica", style);
//           doc.setFontSize(size);
//           doc.setTextColor("#000000"); // Always black text
//         };

//         const addText = (text: string, x: number, y: number, options?: any) => {
//           if (text) {
//             doc.text(text, x, y, options);
//           }
//         };

//         const addLine = (
//           x1: number,
//           y1: number,
//           x2: number,
//           y2: number,
//           lineWidth: number = 0.5
//         ) => {
//           doc.setDrawColor("#000000");
//           doc.setLineWidth(lineWidth);
//           doc.line(x1, y1, x2, y2);
//         };

//         const addRect = (
//           x: number,
//           y: number,
//           width: number,
//           height: number,
//           lineWidth: number = 0.5
//         ) => {
//           doc.setDrawColor("#000000");
//           doc.setLineWidth(lineWidth);
//           doc.rect(x, y, width, height);
//         };

//         const formatCurrency = (amount: number): string => {
//           return `Rs. ${amount.toLocaleString("en-IN", {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//           })}`;
//         };

//         const formatDate = (dateString: string): string => {
//           const date = new Date(dateString);
//           if (isNaN(date.getTime())) {
//             throw new Error("Invalid date format");
//           }
//           return date.toLocaleDateString("en-GB", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "numeric",
//           });
//         };

//         const splitText = (
//           text: string,
//           maxWidth: number,
//           fontSize: number
//         ): string[] => {
//           if (!text) return [""];
//           doc.setFontSize(fontSize);
//           return doc.splitTextToSize(text, maxWidth);
//         };

//         const addSectionDivider = (y: number) => {
//           addLine(margin, y, pageWidth - margin, y, 1);
//           return y + 8;
//         };

//         // HEADER SECTION
//         // Company Logo
//         if (logoBase64) {
//           try {
//             // Validate base64 format
//             if (logoBase64.includes("data:image")) {
//               doc.addImage(logoBase64, "PNG", margin, currentY, 30, 20);
//             } else {
//               doc.addImage(logoBase64, "PNG", margin, currentY, 30, 20);
//             }
//           } catch (logoError) {
//             console.warn("Logo could not be added:", logoError);
//             // Continue without logo
//           }
//         }

//         // Company Information (Top Left)
//         const companyInfoX = logoBase64 ? margin + 35 : margin;
//         setFont("bold", 16);
//         addText(companyInfo.name, companyInfoX, currentY + 8);

//         setFont("normal", 10);
//         let companyDetailsY = currentY + 16;

//         const companyDetails = [
//           companyInfo.address,
//           companyInfo.city,
//           `Phone: ${companyInfo.phone}`,
//           `Email: ${companyInfo.email}`,
//           companyInfo.website && `Website: ${companyInfo.website}`,
//           companyInfo.gst && `GST No: ${companyInfo.gst}`,
//           companyInfo.pan && `PAN No: ${companyInfo.pan}`,
//         ].filter(Boolean);

//         companyDetails.forEach((detail) => {
//           if (detail) {
//             addText(detail, companyInfoX, companyDetailsY);
//             companyDetailsY += 5;
//           }
//         });

//         // Invoice Title and Details (Top Right)
//         setFont("bold", 20);
//         addText("INVOICE", pageWidth - margin, currentY + 8, {
//           align: "right",
//         });

//         setFont("bold", 12);
//         addText(
//           `Invoice No: ${invoice.invoiceNumber}`,
//           pageWidth - margin,
//           currentY + 18,
//           { align: "right" }
//         );

//         setFont("normal", 10);
//         addText(
//           `Date: ${formatDate(invoice.issueDate)}`,
//           pageWidth - margin,
//           currentY + 26,
//           { align: "right" }
//         );

//         if (invoice.dueDate) {
//           addText(
//             `Due Date: ${formatDate(invoice.dueDate)}`,
//             pageWidth - margin,
//             currentY + 32,
//             { align: "right" }
//           );
//         }

//         currentY = Math.max(companyDetailsY, currentY + 40) + 10;

//         // Section divider
//         currentY = addSectionDivider(currentY);

//         // BILLING SECTION
//         const billingStartY = currentY;

//         // Bill To (Left Side)
//         setFont("bold", 12);
//         addText("BILL TO:", margin, currentY);
//         currentY += 8;

//         setFont("normal", 10);
//         if (invoice.billTo && invoice.billTo.name) {
//           const billToDetails = [
//             invoice.billTo.name,
//             invoice.billTo.address,
//             invoice.billTo.city,
//             invoice.billTo.postalCode,
//             invoice.billTo.phone && `Phone: ${invoice.billTo.phone}`,
//             invoice.billTo.email && `Email: ${invoice.billTo.email}`,
//           ].filter(Boolean);

//           billToDetails.forEach((detail) => {
//             if (detail) {
//               const lines = splitText(detail, 80, 10);
//               lines.forEach((line) => {
//                 addText(line, margin, currentY);
//                 currentY += 5;
//               });
//             }
//           });
//         } else {
//           addText("Customer Name: ____________________", margin, currentY);
//           currentY += 6;
//           addText("Address: ____________________", margin, currentY);
//           currentY += 6;
//           addText("         ____________________", margin, currentY);
//           currentY += 6;
//           addText("Phone: ____________________", margin, currentY);
//           currentY += 6;
//         }

//         // Project Details (Right Side)
//         let projectY = billingStartY;
//         const projectX = pageWidth - margin - 70;

//         setFont("bold", 12);
//         addText("PROJECT DETAILS:", projectX, projectY);
//         projectY += 8;

//         setFont("normal", 10);
//         addText(
//           `Project: ${
//             invoice.project?.projectId?.basicInfo?.projectName || "N/A"
//           }`,
//           projectX,
//           projectY
//         );
//         projectY += 6;

//         const unitDescription =
//           invoice.items[0]?.description?.split("(")[0]?.trim() || "Villa-1";
//         addText(`Unit: ${unitDescription}`, projectX, projectY);
//         projectY += 6;

//         addText("Type: Villa", projectX, projectY);

//         currentY = Math.max(currentY, projectY) + 15;

//         // COMMENTS SECTION
//         if (invoice.notes?.trim()) {
//           setFont("bold", 11);
//           addText("COMMENTS / SPECIAL INSTRUCTIONS:", margin, currentY);
//           currentY += 8;

//           setFont("normal", 10);
//           const noteLines = splitText(invoice.notes, contentWidth - 10, 10);
//           noteLines.forEach((line) => {
//             addText(line, margin, currentY);
//             currentY += 5;
//           });
//           currentY += 10;
//         }

//         // Section divider
//         currentY = addSectionDivider(currentY);

//         // ITEMS TABLE
//         const tableStartY = currentY;

//         // Table dimensions
//         const colWidths = [20, 90, 35, 35];
//         const colPositions = [margin];
//         for (let i = 1; i < colWidths.length; i++) {
//           colPositions.push(colPositions[i - 1] + colWidths[i - 1]);
//         }
//         const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
//         const rowHeight = 8;

//         // Table header
//         addRect(margin, currentY, tableWidth, rowHeight, 1);
//         setFont("bold", 10);

//         const headers = ["QTY", "DESCRIPTION", "RATE", "AMOUNT"];
//         headers.forEach((header, index) => {
//           // Add vertical lines for columns
//           if (index > 0) {
//             addLine(
//               colPositions[index],
//               currentY,
//               colPositions[index],
//               currentY + rowHeight,
//               1
//             );
//           }

//           addText(header, colPositions[index] + 2, currentY + 6);
//         });

//         currentY += rowHeight;

//         // Table rows
//         setFont("normal", 10);
//         invoice.items.forEach((item, index) => {
//           const itemRowHeight = Math.max(
//             rowHeight,
//             Math.ceil(item.description.length / 45) * 5 + 3
//           );

//           // Row border
//           addRect(margin, currentY, tableWidth, itemRowHeight, 0.5);

//           // Column separators
//           colPositions.slice(1).forEach((colX) => {
//             addLine(colX, currentY, colX, currentY + itemRowHeight, 0.5);
//           });

//           // Content
//           addText(item.quantity.toString(), colPositions[0] + 2, currentY + 6);

//           const descLines = splitText(item.description, colWidths[1] - 4, 10);
//           descLines.forEach((line, lineIndex) => {
//             addText(line, colPositions[1] + 2, currentY + 6 + lineIndex * 4);
//           });

//           addText(formatCurrency(item.rate), colPositions[2] + 2, currentY + 6);
//           addText(
//             formatCurrency(item.amount),
//             colPositions[3] + 2,
//             currentY + 6
//           );

//           currentY += itemRowHeight;
//         });

//         currentY += 10;

//         // TOTALS SECTION
//         const totalsX = pageWidth - margin - 70;
//         const totalsWidth = 70;

//         const cgstAmount = invoice.subtotal * (invoice.cgst / 100);
//         const sgstAmount = invoice.subtotal * (invoice.sgst / 100);

//         const totalsData = [
//           ["Sub Total:", invoice.subtotal],
//           [`CGST @ ${invoice.cgst}%:`, cgstAmount],
//           [`SGST @ ${invoice.sgst}%:`, sgstAmount],
//         ];

//         setFont("normal", 10);
//         totalsData.forEach(([label, amount]) => {
//           addText(label, totalsX, currentY);
//           addText(formatCurrency(amount), totalsX + totalsWidth, currentY, {
//             align: "right",
//           });
//           currentY += 6;
//         });

//         // Total line
//         addLine(totalsX, currentY, totalsX + totalsWidth, currentY, 1);
//         currentY += 4;

//         setFont("bold", 12);
//         addText("TOTAL AMOUNT:", totalsX, currentY);
//         addText(
//           formatCurrency(invoice.total),
//           totalsX + totalsWidth,
//           currentY,
//           { align: "right" }
//         );
//         addLine(totalsX, currentY + 2, totalsX + totalsWidth, currentY + 2, 1);
//         addLine(totalsX, currentY + 4, totalsX + totalsWidth, currentY + 4, 1);

//         currentY += 15;

//         // QR CODE (if provided)
//         if (qrCodeBase64) {
//           try {
//             const qrSize = 35;
//             const qrX = margin;
//             const qrY = currentY;

//             doc.addImage(qrCodeBase64, "PNG", qrX, qrY, qrSize, qrSize);

//             setFont("normal", 8);
//             addText("Scan for Payment", qrX, qrY + qrSize + 5);

//             currentY = qrY + qrSize + 15; // move currentY past QR
//           } catch (qrError) {
//             console.warn("QR code could not be added:", qrError);
//           }
//         } else {
//           currentY += 10;
//         }

//         // FOOTER SECTION
//         const footerStartY = Math.max(currentY + 10, pageHeight - 65);
//         currentY = addSectionDivider(footerStartY);

//         setFont("bold", 11);
//         addText("PAYMENT DETAILS:", margin, currentY);
//         currentY += 8;

//         setFont("normal", 9);
//         addText(
//           `Make all payments in favor of: ${
//             bankDetails.accountHolderName || companyInfo.name
//           }`,
//           margin,
//           currentY
//         );
//         currentY += 5;

//         const bankInfo = [
//           `Bank Name: ${bankDetails.bankName}`,
//           `Account No: ${bankDetails.accountNumber}`,
//           `IFSC Code: ${bankDetails.ifsc}`,
//           bankDetails.branch && `Branch: ${bankDetails.branch}`,
//         ].filter(Boolean);

//         bankInfo.forEach((info) => {
//           addText(info, margin, currentY);
//           currentY += 5;
//         });

//         // Terms and Conditions
//         if (options.showTermsAndConditions) {
//           currentY += 6;
//           setFont("bold", 10);
//           addText("TERMS & CONDITIONS:", margin, currentY);
//           currentY += 6;

//           setFont("normal", 9);
//           const terms = [
//             "1. Payment is due within 30 days of invoice date.",
//             "2. Interest @ 2% per month will be charged on overdue amounts.",
//             "3. All disputes subject to Hyderabad jurisdiction only.",
//             "4. Goods once sold will not be taken back.",
//           ];
//           terms.forEach((term) => {
//             addText(term, margin, currentY);
//             currentY += 4;
//           });
//         }

//         // Signature section
//         const signatureY = pageHeight - 25;
//         setFont("normal", 10);
//         addText("For CSK REALTORS", pageWidth - margin - 50, signatureY - 10);
//         addLine(
//           pageWidth - margin - 60,
//           signatureY,
//           pageWidth - margin - 10,
//           signatureY,
//           0.5
//         );
//         addText(
//           "Authorized Signatory",
//           pageWidth - margin - 50,
//           signatureY + 5
//         );

//         // Footer text
//         if (options.customFooterText) {
//           setFont("normal", 8);
//           addText(options.customFooterText, pageWidth / 2, pageHeight - 10, {
//             align: "center",
//           });
//         }

//         // Generate filename and save
//         const sanitizedInvoiceNumber = invoice.invoiceNumber.replace(
//           /[^a-zA-Z0-9]/g,
//           "-"
//         );
//         const dateString = formatDate(invoice.issueDate).replace(/\//g, "-");
//         const filename = `Invoice-${sanitizedInvoiceNumber}-${dateString}.pdf`;

//         doc.save(filename);
//         resolve();
//       } catch (error) {
//         console.error("PDF generation failed:", error);
//         reject(
//           error instanceof Error ? error : new Error("Unknown error occurred")
//         );
//       }
//     });
//   });
// };

export const generateInvoicePDFWithExtras = (
  invoice: Invoice,
  logoBase64?: string,
  qrCodeBase64?: string,
  options: PDFOptions = {}
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    requestAnimationFrame(() => {
      try {
        // Input validation
        if (!invoice) {
          throw new Error("Invoice data is required");
        }
        if (!invoice.invoiceNumber?.trim()) {
          throw new Error("Invoice number is required");
        }
        if (!invoice.items || invoice.items.length === 0) {
          throw new Error("Invoice must contain at least one item");
        }
        if (!invoice.issueDate) {
          throw new Error("Issue date is required");
        }

        // Validate invoice items
        invoice.items.forEach((item, index) => {
          if (!item.description?.trim()) {
            throw new Error(`Item ${index + 1}: Description is required`);
          }
          if (item.quantity <= 0) {
            throw new Error(
              `Item ${index + 1}: Quantity must be greater than 0`
            );
          }
          if (item.rate < 0) {
            throw new Error(`Item ${index + 1}: Rate cannot be negative`);
          }
        });

        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;
        const footerHeight = 40; // Reserve space for footer
        const maxContentHeight = pageHeight - margin - footerHeight;

        // Default company info
        const companyInfo: CompanyInfo = {
          name: "CSK REALTORS",
          address: "123, Business Complex, Commercial Street",
          city: "Hyderabad, Telangana - 500081",
          phone: "+91-9876543210",
          email: "contact@cskrealtors.com",
          website: "www.cskrealtors.com",
          gst: "36XXXXX1234X1ZX",
          pan: "ABCDE1234F",
          ...options.companyInfo,
        };

        const bankDetails: BankDetails = {
          bankName: "ICICI BANK LIMITED",
          accountNumber: "123456789012",
          ifsc: "ICIC0001234",
          branch: "HYDERABAD MAIN BRANCH",
          accountHolderName: "CSK REALTORS",
          ...options.bankDetails,
        };

        let currentY = margin;
        let currentPage = 1;

        // Utility functions
        const setFont = (style: "normal" | "bold" | "italic", size: number) => {
          doc.setFont("helvetica", style);
          doc.setFontSize(size);
          doc.setTextColor("#000000");
        };

        const addText = (text: string, x: number, y: number, options?: any) => {
          if (text) {
            doc.text(text, x, y, options);
          }
        };

        const addLine = (
          x1: number,
          y1: number,
          x2: number,
          y2: number,
          lineWidth: number = 0.5
        ) => {
          doc.setDrawColor("#000000");
          doc.setLineWidth(lineWidth);
          doc.line(x1, y1, x2, y2);
        };

        const addRect = (
          x: number,
          y: number,
          width: number,
          height: number,
          lineWidth: number = 0.5
        ) => {
          doc.setDrawColor("#000000");
          doc.setLineWidth(lineWidth);
          doc.rect(x, y, width, height);
        };

        const formatCurrency = (amount: number): string => {
          return `Rs. ${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        };

        const formatDate = (dateString: string): string => {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            throw new Error("Invalid date format");
          }
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        };

        const splitText = (
          text: string,
          maxWidth: number,
          fontSize: number
        ): string[] => {
          if (!text) return [""];
          doc.setFontSize(fontSize);
          return doc.splitTextToSize(text, maxWidth);
        };

        const addSectionDivider = (y: number) => {
          addLine(margin, y, pageWidth - margin, y, 1);
          return y + 8;
        };

        // Multi-page support functions
        const checkPageBreak = (requiredHeight: number): boolean => {
          return currentY + requiredHeight > maxContentHeight;
        };

        const addNewPage = () => {
          // Add page number to current page
          addPageNumber();
          
          // Create new page
          doc.addPage();
          currentPage++;
          currentY = margin;
          
          // Add header to new page
          addPageHeader();
        };

        const addPageNumber = () => {
          setFont("normal", 8);
          addText(
            `Page ${currentPage}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: "right" }
          );
        };

        const addPageHeader = () => {
          if (currentPage === 1) return;
          
          // Add simplified header for subsequent pages
          setFont("bold", 14);
          addText(companyInfo.name, margin, currentY);
          
          setFont("normal", 10);
          addText(
            `Invoice #${invoice.invoiceNumber} - Continued`,
            pageWidth - margin,
            currentY,
            { align: "right" }
          );
          
          currentY += 15;
          currentY = addSectionDivider(currentY);
        };

        const addFooterIfNeeded = () => {
          if (currentPage === 1) {
            // Only add full footer on first page if it's also the last page
            addFullFooter();
          } else {
            // Add simplified footer on continuation pages
            addSimplifiedFooter();
          }
        };

        const addFullFooter = () => {
          const footerStartY = Math.max(currentY + 10, pageHeight - 65);
          currentY = addSectionDivider(footerStartY);

          setFont("bold", 11);
          addText("PAYMENT DETAILS:", margin, currentY);
          currentY += 8;

          setFont("normal", 9);
          addText(
            `Make all payments in favor of: ${
              bankDetails.accountHolderName || companyInfo.name
            }`,
            margin,
            currentY
          );
          currentY += 5;

          const bankInfo = [
            `Bank Name: ${bankDetails.bankName}`,
            `Account No: ${bankDetails.accountNumber}`,
            `IFSC Code: ${bankDetails.ifsc}`,
            bankDetails.branch && `Branch: ${bankDetails.branch}`,
          ].filter(Boolean);

          bankInfo.forEach((info) => {
            addText(info, margin, currentY);
            currentY += 5;
          });

          // Terms and Conditions
          if (options.showTermsAndConditions) {
            currentY += 6;
            setFont("bold", 10);
            addText("TERMS & CONDITIONS:", margin, currentY);
            currentY += 6;

            setFont("normal", 9);
            const terms = [
              "1. Payment is due within 30 days of invoice date.",
              "2. Interest @ 2% per month will be charged on overdue amounts.",
              "3. All disputes subject to Hyderabad jurisdiction only.",
              "4. Goods once sold will not be taken back.",
            ];
            terms.forEach((term) => {
              addText(term, margin, currentY);
              currentY += 4;
            });
          }

          // Signature section
          const signatureY = pageHeight - 25;
          setFont("normal", 10);
          addText("For CSK REALTORS", pageWidth - margin - 50, signatureY - 10);
          addLine(
            pageWidth - margin - 60,
            signatureY,
            pageWidth - margin - 10,
            signatureY,
            0.5
          );
          addText(
            "Authorized Signatory",
            pageWidth - margin - 50,
            signatureY + 5
          );

          // Footer text
          if (options.customFooterText) {
            setFont("normal", 8);
            addText(options.customFooterText, pageWidth / 2, pageHeight - 10, {
              align: "center",
            });
          }
        };

        const addSimplifiedFooter = () => {
          const signatureY = pageHeight - 25;
          setFont("normal", 10);
          addText("For CSK REALTORS", pageWidth - margin - 50, signatureY - 10);
          addLine(
            pageWidth - margin - 60,
            signatureY,
            pageWidth - margin - 10,
            signatureY,
            0.5
          );
          addText(
            "Authorized Signatory",
            pageWidth - margin - 50,
            signatureY + 5
          );
        };

        // HEADER SECTION (First page only)
        // Company Logo
        if (logoBase64) {
          try {
            if (logoBase64.includes("data:image")) {
              doc.addImage(logoBase64, "PNG", margin, currentY, 30, 20);
            } else {
              doc.addImage(logoBase64, "PNG", margin, currentY, 30, 20);
            }
          } catch (logoError) {
            console.warn("Logo could not be added:", logoError);
          }
        }

        // Company Information (Top Left)
        const companyInfoX = logoBase64 ? margin + 35 : margin;
        setFont("bold", 16);
        addText(companyInfo.name, companyInfoX, currentY + 8);

        setFont("normal", 10);
        let companyDetailsY = currentY + 16;

        const companyDetails = [
          companyInfo.address,
          companyInfo.city,
          `Phone: ${companyInfo.phone}`,
          `Email: ${companyInfo.email}`,
          companyInfo.website && `Website: ${companyInfo.website}`,
          companyInfo.gst && `GST No: ${companyInfo.gst}`,
          companyInfo.pan && `PAN No: ${companyInfo.pan}`,
        ].filter(Boolean);

        companyDetails.forEach((detail) => {
          if (detail) {
            addText(detail, companyInfoX, companyDetailsY);
            companyDetailsY += 5;
          }
        });

        // Invoice Title and Details (Top Right)
        setFont("bold", 20);
        addText("INVOICE", pageWidth - margin, currentY + 8, {
          align: "right",
        });

        setFont("bold", 12);
        addText(
          `Invoice No: ${invoice.invoiceNumber}`,
          pageWidth - margin,
          currentY + 18,
          { align: "right" }
        );

        setFont("normal", 10);
        addText(
          `Date: ${formatDate(invoice.issueDate)}`,
          pageWidth - margin,
          currentY + 26,
          { align: "right" }
        );

        if (invoice.dueDate) {
          addText(
            `Due Date: ${formatDate(invoice.dueDate)}`,
            pageWidth - margin,
            currentY + 32,
            { align: "right" }
          );
        }

        currentY = Math.max(companyDetailsY, currentY + 40) + 10;

        // Section divider
        currentY = addSectionDivider(currentY);

        // BILLING SECTION
        const billingStartY = currentY;
        const billingHeight = 50; // Estimated height for billing section

        if (checkPageBreak(billingHeight)) {
          addNewPage();
        }

        // Bill To (Left Side)
        setFont("bold", 12);
        addText("BILL TO:", margin, currentY);
        currentY += 8;

        setFont("normal", 10);
        if (invoice.billTo && invoice.billTo.name) {
          const billToDetails = [
            invoice.billTo.name,
            invoice.billTo.address,
            invoice.billTo.city,
            invoice.billTo.postalCode,
            invoice.billTo.phone && `Phone: ${invoice.billTo.phone}`,
            invoice.billTo.email && `Email: ${invoice.billTo.email}`,
          ].filter(Boolean);

          billToDetails.forEach((detail) => {
            if (detail) {
              const lines = splitText(detail, 80, 10);
              lines.forEach((line) => {
                addText(line, margin, currentY);
                currentY += 5;
              });
            }
          });
        } else {
          addText("Customer Name: ____________________", margin, currentY);
          currentY += 6;
          addText("Address: ____________________", margin, currentY);
          currentY += 6;
          addText("         ____________________", margin, currentY);
          currentY += 6;
          addText("Phone: ____________________", margin, currentY);
          currentY += 6;
        }

        // Project Details (Right Side)
        let projectY = billingStartY;
        const projectX = pageWidth - margin - 70;

        setFont("bold", 12);
        addText("PROJECT DETAILS:", projectX, projectY);
        projectY += 8;

        setFont("normal", 10);
        addText(
          `Project: ${
            invoice.project?.projectId?.basicInfo?.projectName || "N/A"
          }`,
          projectX,
          projectY
        );
        projectY += 6;

        const unitDescription =
          invoice.items[0]?.description?.split("(")[0]?.trim() || "Villa-1";
        addText(`Unit: ${unitDescription}`, projectX, projectY);
        projectY += 6;

        addText("Type: Villa", projectX, projectY);

        currentY = Math.max(currentY, projectY) + 15;

        // COMMENTS SECTION
        if (invoice.notes?.trim()) {
          const notesHeight = splitText(invoice.notes, contentWidth - 10, 10).length * 5 + 20;
          
          if (checkPageBreak(notesHeight)) {
            addNewPage();
          }

          setFont("bold", 11);
          addText("COMMENTS / SPECIAL INSTRUCTIONS:", margin, currentY);
          currentY += 8;

          setFont("normal", 10);
          const noteLines = splitText(invoice.notes, contentWidth - 10, 10);
          noteLines.forEach((line) => {
            addText(line, margin, currentY);
            currentY += 5;
          });
          currentY += 10;
        }

        // Section divider
        currentY = addSectionDivider(currentY);

        // ITEMS TABLE
        const tableStartY = currentY;
        const colWidths = [20, 90, 35, 35];
        const colPositions = [margin];
        for (let i = 1; i < colWidths.length; i++) {
          colPositions.push(colPositions[i - 1] + colWidths[i - 1]);
        }
        const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
        const rowHeight = 8;

        // Check if we need a new page for table header
        if (checkPageBreak(rowHeight * 2)) {
          addNewPage();
        }

        // Table header
        const addTableHeader = () => {
          addRect(margin, currentY, tableWidth, rowHeight, 1);
          setFont("bold", 10);

          const headers = ["QTY", "DESCRIPTION", "RATE", "AMOUNT"];
          headers.forEach((header, index) => {
            if (index > 0) {
              addLine(
                colPositions[index],
                currentY,
                colPositions[index],
                currentY + rowHeight,
                1
              );
            }
            addText(header, colPositions[index] + 2, currentY + 6);
          });

          currentY += rowHeight;
        };

        addTableHeader();

        // Table rows with page break support
        setFont("normal", 10);
        invoice.items.forEach((item, index) => {
          const descLines = splitText(item.description, colWidths[1] - 4, 10);
          const itemRowHeight = Math.max(rowHeight, descLines.length * 4 + 3);

          // Check if we need a new page for this item
          if (checkPageBreak(itemRowHeight)) {
            addNewPage();
            addTableHeader(); // Add table header on new page
          }

          // Row border
          addRect(margin, currentY, tableWidth, itemRowHeight, 0.5);

          // Column separators
          colPositions.slice(1).forEach((colX) => {
            addLine(colX, currentY, colX, currentY + itemRowHeight, 0.5);
          });

          // Content
          addText(item.quantity.toString(), colPositions[0] + 2, currentY + 6);

          descLines.forEach((line, lineIndex) => {
            addText(line, colPositions[1] + 2, currentY + 6 + lineIndex * 4);
          });

          addText(formatCurrency(item.rate), colPositions[2] + 2, currentY + 6);
          addText(
            formatCurrency(item.amount),
            colPositions[3] + 2,
            currentY + 6
          );

          currentY += itemRowHeight;
        });

        currentY += 10;

        // TOTALS SECTION
        const totalsHeight = 60; // Estimated height for totals section
        if (checkPageBreak(totalsHeight)) {
          addNewPage();
        }

        const totalsX = pageWidth - margin - 70;
        const totalsWidth = 70;

        const cgstAmount = invoice.subtotal * (invoice.cgst / 100);
        const sgstAmount = invoice.subtotal * (invoice.sgst / 100);

        const totalsData = [
          ["Sub Total:", invoice.subtotal],
          [`CGST @ ${invoice.cgst}%:`, cgstAmount],
          [`SGST @ ${invoice.sgst}%:`, sgstAmount],
        ];

        setFont("normal", 10);
        totalsData.forEach(([label, amount]) => {
          addText(label, totalsX, currentY);
          addText(formatCurrency(amount), totalsX + totalsWidth, currentY, {
            align: "right",
          });
          currentY += 6;
        });

        // Total line
        addLine(totalsX, currentY, totalsX + totalsWidth, currentY, 1);
        currentY += 4;

        setFont("bold", 12);
        addText("TOTAL AMOUNT:", totalsX, currentY);
        addText(
          formatCurrency(invoice.total),
          totalsX + totalsWidth,
          currentY,
          { align: "right" }
        );
        addLine(totalsX, currentY + 2, totalsX + totalsWidth, currentY + 2, 1);
        addLine(totalsX, currentY + 4, totalsX + totalsWidth, currentY + 4, 1);

        currentY += 15;

        // QR CODE (if provided)
        if (qrCodeBase64) {
          const qrHeight = 50;
          if (checkPageBreak(qrHeight)) {
            addNewPage();
          }

          try {
            const qrSize = 35;
            const qrX = margin;
            const qrY = currentY;

            doc.addImage(qrCodeBase64, "PNG", qrX, qrY, qrSize, qrSize);

            setFont("normal", 8);
            addText("Scan for Payment", qrX, qrY + qrSize + 5);

            currentY = qrY + qrSize + 15;
          } catch (qrError) {
            console.warn("QR code could not be added:", qrError);
          }
        } else {
          currentY += 10;
        }

        // Add footer to the last page
        addFooterIfNeeded();
        
        // Add page number to the last page
        addPageNumber();

        // Generate filename and save
        const sanitizedInvoiceNumber = invoice.invoiceNumber.replace(
          /[^a-zA-Z0-9]/g,
          "-"
        );
        const dateString = formatDate(invoice.issueDate).replace(/\//g, "-");
        const filename = `Invoice-${sanitizedInvoiceNumber}-${dateString}.pdf`;

        doc.save(filename);
        resolve();
      } catch (error) {
        console.error("PDF generation failed:", error);
        reject(
          error instanceof Error ? error : new Error("Unknown error occurred")
        );
      }
    });
  });
};