require("dotenv").config();

const { generateEmbedding } = require("../services/embedding.service");

async function testEmbedding() {
  try {
    const embedding = await generateEmbedding(
      "SmartDocs AI is a document management system."
    );

    console.log("Embedding generated successfully!");
    console.log("Dimensions:", embedding.length);
    console.log("First values:", embedding.slice(0, 5));

  } catch (error) {
    console.error("Embedding error:", error.message);
  }
}

testEmbedding();