import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 120000
});

// Send question with selected document IDs
export async function sendMessage(question, documentIds = []) {
  if (!Array.isArray(documentIds) || documentIds.length === 0) {
    throw new Error("Please select at least one document.");
  }

  const response = await API.post("/chat", {
    question,
    documentIds
  });

  return response.data;
}

// Upload PDF document
export async function uploadDocument(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await API.post(
    "/documents/upload",
    formData
  );

  return response.data;
}