
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

async function checkDatabase() {
    try {
        await client.connect();
        console.log('--- DATABASE CHECK ---');

        // Check Vendors
        const vendors = await client.query('SELECT vendor_id, name, credit_limit, used_credit FROM site2_vendor.vendors ORDER BY created_at DESC');
        console.log(`\nTOTAL VENDORS: ${vendors.rowCount}`);
        vendors.rows.forEach(v => {
            console.log(`- Vendor: ${v.name} (${v.vendor_id}), Limit: ${v.credit_limit}, Used: ${v.used_credit}`);
        });

        // Check Admin Allocations
        const allocs = await client.query('SELECT COUNT(*) FROM site1_superadmin.admin_fund_allocations');
        console.log(`\nADMIN ALLOCATIONS: ${allocs.rows[0].count}`);

        // Check Vendor Transactions
        const vendorTrans = await client.query('SELECT COUNT(*) FROM site2_vendor.vendor_transactions');
        console.log(`VENDOR TRANSACTIONS: ${vendorTrans.rows[0].count}`);

        // Check Master Ledger
        const ledger = await client.query('SELECT COUNT(*) FROM site1_superadmin.master_ledger');
        console.log(`MASTER LEDGER ENTRIES: ${ledger.rows[0].count}`);

        // Check Users
        const users = await client.query('SELECT COUNT(*) FROM site3_users.users');
        console.log(`TOTAL USERS: ${users.rows[0].count}`);

    } catch (err) {
        console.error('Error connecting or querying:', err);
    } finally {
        await client.end();
    }
}

checkDatabase();
