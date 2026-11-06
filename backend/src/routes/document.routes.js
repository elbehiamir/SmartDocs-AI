
const express = require("express");
const multer = require("multer");

const { uploadDocument } = require("../controllers/document.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" &&
      file.originalname.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      return cb(null, true);
    }

    cb(new Error("Only PDF files are allowed"));
  }
});

router.post("/upload", upload.single("file"), uploadDocument);

module.exports = router;
