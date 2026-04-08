const { Pool } = require('pg');
require('dotenv').config({ path: 'f:/leadsphere/backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkData() {
  try {
    const { rows: companies } = await pool.query('SELECT * FROM companies');
    console.log('Companies:', companies);
    
    const { rows: users } = await pool.query('SELECT * FROM users');
    console.log('Users:', users);
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkData();
