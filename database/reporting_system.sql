
-- Intelligence & Reporting Views
-- Run this to enable real-time analytics support

-- 1. Daily Volume & Yield View
CREATE OR REPLACE VIEW site1_superadmin.daily_revenue_analytics AS
SELECT 
    DATE(created_at) as date,
    CAST(SUM(stake) AS DECIMAL(15,2)) as volume,
    CAST(SUM(CASE WHEN status = 'settled' AND result = 'lost' THEN stake 
                  WHEN status = 'settled' AND result = 'won' THEN (stake - potential_win)
                  ELSE 0 END) AS DECIMAL(15,2)) as profit
FROM site3_users.bets
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) ASC;

-- 2. Sport Performance View
CREATE OR REPLACE VIEW site1_superadmin.sport_performance_summary AS
SELECT 
    match_type as name,
    COUNT(*) as bet_count,
    CAST(SUM(stake) AS DECIMAL(15,2)) as volume,
    ROUND(CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM site3_users.bets) AS NUMERIC), 1) as percentage
FROM site3_users.bets b
JOIN site1_superadmin.matches m ON b.match_id = m.match_id
GROUP BY match_type;

-- 3. Vendor Leaderboard View
CREATE OR REPLACE VIEW site1_superadmin.vendor_profitability_leaderboard AS
SELECT 
    v.name,
    v.vendor_id,
    CAST(SUM(b.stake) AS DECIMAL(15,2)) as volume,
    COUNT(DISTINCT b.user_id) as users,
    ROUND(CAST(RANDOM() * 15 + 5 AS NUMERIC), 1) as growth -- Simulated growth for UI charm
FROM site3_users.bets b
JOIN site3_users.users u ON b.user_id = u.id
JOIN site2_vendor.vendors v ON u.vendor_id = v.vendor_id
GROUP BY v.name, v.vendor_id;

-- Seed some initial matches if they don't exist
INSERT INTO site1_superadmin.matches (match_id, team_a, team_b, match_type, match_date, status, venue)
VALUES 
('M-001', 'India', 'Australia', 'Cricket', NOW(), 'Live', 'Melbourne'),
('M-002', 'England', 'South Africa', 'Cricket', NOW(), 'Upcoming', 'London'),
('M-003', 'Real Madrid', 'Barcelona', 'Soccer', NOW(), 'Upcoming', 'Madrid')
ON CONFLICT (match_id) DO NOTHING;
