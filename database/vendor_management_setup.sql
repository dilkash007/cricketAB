-- ============================================
-- VENDOR MANAGEMENT SYSTEM - DATABASE SETUP
-- ============================================
-- Complete transaction tracking and finance management
-- Database: Betting_at_cricket
-- ============================================

\c Betting_at_cricket;

-- ============================================
-- TABLE 1: Vendor Transactions
-- ============================================
-- Tracks ALL vendor financial activities

CREATE TABLE IF NOT EXISTS site2_vendor.vendor_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    vendor_id VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, 
    -- Types: 'credit_from_admin', 'debit_to_user', 'commission_earned', 'refund'
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) DEFAULT 0,
    balance_after DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    reference_id VARCHAR(50), -- user_id, admin_id, etc
    reference_name VARCHAR(100), -- user name, admin name
    created_by VARCHAR(50) NOT NULL, -- Who initiated this transaction
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB, -- Extra info (IP, browser, etc)
    
    CONSTRAINT fk_vendor 
        FOREIGN KEY (vendor_id) 
        REFERENCES site2_vendor.vendors(vendor_id) 
        ON DELETE CASCADE
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_vendor_trans_vendor 
    ON site2_vendor.vendor_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_trans_type 
    ON site2_vendor.vendor_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_vendor_trans_date 
    ON site2_vendor.vendor_transactions(created_at DESC);

-- ============================================
-- TABLE 2: User Transactions
-- ============================================
-- Tracks ALL user financial activities

CREATE TABLE IF NOT EXISTS site3_users.user_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    -- Types: 'credit_from_vendor', 'debit_by_vendor', 'bet_placed', 'bet_won', 'bet_lost', 'withdrawal', 'deposit'
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) DEFAULT 0,
    balance_after DECIMAL(15,2) DEFAULT 0,
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_trans_user 
    ON site3_users.user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trans_type 
    ON site3_users.user_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_user_trans_date 
    ON site3_users.user_transactions(created_at DESC);

-- ============================================
-- TABLE 3: Admin Fund Allocations
-- ============================================
-- Tracks admin's unlimited fund distribution

CREATE TABLE IF NOT EXISTS site1_superadmin.admin_fund_allocations (
    id SERIAL PRIMARY KEY,
    allocation_id VARCHAR(50) UNIQUE NOT NULL,
    allocation_type VARCHAR(50) NOT NULL, -- 'to_vendor', 'to_user', 'commission_payout'
    recipient_type VARCHAR(20) NOT NULL, -- 'vendor' or 'user'
    recipient_id VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    allocated_by VARCHAR(50) NOT NULL, -- admin_id or username
    admin_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_alloc_type 
    ON site1_superadmin.admin_fund_allocations(allocation_type);
CREATE INDEX IF NOT EXISTS idx_admin_alloc_recipient 
    ON site1_superadmin.admin_fund_allocations(recipient_id);
CREATE INDEX IF NOT EXISTS idx_admin_alloc_date 
    ON site1_superadmin.admin_fund_allocations(created_at DESC);

-- ============================================
-- HELPER FUNCTIONS
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
-- VIEWS FOR REPORTING
-- ============================================

-- Vendor Financial Summary View
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
    COUNT(DISTINCT CASE WHEN vt.transaction_type = 'debit_to_user' THEN vt.reference_id END) as total_users_funded
FROM site2_vendor.vendors v
LEFT JOIN site2_vendor.vendor_transactions vt ON v.vendor_id = vt.vendor_id
GROUP BY v.vendor_id, v.name, v.credit_limit, v.used_credit, v.commission_rate;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables created
SELECT 
    schemaname, 
    tablename, 
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname IN ('site1_superadmin', 'site2_vendor', 'site3_users')
    AND tablename IN ('vendor_transactions', 'user_transactions', 'admin_fund_allocations')
ORDER BY schemaname, tablename;

-- Check vendor_transactions structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'site2_vendor' 
    AND table_name = 'vendor_transactions'
ORDER BY ordinal_position;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 
    '✅ Vendor Management System - Database Setup Complete!' as status,
    'vendor_transactions table created' as step1,
    'user_transactions table created' as step2,
    'admin_fund_allocations table created' as step3,
    'Indexes created for performance' as step4,
    'Views created for reporting' as step5,
    'Helper functions created' as step6;
