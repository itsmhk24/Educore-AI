'use client';

import type { PDFDocumentProxy } from 'pdfjs-dist';

/**
 * PDF.js is loaded lazily and only in the browser. Importing it eagerly would
 * pull the library into the server render pass (it warns about the non-legacy
 * build in Node), and it is never needed on the server anyway.
 */
let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((pdfjsLib) => {
      /**
       * The worker is copied into `public/` by `scripts/copy-pdf-worker.mjs`
       * (runs automatically on `npm install`) and served as a static asset.
       * This works with the Next.js dev server and with Vercel's CDN.
       */
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      return pdfjsLib;
    });
  }

  return pdfjsPromise;
}

export interface ExtractedPdfResult {
  text: string;
  totalPageCount: number;
  processedPageCount: number;
  isTruncated: boolean;
  fileName: string;
  fileSizeBytes: number;
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_PAGE_LIMIT = 20;

/**
 * Extracts plain text from a PDF file in the browser up to 20 pages.
 */
export async function extractTextFromPdf(file: File): Promise<ExtractedPdfResult> {
  // Validate file type
  const isPdfType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfType) {
    throw new Error('Please upload a PDF.');
  }

  // Validate file size (10 MB limit)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File size exceeds the 10 MB limit. Please upload a smaller PDF.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await getPdfjs();

  let pdf: PDFDocumentProxy;
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      isEvalSupported: false,
    });
    pdf = await loadingTask.promise;
  } catch (err: any) {
    console.error('Failed to parse PDF document:', err);
    throw new Error("We couldn't read this file.");
  }

  const totalPageCount = pdf.numPages;
  if (!totalPageCount || totalPageCount < 1) {
    throw new Error("We couldn't read this file.");
  }

  const processedPageCount = Math.min(totalPageCount, MAX_PAGE_LIMIT);
  const isTruncated = totalPageCount > MAX_PAGE_LIMIT;

  let aggregatedText = '';

  for (let pageNum = 1; pageNum <= processedPageCount; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageStrings = content.items
        .map((item: any) => {
          if (item && typeof item.str === 'string') {
            return item.str;
          }
          return '';
        })
        .filter(Boolean);

      const pageText = pageStrings.join(' ').replace(/\s+/g, ' ').trim();
      if (pageText) {
        aggregatedText += `\n[Page ${pageNum}]\n${pageText}\n`;
      }
    } catch (pageErr) {
      console.warn(`Error reading page ${pageNum}:`, pageErr);
      // Continue to next page if possible
    }
  }

  const cleanedText = aggregatedText.trim();

  // If text is empty or essentially no words (less than 25 characters),
  // it's likely a scanned image PDF with no OCR layer or completely empty
  if (cleanedText.length < 25) {
    throw new Error("We couldn't read this file.");
  }

  return {
    text: cleanedText,
    totalPageCount,
    processedPageCount,
    isTruncated,
    fileName: file.name,
    fileSizeBytes: file.size,
  };
}
