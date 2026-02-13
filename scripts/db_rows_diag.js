
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    host: process.env.CRICKET_DB_HOST || 'localhost',
    user: process.env.CRICKET_DB_USER || 'postgres',
    password: process.env.CRICKET_DB_PASSWORD,
    database: process.env.CRICKET_DB_NAME || 'Betting_at_cricket',
    port: parseInt(process.env.CRICKET_DB_PORT || '5432'),
});

async function checkRows() {
    try {
        const client = await pool.connect();
        console.log('--- Database Row Count Check ---');

        const queries = [
            { label: 'Site2 Vendors', schema: 'site2_vendor', table: 'vendors' },
            { label: 'Site3 Users', schema: 'site3_users', table: 'users' },
            { label: 'Site1 Admins', schema: 'site1_superadmin', table: 'admins' },
            { label: 'Site1 Matches', schema: 'site1_superadmin', table: 'matches' }
        ];

        for (const q of queries) {
            try {
                const res = await client.query(`SELECT COUNT(*) FROM ${q.schema}.${q.table}`);
                console.log(`${q.label}: ${res.rows[0].count} rows`);
            } catch (e) {
                console.log(`${q.label}: Table not found or error: ${e.message}`);
            }
        }

        client.release();
    } catch (err) {
        console.error('Error checking DB:', err.message);
    } finally {
        await pool.end();
    }
}

checkRows();
