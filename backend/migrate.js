const db = require('./config/db');

async function migrate() {
  try {
    console.log('Starting migration to add admin_id columns...');

    const tables = [
      'users',
      'leads',
      'lead_custom_fields',
      'audiences',
      'email_templates',
      'lead_templates',
      'imports'
    ];

    for (const table of tables) {
      console.log(`Checking table: ${table}`);
      
      // Check if column exists
      const { rows } = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${table}' AND column_name = 'admin_id'
      `);

      if (rows.length === 0) {
        console.log(`Adding admin_id to ${table}...`);
        await db.query(`ALTER TABLE ${table} ADD COLUMN admin_id UUID REFERENCES users(id)`);
        console.log(`Successfully added admin_id to ${table}`);
      } else {
        console.log(`admin_id already exists in ${table}`);
      }
    }

    // Special case for users: admin_id should be self-referencing for existings
    console.log('Updating existing admins to be their own site roots...');
    await db.query(`UPDATE users SET admin_id = id WHERE role = 'admin' AND admin_id IS NULL`);
    
    // For other users, we might not know their admin_id yet, but let's at least have the column
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
