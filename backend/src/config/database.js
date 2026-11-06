const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "smartdocs_db",
  user: process.env.DB_USER || "amirelbehi",
  password: process.env.DB_PASSWORD || "",
});

pool.on("error", (error) => {
  console.error("Unexpected database error:", error);
});

module.exports = pool;