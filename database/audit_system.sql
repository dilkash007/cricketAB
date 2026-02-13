
-- Forensic Security Ledger (Audit Logging System)
-- Tracks all administrative mutations with full forensic context

CREATE TABLE IF NOT EXISTS site1_superadmin.audit_logs (
    id SERIAL PRIMARY KEY,
    security_token VARCHAR(100) UNIQUE NOT NULL, -- The "ID" shown in UI
    admin_id VARCHAR(50) NOT NULL,
    admin_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'Vendor Created', 'Fund Allocation'
    category VARCHAR(20) NOT NULL CHECK (category IN ('Security', 'Finance', 'Vendor', 'System')),
    details TEXT,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    user_agent TEXT,
    sql_query TEXT, -- Forensic raw SQL trace
    prev_state JSONB DEFAULT '{}', -- State before mutation
    new_state JSONB DEFAULT '{}', -- State after mutation
    timestamp TIMESTAMP DEFAULT NOW()
);

-- KPI View for Security Ledger
CREATE OR REPLACE VIEW site1_superadmin.audit_kpi_summary AS
SELECT 
    (SELECT COUNT(*) FROM site1_superadmin.audit_logs WHERE timestamp > NOW() - INTERVAL '24 hours') as total_logs_24h,
    (SELECT COUNT(*) FROM site1_superadmin.risk_alerts WHERE severity = 'OMEGA' AND status = 'pending') as security_alerts,
    (SELECT COUNT(*) FROM site1_superadmin.ip_blacklist WHERE status = 'active') as failed_logins, -- Using blacklisted IPs as proxy for failed attempts
    'Stable' as system_stability;

-- Initial Forensic Traces (Seed Data)
INSERT INTO site1_superadmin.audit_logs 
(security_token, admin_id, admin_name, action, category, details, ip_address, user_agent, sql_query, prev_state, new_state)
VALUES 
('TRC-8821-X', 'ADM-001', 'Admin User', 'Vendor Created', 'Vendor', 'Created vendor "Naresh" with 1000 credit limit', '192.168.1.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'INSERT INTO site2_vendor.vendors (name, email, credit_limit) VALUES (''Naresh'', ''naresh@demo.com'', 1000)', '{}', '{"name": "Naresh", "credit_limit": 1000}'),
('TRC-9932-Y', 'ADM-001', 'Admin User', 'Fund Allocation', 'Finance', 'Allocated 50,000 to vendor "Raju"', '192.168.1.15', 'Mozilla/5.0 (Windows NT 1.0; Win64; x64)', 'UPDATE site2_vendor.vendors SET credit_limit = credit_limit + 50000 WHERE name = ''Raju''', '{"credit_limit": 0}', '{"credit_limit": 50000}'),
('TRC-1102-Z', 'ADM-001', 'Admin User', 'IP Blacklisted', 'Security', 'Blocked 192.168.1.42 for brute force attempts', '127.0.0.1', 'Node-Internal-Monitor', 'INSERT INTO site1_superadmin.ip_blacklist (ip_address, reason) VALUES (''192.168.1.42'', ''Brute Force'')', '{}', '{"ip": "192.168.1.42", "status": "blocked"}')
ON CONFLICT (security_token) DO NOTHING;
