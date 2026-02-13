import express from 'express';
import { cricketQuery } from '../config/cricket_db.js';

const router = express.Router();

/**
 * GET /api/site1/finances/overview
 * Get complete financial overview with REAL database data
 */
router.get('/finances/overview', async (req, res) => {
    try {
        // Get REAL vendor data
        const vendorStats = await cricketQuery(
            `SELECT 
        COUNT(*) as total_vendors,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_vendors,
        COALESCE(SUM(credit_limit), 0) as total_credit_limit,
        COALESCE(SUM(used_credit), 0) as total_used_credit
      FROM vendors`,
            [],
            'site2_vendor'
        );

        // Get REAL user data
        const userStats = await cricketQuery(
            `SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_users,
        COALESCE(SUM(balance), 0) as total_user_balance,
        COALESCE(SUM(exposure), 0) as total_user_exposure
      FROM users`,
            [],
            'site3_users'
        );

        // Get match statistics
        const matchStats = await cricketQuery(
            `SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN status = 'Live' THEN 1 END) as live_matches
      FROM matches`,
            [],
            'site1_superadmin'
        );

        const vendorData = vendorStats.rows[0];
        const userData = userStats.rows[0];
        const matchData = matchStats.rows[0];

        // Calculate REAL values
        const totalUserBalance = parseFloat(userData.total_user_balance);
        const totalUserExposure = parseFloat(userData.total_user_exposure);
        const totalUserAvailable = totalUserBalance - totalUserExposure;

        const totalVendorCredit = parseFloat(vendorData.total_credit_limit);
        const totalVendorUsed = parseFloat(vendorData.total_used_credit);

        res.json({
            success: true,
            overview: {
                // Admin has unlimited money
                adminBalance: 'unlimited',

                // Real user data from database
                users: {
                    count: parseInt(userData.total_users),
                    activeCount: parseInt(userData.active_users),
                    totalBalance: totalUserBalance,
                    totalExposure: totalUserExposure,
                    availableBalance: totalUserAvailable
                },

                // Real vendor data from database
                vendors: {
                    count: parseInt(vendorData.total_vendors),
                    activeCount: parseInt(vendorData.active_vendors),
                    totalCreditLimit: totalVendorCredit,
                    usedCredit: totalVendorUsed
                },

                // Match stats
                matches: {
                    live: parseInt(matchData.live_matches),
                    total: parseInt(matchData.total_matches)
                },

                // System status
                systemStatus: totalUserExposure > 0 ? 'Active Bets' : 'Standby',
                systemHealth: 'Healthy'
            }
        });
    } catch (error: any) {
        console.error('Finances overview error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/site1/finances/transactions
 * Get recent transactions
 */
router.get('/finances/transactions', async (req, res) => {
    try {
        const mockTransactions = [
            {
                id: 1,
                type: 'withdrawal',
                player: 'testplayer1',
                amount: 2500.00,
                protocol: 'UPI',
                timestamp: new Date().toISOString(),
                status: 'pending'
            }
        ];

        res.json({
            success: true,
            transactions: mockTransactions
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/site1/finances/vendor-settlements
 * Get vendor settlement data
 */
router.get('/finances/vendor-settlements', async (req, res) => {
    try {
        const vendors = await cricketQuery(
            `SELECT 
        vendor_id,
        name,
        used_credit,
        commission_rate,
        status
      FROM vendors
      WHERE used_credit > 0
      ORDER BY used_credit DESC`,
            [],
            'site2_vendor'
        );

        const settlements = vendors.rows.map(v => ({
            vendor: v.name,
            amount: parseFloat(v.used_credit),
            commission: (parseFloat(v.used_credit) * parseFloat(v.commission_rate) / 100).toFixed(2),
            status: v.status
        }));

        res.json({
            success: true,
            settlements
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET all matches
router.get('/matches', async (req, res) => {
    try {
        const result = await cricketQuery(
            `SELECT * FROM matches ORDER BY match_date DESC`,
            [],
            'site1_superadmin'
        );

        res.json({
            success: true,
            matches: result.rows
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST create match
router.post('/matches', async (req, res) => {
    try {
        const { match_id, team_a, team_b, match_type, match_date, venue } = req.body;

        const result = await cricketQuery(
            `INSERT INTO matches 
       (match_id, team_a, team_b, match_type, match_date, venue, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Upcoming')
       RETURNING *`,
            [match_id, team_a, team_b, match_type, match_date, venue],
            'site1_superadmin'
        );

        res.json({
            success: true,
            match: result.rows[0]
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
