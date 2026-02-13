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

async function inspectAdmins() {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'site1_superadmin' AND table_name = 'admins'");
        console.log('Columns:', res.rows.map(r => r.column_name));

        const data = await client.query("SELECT * FROM site1_superadmin.admins LIMIT 1");
        console.log('Sample data:', data.rows);

        client.release();
    } catch (err: any) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

inspectAdmins();
