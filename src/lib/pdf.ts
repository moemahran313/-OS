import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Generates a PDF from a DOM element.
 * @param elementId The ID of the HTML element to capture.
 * @param fileName The name of the downloaded file.
 */
export async function downloadElementAsPdf(elementId: string, fileName: string = "invoice.pdf") {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found.`);
    return;
  }

  try {
    // Capture the element using html2canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow loading cross-origin images (like picsum)
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    
    // Create jsPDF instance
    // A4 size: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
}
