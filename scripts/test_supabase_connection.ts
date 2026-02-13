import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Supabase Connection...');
console.log('Host:', process.env.CRICKET_DB_HOST);
console.log('User:', process.env.CRICKET_DB_USER);
console.log('Database:', process.env.CRICKET_DB_NAME);
console.log('Port:', process.env.CRICKET_DB_PORT);
console.log('SSL:', process.env.CRICKET_DB_SSL);

const pool = new Pool({
    host: process.env.CRICKET_DB_HOST,
    user: process.env.CRICKET_DB_USER,
    password: process.env.CRICKET_DB_PASSWORD,
    database: process.env.CRICKET_DB_NAME,
    port: parseInt(process.env.CRICKET_DB_PORT || '5432'),
    ssl: process.env.CRICKET_DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function test() {
    try {
        const client = await pool.connect();
        console.log('✅ Connection successful!');
        const res = await client.query('SELECT current_database(), current_schema(), version()');
        console.log('Result:', res.rows[0]);
        client.release();
    } catch (err: any) {
        console.error('❌ Connection failed!');
        console.error(err.message);
    } finally {
        await pool.end();
    }
}

test();
