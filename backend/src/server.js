require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Routes
const healthRoutes = require("./routes/health.routes");
const documentRoutes = require("./routes/document.routes");
const searchRoutes = require("./routes/search.routes");
const chatRoutes = require("./routes/chat.routes");

// Initialize Express
const app = express();

// Security Middleware
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5174"
}));

app.use(express.json({ limit: "1mb" }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

app.use(limiter);

// API Routes
app.use("/api/health", healthRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/chat", chatRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SmartDocs AI API running on port ${PORT}`);
});