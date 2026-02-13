
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

async function repairHistory() {
    try {
        await client.connect();
        console.log('--- REPAIRING TRANSACTION HISTORY ---');

        // Get all vendors with credit
        const vendors = await client.query('SELECT vendor_id, name, credit_limit FROM site2_vendor.vendors WHERE credit_limit > 0');

        for (const v of vendors.rows) {
            const { vendor_id, name, credit_limit } = v;

            // Check if transaction already exists
            const check = await client.query(
                "SELECT count(*) FROM site2_vendor.vendor_transactions WHERE vendor_id = $1 AND transaction_type = 'credit_from_admin'",
                [vendor_id]
            );

            if (parseInt(check.rows[0].count) === 0) {
                console.log(`Fixing history for: ${name} (${vendor_id}) with ₹${credit_limit}`);

                const timestamp = new Date();
                const allocationId = `ALLOC-FIX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                const transactionId = `VTX-FIX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                const ledgerId = `LDG-FIX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

                // 1. Admin Fund Allocation
                await client.query(
                    `INSERT INTO site1_superadmin.admin_fund_allocations 
          (allocation_id, allocation_type, recipient_type, recipient_id, recipient_name, amount, description, allocated_by, created_at)
          VALUES ($1, 'to_vendor', 'vendor', $2, $3, $4, $5, 'system_repair', $6)`,
                    [allocationId, vendor_id, name, credit_limit, `Initial credit sync for existing vendor`, timestamp]
                );

                // 2. Vendor Transaction
                await client.query(
                    `INSERT INTO site2_vendor.vendor_transactions
          (transaction_id, vendor_id, transaction_type, amount, balance_before, balance_after, description, reference_id, reference_name, created_by, created_at)
          VALUES ($1, $2, 'credit_from_admin', $3, 0, $4, $5, 'admin', 'System Admin', 'system', $6)`,
                    [transactionId, vendor_id, credit_limit, credit_limit, `Initial credit synced: ₹${credit_limit.toLocaleString()}`, timestamp]
                );

                // 3. Master Ledger
                await client.query(
                    `INSERT INTO site1_superadmin.master_ledger
          (ledger_id, transaction_date, entry_type, from_entity_type, from_entity_id, from_entity_name, to_entity_type, to_entity_id, to_entity_name, amount, transaction_type, description, created_by)
          VALUES ($1, $2, 'admin_allocation', 'admin', 'ADMIN-001', 'System Admin', 'vendor', $3, $4, $5, 'credit_from_admin', $6, 'system')`,
                    [ledgerId, timestamp, vendor_id, name, credit_limit, `System synced ₹${credit_limit.toLocaleString()} to existing vendor ${name}`]
                );
            } else {
                console.log(`Skipping: ${name} (already has history)`);
            }
        }

        console.log('\n✅ REPAIR COMPLETE!');

    } catch (err) {
        console.error('Error during repair:', err);
    } finally {
        await client.end();
    }
}

repairHistory();
