const express = require("express");
const router = express.Router();

const { searchDocuments } = require("../controllers/search.controller");

router.post("/", searchDocuments);

module.exports = router;