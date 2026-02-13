import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.CRICKET_DB_HOST,
    user: process.env.CRICKET_DB_USER,
    password: process.env.CRICKET_DB_PASSWORD,
    database: process.env.CRICKET_DB_NAME,
    port: parseInt(process.env.CRICKET_DB_PORT || '5432'),
    ssl: process.env.CRICKET_DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function checkData() {
    try {
        const client = await pool.connect();

        console.log('--- Site 1 Admins ---');
        const admins = await client.query("SELECT id, username FROM site1_superadmin.admins");
        console.log(admins.rows);

        console.log('\n--- Site 2 Vendors ---');
        const vendors = await client.query("SELECT id, name FROM site2_vendor.vendors");
        console.log(vendors.rows);

        console.log('\n--- Site 3 Users ---');
        const users = await client.query("SELECT id, username FROM site3_users.users");
        console.log(users.rows);

        client.release();
    } catch (err: any) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkData();
