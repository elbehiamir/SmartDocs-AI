const pool = require("../config/database");
const { generateEmbedding } = require("./embedding.service");

async function searchSimilarChunks(
  question,
  limit = 5,
  documentIds = []
) {
  if (!Array.isArray(documentIds) || documentIds.length === 0) {
    throw new Error("At least one document must be selected.");
  }

  const queryEmbedding = await generateEmbedding(
    question,
    "RETRIEVAL_QUERY"
  );

  const vector = `[${queryEmbedding.join(",")}]`;

  const result = await pool.query(
    `SELECT
       dc.id,
       dc.document_id,
       dc.chunk_index,
       dc.content,
       d.original_name,
       1 - (dc.embedding <=> $1::halfvec) AS similarity
     FROM document_chunks dc
     JOIN documents d ON d.id = dc.document_id
     WHERE dc.embedding IS NOT NULL
       AND dc.document_id = ANY($3::int[])
     ORDER BY dc.embedding <=> $1::halfvec
     LIMIT $2`,
    [
      vector,
      limit,
      documentIds
    ]
  );

  return result.rows;
}

module.exports = {
  searchSimilarChunks
};