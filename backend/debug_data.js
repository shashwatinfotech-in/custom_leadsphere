const db = require('./config/db');

async function debugData() {
  try {
    const { rows: users } = await db.query('SELECT * FROM users');
    console.log('\n--- ALL USERS ---');
    console.table(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, admin_id: u.admin_id })));

    const { rows: leads } = await db.query('SELECT * FROM leads');
    console.log('\n--- ALL LEADS ---');
    console.table(leads.map(l => ({ id: l.id, name: l.name, company: l.company, admin_id: l.admin_id, created_by: l.created_by, status: l.status })));

    const { rows: imports } = await db.query('SELECT * FROM imports');
    console.log('\n--- ALL IMPORTS ---');
    console.table(imports);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugData();
