
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    host: process.env.CRICKET_DB_HOST,
    user: process.env.CRICKET_DB_USER,
    password: process.env.CRICKET_DB_PASSWORD,
    database: process.env.CRICKET_DB_NAME,
    port: parseInt(process.env.CRICKET_DB_PORT),
});

async function debugData() {
    try {
        await client.connect();
        console.log('--- DETAILED DB DEBUG ---');

        console.log('\n1. ADMIN FUND ALLOCATIONS:');
        const allocs = await client.query('SELECT * FROM site1_superadmin.admin_fund_allocations');
        console.table(allocs.rows);

        console.log('\n2. VENDOR LIMITS:');
        const vendors = await client.query('SELECT vendor_id, name, credit_limit, used_credit FROM site2_vendor.vendors');
        console.table(vendors.rows);

        console.log('\n3. MASTER LEDGER:');
        const ledger = await client.query('SELECT * FROM site1_superadmin.master_ledger LIMIT 5');
        console.table(ledger.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

debugData();
