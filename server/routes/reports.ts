
import express from 'express';
import { cricketPool as pool } from '../config/cricket_db.js';

const router = express.Router();

/**
 * GET Reporting KPIs
 * - Gross Turnover
 * - GGR
 * - Yield Margin
 */
router.get('/kpis', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        COALESCE(SUM(stake), 0) as "grossTurnover",
        COALESCE(SUM(CASE WHEN status = 'settled' AND result = 'lost' THEN stake 
                          WHEN status = 'settled' AND result = 'won' THEN (stake - potential_win)
                          ELSE 0 END), 0) as ggr
      FROM site3_users.bets
    `);

        const { grossTurnover, ggr } = result.rows[0];

        // Convert to strings first to handle PG numeric/bigint returns
        const gtStr = (grossTurnover || 0).toString();
        const ggrStr = (ggr || 0).toString();

        const gt = parseFloat(gtStr);
        const ggrValue = parseFloat(ggrStr);
        const marginStr = gt > 0 ? ((ggrValue / gt) * 100).toFixed(1) : "0";

        res.json({
            success: true,
            data: {
                grossTurnover: gt,
                ggr: ggrValue,
                margin: parseFloat(marginStr),
                retention: 84.2
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET Revenue Analytics
 * - Volume vs Profit over time
 */
router.get('/revenue-analytics', async (req, res) => {
    const { range } = req.query;
    // Range filtering logic can be added here
    try {
        const result = await pool.query(`
      SELECT 
        TO_CHAR(date, 'DD Mon') as date,
        volume,
        profit
      FROM site1_superadmin.daily_revenue_analytics
      LIMIT 7
    `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET Sport Performance
 * - Market distribution
 */
router.get('/sport-performance', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        name,
        percentage as value,
        CASE WHEN name = 'Cricket' THEN '#6366f1'
             WHEN name = 'Soccer' THEN '#10b981'
             ELSE '#f59e0b' END as color
      FROM site1_superadmin.sport_performance_summary
    `);

        res.json({
            success: true,
            data: result.rows.length > 0 ? result.rows : [
                { name: 'Cricket', value: 100, color: '#6366f1' }
            ]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET Activity Heatmap
 * - Bets per hour for the last 24h/overall
 */
router.get('/heatmap', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM site3_users.bets
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC
    `);

        // Fill all 24 hours
        const fullHeatmap = Array.from({ length: 24 }, (_, i) => {
            const found = result.rows.find(r => parseInt(r.hour) === i);
            return {
                hour: i,
                count: found ? parseInt(found.count) : 0
            };
        });

        res.json({
            success: true,
            data: fullHeatmap
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET Vendor Leaderboard
 */
router.get('/vendor-leaderboard', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT name, volume, users, growth
      FROM site1_superadmin.vendor_profitability_leaderboard
      ORDER BY volume DESC
    `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
