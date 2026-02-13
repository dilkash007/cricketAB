
import express from 'express';
import { cricketPool as pool } from '../config/cricket_db.js';
import { recordAuditLog } from '../utils/logger.js';

const router = express.Router();

/**
 * GET Risk KPIs
 * - Global Risk Score
 * - Flagged Users
 * - Blocked IPs
 * - Pending Triage
 */
router.get('/kpis', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM site1_superadmin.risk_kpi_summary');
        res.json({
            success: true,
            data: {
                globalRiskScore: result.rows[0].global_risk_score,
                flaggedUsers: result.rows[0].flagged_users,
                blockedIps: result.rows[0].blocked_ips,
                pendingTriage: result.rows[0].pending_triage
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET Risk Alerts Feed
 */
router.get('/alerts', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        alert_id as id,
        severity,
        type,
        reason,
        entity_type as "entityType",
        entity_id as "entityId",
        entity_name as "entityName",
        confidence,
        status,
        TO_CHAR(timestamp, 'DD Mon, HH24:MI') as timestamp
      FROM site1_superadmin.risk_alerts
      ORDER BY timestamp DESC
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
 * GET Risk Heuristics
 * - Breakdown of anomaly patterns
 */
router.get('/heuristics', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM site1_superadmin.risk_heuristics_summary');
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET Blacklisted IPs
 */
router.get('/blacklist', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        ip_address as ip,
        reason,
        TO_CHAR(blocked_at, 'HH24:MI') as time,
        TO_CHAR(blocked_at, 'DD/MM/YYYY') as date
      FROM site1_superadmin.ip_blacklist
      WHERE status = 'active'
      ORDER BY blocked_at DESC
      LIMIT 10
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
 * POST Resolve Alert
 */
router.post('/resolve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE site1_superadmin.risk_alerts SET status = 'resolved' WHERE alert_id = $1 RETURNING *",
            [id]
        );

        res.json({ success: true, message: 'Alert resolved' });

        await recordAuditLog({
            action: 'Risk Alert Resolved',
            category: 'Security',
            details: `Admin resolved risk alert: ${id}`,
            sqlTrace: `UPDATE risk_alerts SET status = 'resolved' WHERE alert_id = '${id}'`,
            newState: result.rows[0],
            req
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST Blacklist IP
 */
router.post('/blacklist', async (req, res) => {
    try {
        const { ip, reason } = req.body;
        const result = await pool.query(
            "INSERT INTO site1_superadmin.ip_blacklist (ip_address, reason) VALUES ($1, $2) ON CONFLICT (ip_address) DO UPDATE SET status = 'active', reason = $2 RETURNING *",
            [ip, reason]
        );

        res.json({ success: true, message: `IP ${ip} blacklisted` });

        await recordAuditLog({
            action: 'IP Blacklisted',
            category: 'Security',
            details: `Admin manually blacklisted IP: ${ip} for ${reason}`,
            sqlTrace: `INSERT INTO ip_blacklist (ip_address, reason) VALUES ('${ip}', '${reason}')`,
            newState: result.rows[0],
            req
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
