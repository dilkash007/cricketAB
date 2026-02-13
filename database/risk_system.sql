
-- Risk Surveillance & Fraud Mitigation System
-- Run this to enable real-time risk detection

-- 1. Risk Alerts Table
CREATE TABLE IF NOT EXISTS site1_superadmin.risk_alerts (
    id SERIAL PRIMARY KEY,
    alert_id VARCHAR(50) UNIQUE NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('OMEGA', 'ALPHA', 'BETA')),
    type VARCHAR(50) NOT NULL, -- e.g., 'FRAUD_DETECTION', 'SYSTEM_ANOMALY'
    reason TEXT NOT NULL,
    entity_type VARCHAR(20) NOT NULL, -- 'user', 'vendor', 'ip'
    entity_id VARCHAR(50) NOT NULL,
    entity_name VARCHAR(100),
    confidence INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'ignored')),
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. IP Blacklist Table
CREATE TABLE IF NOT EXISTS site1_superadmin.ip_blacklist (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    reason TEXT,
    blocked_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

-- 3. Risk KPI View
CREATE OR REPLACE VIEW site1_superadmin.risk_kpi_summary AS
SELECT 
    (SELECT COUNT(*) FROM site3_users.users WHERE status = 'Blocked') as flagged_users,
    (SELECT COUNT(*) FROM site1_superadmin.ip_blacklist WHERE status = 'active') as blocked_ips,
    (SELECT COUNT(*) FROM site1_superadmin.risk_alerts WHERE status = 'pending') as pending_triage,
    CAST(GREATEST(0, LEAST(100, (SELECT COUNT(*) FROM site1_superadmin.risk_alerts WHERE created_at > NOW() - INTERVAL '24 hours') * 2)) AS INT) as global_risk_score;

-- 4. Pattern Heuristics Calculation (Simulated logic based on real data patterns)
CREATE OR REPLACE VIEW site1_superadmin.risk_heuristics_summary AS
SELECT 
    'Multi-Accounting' as label, 
    CAST(LEAST(100, (SELECT COUNT(DISTINCT user_id) FROM site3_users.bets) * 0.5) AS INT) as percentage,
    'bg-indigo-500' as color
UNION ALL
SELECT 
    'Arbitrage Logic' as label,
    CAST(LEAST(100, (SELECT COUNT(*) FROM site3_users.bets WHERE odds > 5) * 5) AS INT) as percentage,
    'bg-emerald-500' as color
UNION ALL
SELECT 
    'Staking Spikes' as label,
    CAST(LEAST(100, (SELECT COUNT(*) FROM site3_users.bets WHERE stake > 1000) * 10) AS INT) as percentage,
    'bg-orange-500' as color
UNION ALL
SELECT 
    'Credential Stuffing' as label,
    CAST(LEAST(100, (SELECT COUNT(*) FROM site1_superadmin.risk_alerts WHERE type = 'BRUTE_FORCE') * 20) AS INT) as percentage,
    'bg-rose-500' as color;

-- Seed Some Initial Risk Data
INSERT INTO site1_superadmin.risk_alerts (alert_id, severity, type, reason, entity_type, entity_id, entity_name, confidence, status)
VALUES 
('ALERT-001', 'OMEGA', 'FRAUD_DETECTION', 'Suspicious win rate detected: 95% over last 20 matches', 'user', 'USR-001', 'Deepak Kumar', 92, 'pending'),
('ALERT-002', 'ALPHA', 'SYSTEM_ANOMALY', 'Unusual login pattern from unauthorized region (VPN detected)', 'vendor', 'VND-001', 'vendor1', 75, 'investigating'),
('ALERT-003', 'BETA', 'FRAUD_DETECTION', 'Multiple accounts linked to same payment profile', 'user', 'USR-002', 'Ravi Shankar', 88, 'pending')
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO site1_superadmin.ip_blacklist (ip_address, reason)
VALUES 
('192.168.1.42', 'Brute Force Attack Attempt'),
('45.23.11.90', 'High Volume Scraping Detection'),
('103.11.22.33', 'Known VPN / Proxy Node')
ON CONFLICT (ip_address) DO NOTHING;
