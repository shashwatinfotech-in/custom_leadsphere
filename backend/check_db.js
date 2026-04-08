const db = require('./config/db');

async function checkLeads() {
  try {
    const { rows: leads } = await db.query('SELECT id, name, company, admin_id, created_by FROM leads');
    console.log('Total Leads:', leads.length);
    console.log(JSON.stringify(leads, null, 2));
    
    const { rows: users } = await db.query('SELECT id, name, role, admin_id FROM users');
    console.log('Total Users:', users.length);
    console.log(JSON.stringify(users, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkLeads();
