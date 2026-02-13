
const pkg = require('pg');
const { Pool } = pkg;

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'dilkash@321',
    database: 'Betting_at_cricket',
    port: 5432
});

async function updateSchema() {
    try {
        console.log('Adding role column to site3_users.users...');
        await pool.query('ALTER TABLE site3_users.users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT \'User\'');
        console.log('✅ Column role added successfully');

        // Optional: Update some users to be 'Master' or 'Agent' for demo
        await pool.query("UPDATE site3_users.users SET role = 'Master' WHERE id % 3 = 1");
        await pool.query("UPDATE site3_users.users SET role = 'Agent' WHERE id % 3 = 2");
        console.log('✅ Demo roles updated');

        // Check if vendors table has a parent or type
        console.log('Checking site2_vendor.vendors for type/role...');
        const vendorCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'site2_vendor' AND table_name = 'vendors' AND column_name = 'type'");
        if (vendorCols.rows.length === 0) {
            console.log('Adding type column to site2_vendor.vendors...');
            await pool.query("ALTER TABLE site2_vendor.vendors ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Regular'");
        }

    } catch (err) {
        console.error('❌ Error updating schema:', err.message);
    } finally {
        await pool.end();
    }
}

updateSchema();
