const { extractPdfText } = require("../services/pdf.service");
const { chunkText } = require("../services/chunk.service");
const { generateEmbedding } = require("../services/embedding.service");
const pool = require("../config/database");

async function uploadDocument(req, res) {
  let client;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file"
      });
    }

    // 1. Extract text from PDF
    const pdfResult = await extractPdfText(req.file.buffer);

    if (!pdfResult.text) {
      return res.status(422).json({
        success: false,
        message: "No readable text found in this PDF"
      });
    }

    // 2. Split text into chunks
    const chunks = chunkText(pdfResult.text);

    // 3. Generate embeddings for all chunks
    const embeddings = [];

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      embeddings.push(embedding);
    }

    // 4. Connect to PostgreSQL
    client = await pool.connect();

    // 5. Start transaction
    await client.query("BEGIN");

    // 6. Save document
    const documentResult = await client.query(
      `INSERT INTO documents
       (filename, original_name, total_pages, total_chunks)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        req.file.originalname,
        req.file.originalname,
        pdfResult.pages,
        chunks.length
      ]
    );

    const documentId = documentResult.rows[0].id;

    // 7. Save chunks and embeddings
    for (let i = 0; i < chunks.length; i++) {
      const embeddingVector = `[${embeddings[i].join(",")}]`;

      await client.query(
        `INSERT INTO document_chunks
         (document_id, chunk_index, content, embedding)
         VALUES ($1, $2, $3, $4::halfvec)`,
        [
          documentId,
          i,
          chunks[i],
          embeddingVector
        ]
      );
    }

    // 8. Commit transaction
    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "PDF processed and embeddings saved successfully",
      document: {
        id: documentId,
        originalName: req.file.originalname,
        pages: pdfResult.pages,
        characters: pdfResult.text.length,
        chunksCount: chunks.length,
        embeddingsCount: embeddings.length,
        embeddingDimensions: embeddings[0].length
      }
    });

  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError.message);
      }
    }

    console.error("Document processing error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process PDF and generate embeddings"
    });

  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = { uploadDocument };