import { jsPDF } from 'jspdf';

export interface ConvertedPdfResult {
  fileName: string;
  fileSize: string;
  dataUrl: string;
  previewUrl: string;
  isImageConverted: boolean;
}

/**
 * Converts an image file (PNG, JPG, JPEG, WEBP) to a standardized PDF document.
 */
export async function convertImageToPdf(file: File): Promise<ConvertedPdfResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();

      img.onload = () => {
        try {
          // Standard A4 dimensions in mm: 210 x 297
          const pdf = new jsPDF({
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          // Calculate aspect ratio to fit page margins
          const margin = 10;
          const maxW = pageWidth - margin * 2;
          const maxH = pageHeight - margin * 2 - 15; // Leave room for header

          const imgRatio = img.width / img.height;
          let renderW = maxW;
          let renderH = maxW / imgRatio;

          if (renderH > maxH) {
            renderH = maxH;
            renderW = maxH * imgRatio;
          }

          const posX = (pageWidth - renderW) / 2;
          const posY = margin + 12;

          // Header branding
          pdf.setFontSize(9);
          pdf.setTextColor(100, 116, 139);
          pdf.text('REPUBLIC OF GHANA • NATIONAL AI CLEARANCE SYSTEM (NAPTCS)', margin, 12);
          pdf.setFontSize(8);
          pdf.text(`Statutory Document Scan: ${file.name}`, pageWidth - margin, 12, { align: 'right' });
          pdf.setDrawColor(203, 213, 225);
          pdf.setLineWidth(0.3);
          pdf.line(margin, 14, pageWidth - margin, 14);

          // Add image to PDF
          const format = file.type.includes('png') ? 'PNG' : 'JPEG';
          pdf.addImage(dataUrl, format, posX, posY, renderW, renderH);

          // Footer
          pdf.setFontSize(7);
          pdf.setTextColor(148, 163, 184);
          pdf.text('Formally archived for Act 843 & NAPTCS Statutory Regulatory Evaluation', margin, pageHeight - 6);
          pdf.text(`Generated: ${new Date().toISOString().slice(0, 10)}`, pageWidth - margin, pageHeight - 6, { align: 'right' });

          const pdfDataUrl = pdf.output('datauristring');
          const pdfBlob = pdf.output('blob');
          const formattedSize = formatFileSize(pdfBlob.size);

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const newFileName = `${baseName}_converted.pdf`;

          resolve({
            fileName: newFileName,
            fileSize: formattedSize,
            dataUrl: pdfDataUrl,
            previewUrl: dataUrl,
            isImageConverted: true
          });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image for PDF conversion'));
      img.src = dataUrl;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a native PDF file into a Data URL for previewing and storage.
 */
export async function readPdfFile(file: File): Promise<ConvertedPdfResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const formattedSize = formatFileSize(file.size);

      resolve({
        fileName: file.name,
        fileSize: formattedSize,
        dataUrl,
        previewUrl: dataUrl,
        isImageConverted: false
      });
    };

    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a realistic sample official PDF for pre-populated organizations.
 */
export function generateSamplePdf(title: string, entityName: string, category: string, refCode: string): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(13, 21, 39);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFontSize(10);
  doc.setTextColor(251, 191, 36);
  doc.text('REPUBLIC OF GHANA • NATIONAL AI PROJECT TRACKING & CLEARANCE', 14, 12);

  doc.setFontSize(14);
  doc.setTextColor(248, 250, 252);
  doc.text('STATUTORY CLEARANCE DOSSIER', 14, 20);

  // Document metadata box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 34, pageWidth - 28, 30, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('DOCUMENT TITLE:', 18, 42);
  doc.text('APPLICANT ENTITY:', 18, 50);
  doc.text('CATEGORY:', 18, 58);

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 55, 42);
  doc.text(entityName, 55, 50);
  doc.text(category, 55, 58);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`REFERENCE: ${refCode}`, pageWidth - 20, 42, { align: 'right' });
  doc.text(`DATE: ${new Date().toISOString().slice(0, 10)}`, pageWidth - 20, 50, { align: 'right' });

  // Body content
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Official Statutory Attestation & Compliance Filing', 14, 76);

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const text = `This statutory instrument serves as verified clearance documentation submitted by ${entityName} for regulatory vetting under the Ghana Data Protection Act 2012 (Act 843), the Cybersecurity Act 2020 (Act 1038), and the National AI Policy & Tracking Clearance Framework (NAPTCS).\n\nThe document has been encrypted and deposited into the sovereign national document vault. It certifies that the technical safeguards, sovereign data residency commitments, algorithmic risk controls, and DPC registration numbers satisfy national standards.`;
  const splitText = doc.splitTextToSize(text, pageWidth - 28);
  doc.text(splitText, 14, 84);

  // Seal badge
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, 130, pageWidth - 28, 25, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129);
  doc.text('VERIFIED STATUTORY EVIDENCE • NAPTCS GATEKEEPER COMPLIANT', 20, 141);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Audit Hash: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-GH`, 20, 148);

  return doc.output('datauristring');
}

/**
 * Format bytes to readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
