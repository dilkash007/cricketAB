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

async function inspectFull() {
    try {
        const client = await pool.connect();
        const schemas = ['site1_superadmin', 'site2_vendor', 'site3_users'];

        for (const schema of schemas) {
            console.log(`\n=== Schema: ${schema} ===`);
            const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = '${schema}'`);

            for (const table of tables.rows) {
                const tableName = table.table_name;
                const columns = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name = '${tableName}'`);
                console.log(`Table: ${tableName}`);
                console.log(`Columns: ${columns.rows.map(c => c.column_name).join(', ')}`);
            }
        }

        client.release();
    } catch (err: any) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

inspectFull();
