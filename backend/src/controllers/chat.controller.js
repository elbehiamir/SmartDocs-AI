const { generateChatAnswer } = require("../services/chat.service");

async function chatWithDocuments(req, res) {
  try {
    const { question, documentIds } = req.body;

    if (
      !question ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid question."
      });
    }

    if (
      !Array.isArray(documentIds) ||
      documentIds.length === 0 ||
      !documentIds.every(
        id => Number.isInteger(id) && id > 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one valid document."
      });
    }

    const selectedIds = [...new Set(documentIds)];

    console.log("Chat question:", question.trim());
    console.log("Selected document IDs:", selectedIds);

    const result = await generateChatAnswer(
      question.trim(),
      selectedIds
    );

    return res.status(200).json({
      success: true,
      question: question.trim(),
      answer: result.answer,
      sources: result.sources
    });

  } catch (error) {
    console.error("Chat error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate answer.",
      error: error.message
    });
  }
}

module.exports = {
  chatWithDocuments
};