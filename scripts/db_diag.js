
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

async function checkDB() {
    try {
        const client = await pool.connect();
        console.log('--- Database Check ---');
        
        // Check Schemas
        const schemasRes = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('site1_superadmin', 'site2_vendor', 'site3_users')");
        console.log('Schemas found:', schemasRes.rows.map(r => r.schema_name));

        // Check Tables in each schema
        for (const schema of ['site1_superadmin', 'site2_vendor', 'site3_users']) {
            const tablesRes = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = $1`, [schema]);
            console.log(`Tables in ${schema}:`, tablesRes.rows.map(r => r.table_name));
        }

        client.release();
    } catch (err) {
        console.error('Error checking DB:', err.message);
    } finally {
        await pool.end();
    }
}

checkDB();
