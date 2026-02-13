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

async function inspect() {
    try {
        const client = await pool.connect();

        console.log('--- Schemas ---');
        const schemas = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'site%'");
        console.log(schemas.rows.map(r => r.schema_name));

        if (schemas.rows.length === 0) {
            console.log('⚠️ No schemas starting with "site" found!');
        }

        for (const row of schemas.rows) {
            const schema = row.schema_name;
            console.log(`\n--- Tables in ${schema} ---`);
            const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = '${schema}'`);
            console.log(tables.rows.map(r => r.table_name));
        }

        client.release();
    } catch (err: any) {
        console.error('❌ Error inspecting database:', err.message);
    } finally {
        await pool.end();
    }
}

inspect();
