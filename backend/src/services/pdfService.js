const pdfParse = require('pdf-parse');

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return cleanText(data.text);
}

function truncateText(text, maxLength = 10000) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

module.exports = { extractTextFromPDF, cleanText, truncateText };
