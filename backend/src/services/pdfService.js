let pdfjsLib = null;

async function getPdfJs() {
  if (!pdfjsLib) {
    const pdfjsModule = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjsLib = pdfjsModule;
  }
  return pdfjsLib;
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractTextFromPDF(buffer) {
  try {
    const pdfjs = await getPdfJs();
    // pdfjs-dist requires a proper Uint8Array with its own buffer
    let data;
    if (buffer instanceof Uint8Array && buffer.buffer instanceof ArrayBuffer) {
      data = new Uint8Array(buffer);
    } else if (Buffer.isBuffer(buffer)) {
      data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    } else {
      data = new Uint8Array(buffer);
    }
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return cleanText(fullText);
  } catch (error) {
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}

function truncateText(text, maxLength = 10000) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

module.exports = { extractTextFromPDF, cleanText, truncateText };
