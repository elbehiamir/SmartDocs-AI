const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateEmbedding(
  text,
  taskType = "RETRIEVAL_DOCUMENT"
) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      taskType,
      outputDimensionality: 3072
    }
  });

  return response.embeddings[0].values;
}

module.exports = { generateEmbedding };