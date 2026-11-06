const { searchSimilarChunks } = require("../services/search.service");

async function searchDocuments(req, res) {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid question"
      });
    }

    const results = await searchSimilarChunks(question.trim());

    return res.status(200).json({
      success: true,
      question,
      resultsCount: results.length,
      results
    });

  } catch (error) {
    console.error("Search error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search documents"
    });
  }
}

module.exports = { searchDocuments };
