
const pkg = require('pg');
const { Pool } = pkg;

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'dilkash@321',
    database: 'Betting_at_cricket',
    port: 5432
});

async function fixSchema() {
    try {
        console.log('Adding last_login column to site2_vendor.vendors...');
        await pool.query('ALTER TABLE site2_vendor.vendors ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITHOUT TIME ZONE');
        console.log('✅ Column last_login added successfully');
    } catch (err) {
        console.error('❌ Error updating schema:', err.message);
    } finally {
        await pool.end();
    }
}

fixSchema();
