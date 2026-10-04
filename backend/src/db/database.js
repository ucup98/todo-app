const { Pool } = require('pg');
require('dotenv').config();

// Railway menyediakan DATABASE_URL otomatis
// Lokal bisa pakai DATABASE_URL atau variabel terpisah
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// Test koneksi saat startup
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

module.exports = pool;
