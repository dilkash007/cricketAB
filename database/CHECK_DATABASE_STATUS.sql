-- ============================================
-- DATABASE CHECK QUERIES
-- ============================================
-- Run these in pgAdmin to see current database status
-- ============================================

-- 1. CHECK HOW MANY VENDORS EXIST
SELECT 
    COUNT(*) as total_vendors,
    SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_vendors
FROM site2_vendor.vendors;

-- 2. SEE ALL VENDORS WITH DETAILS
SELECT 
    vendor_id,
    name,
    email,
    credit_limit,
    used_credit,
    (credit_limit - COALESCE(used_credit, 0)) as available_credit,
    status,
    created_at
FROM site2_vendor.vendors
ORDER BY created_at DESC;

-- 3. CHECK IF TRANSACTION TABLES EXIST
SELECT 
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_schema IN ('site1_superadmin', 'site2_vendor', 'site3_users')
    AND table_name IN ('admin_fund_allocations', 'vendor_transactions', 'user_transactions', 'master_ledger', 'withdrawal_queue')
ORDER BY table_schema, table_name;

-- 4. CHECK ADMIN FUND ALLOCATIONS
SELECT 
    COUNT(*) as total_allocations,
    COALESCE(SUM(amount), 0) as total_allocated
FROM site1_superadmin.admin_fund_allocations;

-- 5. CHECK ALL ADMIN ALLOCATIONS (if any)
SELECT 
    allocation_id,
    recipient_name,
    amount,
    description,
    created_at
FROM site1_superadmin.admin_fund_allocations
ORDER BY created_at DESC
LIMIT 10;

-- 6. CHECK VENDOR TRANSACTIONS
SELECT 
    COUNT(*) as total_vendor_transactions
FROM site2_vendor.vendor_transactions;

-- 7. CHECK ALL VENDOR TRANSACTIONS (if any)
SELECT 
    transaction_id,
    vendor_id,
    transaction_type,
    amount,
    description,
    created_at
FROM site2_vendor.vendor_transactions
ORDER BY created_at DESC
LIMIT 10;

-- 8. CHECK MASTER LEDGER
SELECT 
    COUNT(*) as total_ledger_entries
FROM site1_superadmin.master_ledger;

-- 9. CHECK ALL LEDGER ENTRIES (if any)
SELECT 
    ledger_id,
    from_entity_name,
    to_entity_name,
    amount,
    description,
    transaction_date
FROM site1_superadmin.master_ledger
ORDER BY transaction_date DESC
LIMIT 10;

-- 10. CHECK USERS
SELECT 
    COUNT(*) as total_users
FROM site3_users.users;

-- 11. CHECK PASSWORD COLUMNS ADDED
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema IN ('site2_vendor', 'site3_users')
    AND column_name = 'password_hash';

-- ============================================
-- COMPLETE STATUS SUMMARY
-- ============================================
SELECT 
    'Total Vendors' as metric,
    COUNT(*)::text as value
FROM site2_vendor.vendors
UNION ALL
SELECT 
    'Total Users',
    COUNT(*)::text
FROM site3_users.users
UNION ALL
SELECT 
    'Total Admin Allocations',
    COUNT(*)::text
FROM site1_superadmin.admin_fund_allocations
UNION ALL
SELECT 
    'Total Vendor Transactions',
    COUNT(*)::text
FROM site2_vendor.vendor_transactions
UNION ALL
SELECT 
    'Total User Transactions',
    COUNT(*)::text
FROM site3_users.user_transactions
UNION ALL
SELECT 
    'Total Ledger Entries',
    COUNT(*)::text
FROM site1_superadmin.master_ledger;
