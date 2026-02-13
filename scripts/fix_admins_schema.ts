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

async function fixSchema() {
    try {
        const client = await pool.connect();

        console.log('Adding status column to site1_superadmin.admins...');
        await client.query("ALTER TABLE site1_superadmin.admins ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active'");

        console.log('Schema fix completed successfully');
        client.release();
    } catch (err: any) {
        console.error('Error fixing schema:', err.message);
    } finally {
        await pool.end();
    }
}

fixSchema();
