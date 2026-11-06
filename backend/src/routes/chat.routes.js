const express = require("express");
const router = express.Router();

const {
  chatWithDocuments
} = require("../controllers/chat.controller");

router.post("/", chatWithDocuments);

module.exports = router;