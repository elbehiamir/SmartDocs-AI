
const { PDFParse } = require("pdf-parse");

async function extractPdfText(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Invalid PDF file");
  }

  const parser = new PDFParse({
    data: buffer
  });

  try {
    const result = await parser.getText();

    return {
      text: result.text.trim(),
      pages: result.total
    };
  } finally {
    await parser.destroy();
  }
}

module.exports = { extractPdfText };
