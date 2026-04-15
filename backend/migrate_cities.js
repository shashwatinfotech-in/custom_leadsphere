const db = require('./config/db');

const defaultCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Ahmedabad', 'Pune', 'Chennai',
  'Hyderabad', 'Kochi', 'Kolkata', 'Jaipur', 'Lucknow', 'Chandigarh',
  'New York', 'London', 'Dubai', 'Singapore', 'Tokyo', 'Sydney',
  'San Francisco', 'Toronto', 'Berlin', 'Paris'
];

async function migrateCities() {
  try {
    console.log('Ensuring cities table exists...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const { rows: userCityColumn } = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'city_id'
    `);

    if (userCityColumn.length === 0) {
      await db.query(`ALTER TABLE users ADD COLUMN city_id INTEGER REFERENCES cities(id)`);
      console.log('Added city_id column to users.');
    }

    const { rows: leadCityColumn } = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'leads' AND column_name = 'city_id'
    `);

    if (leadCityColumn.length === 0) {
      await db.query(`ALTER TABLE leads ADD COLUMN city_id INTEGER REFERENCES cities(id)`);
      console.log('Added city_id column to leads.');
    }

    for (const city of defaultCities) {
      await db.query(
        `INSERT INTO cities (name)
         VALUES ($1)
         ON CONFLICT (name) DO NOTHING`,
        [city]
      );
    }

    console.log('Cities migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Cities migration failed:', err);
    process.exit(1);
  }
}

migrateCities();
