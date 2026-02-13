
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const client = new Client({
    host: process.env.CRICKET_DB_HOST,
    user: process.env.CRICKET_DB_USER,
    password: process.env.CRICKET_DB_PASSWORD,
    database: process.env.CRICKET_DB_NAME,
    port: parseInt(process.env.CRICKET_DB_PORT),
});

async function runSqlFile() {
    try {
        await client.connect();
        const sql = fs.readFileSync('database/audit_system.sql', 'utf8');
        await client.query(sql);
        console.log('✅ Reporting views and seeds applied successfully!');
    } catch (err) {
        console.error('Error applying SQL:', err);
    } finally {
        await client.end();
    }
}

runSqlFile();
