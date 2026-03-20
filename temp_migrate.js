const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  try {
    console.log('Adding image column to categories table...');
    await pool.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS image VARCHAR(500);');
    console.log('Column added successfully!');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await pool.end();
  }
}

migrate();
