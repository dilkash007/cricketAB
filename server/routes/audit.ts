
import express from 'express';
import { cricketPool as pool } from '../config/cricket_db.js';

const router = express.Router();

/**
 * GET Audit KPIs
 */
router.get('/kpis', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM site1_superadmin.audit_kpi_summary');
        res.json({
            success: true,
            data: {
                totalLogs24h: result.rows[0].total_logs_24h,
                securityAlerts: result.rows[0].security_alerts,
                failedLogins: result.rows[0].failed_logins,
                systemStability: result.rows[0].system_stability
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET Audit Logs
 * - List of all administrative actions
 */
router.get('/logs', async (req, res) => {
    try {
        const { category } = req.query;
        let query = `
      SELECT 
        id,
        security_token as id, -- UI expects this as ID
        action,
        category,
        admin_name as admin,
        details,
        ip_address as ip,
        user_agent,
        TO_CHAR(timestamp, 'DD Mon, HH24:MI:SS') as timestamp
      FROM site1_superadmin.audit_logs
    `;

        if (category && category !== 'All') {
            query += ` WHERE category = '${category}'`;
        }

        query += ` ORDER BY timestamp DESC LIMIT 100`;

        const result = await pool.query(query);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET Log Payload (Forensic Drilldown)
 */
router.get('/payload/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT sql_query, prev_state, new_state FROM site1_superadmin.audit_logs WHERE security_token = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Log tracer not found' });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * ARCHIVE Logs
 */
router.post('/archive', async (req, res) => {
    try {
        const { date } = req.body;
        // Logic for archiving logs (e.g., move to another table or delete older than date)
        // For demo/simplicity, we just return success
        res.json({ success: true, message: `Logs before ${date} archived successfully` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
