const mysql = require("mysql2/promise");
require("dotenv").config();

/**
 * Database connection (MySQL)
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT
    ? Number(process.env.DB_CONNECTION_LIMIT)
    : 10,
  queueLimit: 0,
  // Cloud-specific SSL settings (Aiven Cloud)
  ssl: {
    rejectUnauthorized: false
  }
  // 
});

// Verify connectivity on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log("✅ MySQL connected successfully to Aiven Cloud.");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
})();

module.exports = pool;