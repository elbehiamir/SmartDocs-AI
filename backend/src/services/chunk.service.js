
function chunkText(text, chunkSize = 1000, overlap = 200) {
  if (!text || typeof text !== "string") {
    return [];
  }

  const cleanText = text.replace(/\s+/g, " ").trim();

  if (!cleanText) {
    return [];
  }

  const chunks = [];
  let start = 0;

  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length);

    const chunk = cleanText.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end === cleanText.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks;
}

module.exports = { chunkText };
