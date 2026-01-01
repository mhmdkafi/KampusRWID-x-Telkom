import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.js";

// ✅ INI PENTING
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

class TextExtractor {
  async extractFromPDF(file) {
    try {
      console.log("📄 Starting PDF text extraction...");

      const arrayBuffer = await file.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
      });

      const pdf = await loadingTask.promise;
      console.log(`📊 PDF loaded: ${pdf.numPages} pages`);

      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map(item => item.str)
          .join(" ");

        fullText += pageText + "\n\n";
      }

      if (fullText.trim().length < 50) {
        console.warn("⚠️ PDF kemungkinan hasil scan (tidak ada text layer)");
      }

      return fullText.trim();
    } catch (err) {
      console.error("❌ PDF extraction error:", err);
      throw new Error(`Failed to extract text from PDF: ${err.message}`);
    }
  }

  isPDF(file) {
    return file?.type === "application/pdf";
  }

  isValidSize(file, maxMB = 5) {
    return file && file.size <= maxMB * 1024 * 1024;
  }
}

export const textExtractor = new TextExtractor();