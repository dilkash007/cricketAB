-- ============================================
-- COMPLETE TRANSACTION HISTORY SYSTEM
-- ============================================
-- Remove demo data and create real transaction tracking
-- Database: Betting_at_cricket
-- ============================================

-- Add password columns (if not added yet)
ALTER TABLE site2_vendor.vendors 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

ALTER TABLE site3_users.users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- ============================================
-- TABLE 1: Admin Fund Allocations
-- ============================================
-- Tracks ALL money given by admin (unlimited balance)

CREATE TABLE IF NOT EXISTS site1_superadmin.admin_fund_allocations (
    id SERIAL PRIMARY KEY,
    allocation_id VARCHAR(50) UNIQUE NOT NULL,
    allocation_type VARCHAR(50) NOT NULL, -- 'to_vendor', 'to_user'
    recipient_type VARCHAR(20) NOT NULL, -- 'vendor' or 'user'
    recipient_id VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    allocated_by VARCHAR(50) NOT NULL, -- admin username
    admin_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_admin_alloc_type 
    ON site1_superadmin.admin_fund_allocations(allocation_type);
CREATE INDEX IF NOT EXISTS idx_admin_alloc_recipient 
    ON site1_superadmin.admin_fund_allocations(recipient_id);
CREATE INDEX IF NOT EXISTS idx_admin_alloc_date 
    ON site1_superadmin.admin_fund_allocations(created_at DESC);

-- ============================================
-- TABLE 2: Vendor Transactions History
-- ============================================
-- Tracks EVERY vendor financial activity

CREATE TABLE IF NOT EXISTS site2_vendor.vendor_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    vendor_id VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    /* Types:
       - 'credit_from_admin': Admin gave money
       - 'debit_to_user': Vendor gave money to user
       - 'commission_earned': Commission from user bets
       - 'refund': Money returned
    */
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) DEFAULT 0,
    balance_after DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    reference_id VARCHAR(50), -- user_id, admin_id, etc
    reference_name VARCHAR(100),
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    
    CONSTRAINT fk_vendor 
        FOREIGN KEY (vendor_id) 
        REFERENCES site2_vendor.vendors(vendor_id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vendor_trans_vendor 
    ON site2_vendor.vendor_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_trans_type 
    ON site2_vendor.vendor_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_vendor_trans_date 
    ON site2_vendor.vendor_transactions(created_at DESC);

-- ============================================
-- TABLE 3: User Transactions History
-- ============================================
-- Tracks EVERY user financial activity

CREATE TABLE IF NOT EXISTS site3_users.user_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    /* Types:
       - 'credit_from_vendor': Vendor gave money
       - 'debit_by_vendor': Vendor took money
       - 'bet_placed': User placed bet (balance - exposure +)
       - 'bet_won': User won bet (balance +)
       - 'bet_lost': User lost bet (exposure -)
       - 'withdrawal': User withdrew money
       - 'deposit': User deposited money
    */
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) DEFAULT 0,
    balance_after DECIMAL(15,2) DEFAULT 0,
    exposure_before DECIMAL(15,2) DEFAULT 0,
    exposure_after DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    reference_id VARCHAR(50), -- vendor_id, match_id, bet_id
    reference_name VARCHAR(100),
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    
    CONSTRAINT fk_user 
        FOREIGN KEY (user_id) 
        REFERENCES site3_users.users(user_id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_trans_user 
    ON site3_users.user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trans_type 
    ON site3_users.user_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_user_trans_date 
    ON site3_users.user_transactions(created_at DESC);

-- ============================================
-- TABLE 4: Master Ledger (Complete History)
-- ============================================
-- Combined view of ALL transactions in the system

CREATE TABLE IF NOT EXISTS site1_superadmin.master_ledger (
    id SERIAL PRIMARY KEY,
    ledger_id VARCHAR(50) UNIQUE NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    entry_type VARCHAR(50) NOT NULL, -- 'admin_allocation', 'vendor_transaction', 'user_transaction'
    from_entity_type VARCHAR(20), -- 'admin', 'vendor', 'user'
    from_entity_id VARCHAR(50),
    from_entity_name VARCHAR(100),
    to_entity_type VARCHAR(20),
    to_entity_id VARCHAR(50),
    to_entity_name VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    transaction_type VARCHAR(50),
    description TEXT,
    created_by VARCHAR(50),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_ledger_date 
    ON site1_superadmin.master_ledger(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_from 
    ON site1_superadmin.master_ledger(from_entity_id);
CREATE INDEX IF NOT EXISTS idx_ledger_to 
    ON site1_superadmin.master_ledger(to_entity_id);

-- ============================================
-- TABLE 5: Withdrawal Queue
-- ============================================
-- Track user withdrawal requests

CREATE TABLE IF NOT EXISTS site1_superadmin.withdrawal_queue (
    id SERIAL PRIMARY KEY,
    withdrawal_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    username VARCHAR(100),
    vendor_id VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'processed'
    risk_protocol VARCHAR(50),
    approved_by VARCHAR(50),
    approved_at TIMESTAMP,
    processed_at TIMESTAMP,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_status 
    ON site1_superadmin.withdrawal_queue(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_date 
    ON site1_superadmin.withdrawal_queue(requested_at DESC);

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View 1: Vendor Financial Summary
CREATE OR REPLACE VIEW site2_vendor.vendor_financial_summary AS
SELECT 
    v.vendor_id,
    v.name,
    v.credit_limit,
    v.used_credit,
    (v.credit_limit - v.used_credit) as available_credit,
    v.commission_rate,
    COALESCE(SUM(CASE WHEN vt.transaction_type = 'credit_from_admin' THEN vt.amount ELSE 0 END), 0) as total_received_from_admin,
    COALESCE(SUM(CASE WHEN vt.transaction_type = 'debit_to_user' THEN vt.amount ELSE 0 END), 0) as total_given_to_users,
    COALESCE(SUM(CASE WHEN vt.transaction_type = 'commission_earned' THEN vt.amount ELSE 0 END), 0) as total_commission_earned,
    COUNT(DISTINCT CASE WHEN vt.transaction_type = 'debit_to_user' THEN vt.reference_id END) as total_users_funded,
    v.created_at,
    v.status
FROM site2_vendor.vendors v
LEFT JOIN site2_vendor.vendor_transactions vt ON v.vendor_id = vt.vendor_id
GROUP BY v.vendor_id, v.name, v.credit_limit, v.used_credit, v.commission_rate, v.created_at, v.status;

-- View 2: User Financial Summary
CREATE OR REPLACE VIEW site3_users.user_financial_summary AS
SELECT 
    u.user_id,
    u.username,
    u.balance,
    u.exposure,
    (u.balance - COALESCE(u.exposure, 0)) as available_balance,
    u.vendor_id,
    COALESCE(SUM(CASE WHEN ut.transaction_type = 'credit_from_vendor' THEN ut.amount ELSE 0 END), 0) as total_received,
    COALESCE(SUM(CASE WHEN ut.transaction_type = 'bet_placed' THEN ut.amount ELSE 0 END), 0) as total_bets,
    COALESCE(SUM(CASE WHEN ut.transaction_type = 'bet_won' THEN ut.amount ELSE 0 END), 0) as total_winnings,
    u.created_at,
    u.status
FROM site3_users.users u
LEFT JOIN site3_users.user_transactions ut ON u.user_id = ut.user_id
GROUP BY u.user_id, u.username, u.balance, u.exposure, u.vendor_id, u.created_at, u.status;

-- View 3: System Financial Overview
CREATE OR REPLACE VIEW site1_superadmin.system_financial_overview AS
SELECT 
    (SELECT COALESCE(SUM(amount), 0) FROM site1_superadmin.admin_fund_allocations WHERE allocation_type = 'to_vendor') as total_allocated_to_vendors,
    (SELECT COALESCE(SUM(credit_limit), 0) FROM site2_vendor.vendors WHERE status = 'Active') as total_vendor_limits,
    (SELECT COALESCE(SUM(used_credit), 0) FROM site2_vendor.vendors WHERE status = 'Active') as total_vendor_used,
    (SELECT COALESCE(SUM(balance), 0) FROM site3_users.users WHERE status = 'Active') as total_user_balance,
    (SELECT COALESCE(SUM(exposure), 0) FROM site3_users.users WHERE status = 'Active') as total_user_exposure,
    (SELECT COUNT(*) FROM site2_vendor.vendors WHERE status = 'Active') as active_vendors,
    (SELECT COUNT(*) FROM site3_users.users WHERE status = 'Active') as active_users,
    (SELECT COUNT(*) FROM site1_superadmin.withdrawal_queue WHERE status = 'pending') as pending_withdrawals,
    (SELECT COALESCE(SUM(amount), 0) FROM site1_superadmin.withdrawal_queue WHERE status = 'pending') as pending_withdrawal_amount;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate transaction ID
CREATE OR REPLACE FUNCTION generate_transaction_id(prefix VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('transaction_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for transaction IDs
CREATE SEQUENCE IF NOT EXISTS transaction_seq START 1;

-- ============================================
-- CLEAR DEMO DATA (Optional - run if needed)
-- ============================================

-- Uncomment these lines to remove demo data:
-- DELETE FROM site2_vendor.vendor_transactions;
-- DELETE FROM site3_users.user_transactions;
-- DELETE FROM site1_superadmin.admin_fund_allocations;
-- DELETE FROM site1_superadmin.master_ledger;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables created
SELECT 
    schemaname, 
    tablename, 
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname IN ('site1_superadmin', 'site2_vendor', 'site3_users')
    AND tablename IN ('admin_fund_allocations', 'vendor_transactions', 'user_transactions', 'master_ledger', 'withdrawal_queue')
ORDER BY schemaname, tablename;

-- Check password columns added
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema IN ('site2_vendor', 'site3_users')
    AND column_name = 'password_hash'
ORDER BY table_schema, table_name;

-- Check views created
SELECT 
    schemaname,
    viewname
FROM pg_views
WHERE schemaname IN ('site1_superadmin', 'site2_vendor', 'site3_users')
    AND viewname IN ('vendor_financial_summary', 'user_financial_summary', 'system_financial_overview')
ORDER BY schemaname, viewname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 
    '✅ Complete Transaction History System Created!' as status,
    'admin_fund_allocations - Admin → Vendor/User funds' as table1,
    'vendor_transactions - Vendor complete history' as table2,
    'user_transactions - User complete history' as table3,
    'master_ledger - Combined system ledger' as table4,
    'withdrawal_queue - User withdrawal requests' as table5,
    '3 Financial reporting views created' as views,
    'All indexes and functions created' as optimization,
    'NO DEMO DATA - Only real transactions!' as note;
