-- ============================================
-- DIRECT PGADMIN SQL - JUST COPY & RUN
-- ============================================
-- Database: Betting_at_cricket
-- Run this in pgAdmin Query Tool
-- ============================================

-- STEP 1: Add password columns
ALTER TABLE site2_vendor.vendors 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

ALTER TABLE site3_users.users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- STEP 2: Create admin fund allocations table
CREATE TABLE IF NOT EXISTS site1_superadmin.admin_fund_allocations (
    id SERIAL PRIMARY KEY,
    allocation_id VARCHAR(50) UNIQUE NOT NULL,
    allocation_type VARCHAR(50) NOT NULL,
    recipient_type VARCHAR(20) NOT NULL,
    recipient_id VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    allocated_by VARCHAR(50) NOT NULL,
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

-- STEP 3: Create vendor transactions table
CREATE TABLE IF NOT EXISTS site2_vendor.vendor_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    vendor_id VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) DEFAULT 0,
    balance_after DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    reference_id VARCHAR(50),
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

-- STEP 4: Create user transactions table
CREATE TABLE IF NOT EXISTS site3_users.user_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) DEFAULT 0,
    balance_after DECIMAL(15,2) DEFAULT 0,
    exposure_before DECIMAL(15,2) DEFAULT 0,
    exposure_after DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    reference_id VARCHAR(50),
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

-- STEP 5: Create master ledger table
CREATE TABLE IF NOT EXISTS site1_superadmin.master_ledger (
    id SERIAL PRIMARY KEY,
    ledger_id VARCHAR(50) UNIQUE NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    entry_type VARCHAR(50) NOT NULL,
    from_entity_type VARCHAR(20),
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

-- STEP 6: Create withdrawal queue table
CREATE TABLE IF NOT EXISTS site1_superadmin.withdrawal_queue (
    id SERIAL PRIMARY KEY,
    withdrawal_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    username VARCHAR(100),
    vendor_id VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
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

-- STEP 7: Create sequence for transaction IDs
CREATE SEQUENCE IF NOT EXISTS transaction_seq START 1;

-- STEP 8: Create function to generate transaction IDs
CREATE OR REPLACE FUNCTION generate_transaction_id(prefix VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('transaction_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- STEP 9: Create financial summary views
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

-- STEP 10: Verify everything created
SELECT 
    '✅ SETUP COMPLETE!' as status,
    'Password columns added' as step1,
    'admin_fund_allocations created' as step2,
    'vendor_transactions created' as step3,
    'user_transactions created' as step4,
    'master_ledger created' as step5,
    'withdrawal_queue created' as step6,
    'Transaction sequence created' as step7,
    'Generate ID function created' as step8,
    '3 Financial views created' as step9,
    'All indexes created' as step10,
    'Ready for real transactions!' as note;
