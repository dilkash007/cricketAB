-- ============================================
-- AUTHENTICATION SYSTEM - DATABASE SETUP
-- ============================================
-- Elite Betting Admin - Security Implementation
-- Database: Betting_at_cricket
-- ============================================

\c Betting_at_cricket;

-- ============================================
-- STEP 1: Add Password Columns to Existing Tables
-- ============================================

-- Add password to vendors table
ALTER TABLE site2_vendor.vendors 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add password to users table
ALTER TABLE site3_users.users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- ============================================
-- STEP 2: Create Admins Table
-- ============================================

CREATE TABLE IF NOT EXISTS site1_superadmin.admins (
    id SERIAL PRIMARY KEY,
    admin_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'superadmin',
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- ============================================
-- STEP 3: Insert Default Admin
-- Password: "admin123" (hashed with bcrypt)
-- ============================================

INSERT INTO site1_superadmin.admins 
(admin_id, username, email, password_hash, role, status)
VALUES 
('ADMIN-001', 'superadmin', 'admin@elitebetting.com', '$2b$10$rKz8qF7YJ2nX5L.tHKqXXOGHqK7qF8Z9YqF7YJ2nX5L.tHKqXXOGH', 'superadmin', 'Active')
ON CONFLICT (admin_id) DO NOTHING;

-- ============================================
-- STEP 4: Create Sessions Table (JWT tokens)
-- ============================================

CREATE TABLE IF NOT EXISTS site1_superadmin.sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_type VARCHAR(20) NOT NULL, -- 'admin', 'vendor', 'user'
    token VARCHAR(500) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_token ON site1_superadmin.sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON site1_superadmin.sessions(user_id, user_type);

-- ============================================
-- STEP 5: Verification Queries
-- ============================================

-- Check if columns added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'site2_vendor' 
AND table_name = 'vendors' 
AND column_name = 'password_hash';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'site3_users' 
AND table_name = 'users' 
AND column_name = 'password_hash';

-- Check admin table
SELECT * FROM site1_superadmin.admins;

-- Check sessions table
SELECT * FROM site1_superadmin.sessions LIMIT 5;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 
    '✅ Authentication System Database Setup Complete!' as status,
    'Admins table created' as step1,
    'Password columns added to vendors & users' as step2,
    'Sessions table created' as step3,
    'Default admin created (username: superadmin, password: admin123)' as step4;
