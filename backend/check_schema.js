const db = require('./config/db');

async function checkSchema() {
  try {
    const { rows: columns } = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'leads'
    `);
    console.log('Columns in leads table:');
    columns.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));
    
    const { rows: userColumns } = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log('\nColumns in users table:');
    userColumns.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
