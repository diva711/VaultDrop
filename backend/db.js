// db.js — creates a connection pool to PostgreSQL
// A pool keeps multiple connections open so the app doesn't
// reconnect to the DB on every single request (slow)

const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: 
  {
    rejectUnauthorized: false
  }
});

// Test the connection when the server starts
pool.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL');
  }
});

module.exports = pool;
