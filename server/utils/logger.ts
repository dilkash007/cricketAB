
import { cricketPool as pool } from '../config/cricket_db.js';

/**
 * Record a forensic audit log
 * @param {Object} params 
 * @param {string} params.action - e.g., 'Vendor Created'
 * @param {string} params.category - 'Security', 'Finance', 'Vendor', 'System'
 * @param {string} params.details - Human readable description
 * @param {string} params.adminId - ID of the performing admin
 * @param {string} params.adminName - Name of the performing admin
 * @param {string} params.sqlTrace - The raw SQL executed (optional)
 * @param {Object} params.prevState - JSON before mutation (optional)
 * @param {Object} params.newState - JSON after mutation (optional)
 * @param {Object} params.req - Express request object for IP/UserAgent (optional)
 */
export async function recordAuditLog({
    action,
    category,
    details,
    adminId = 'ADM-001',
    adminName = 'Super Admin',
    sqlTrace = '',
    prevState = {},
    newState = {},
    req = null
}) {
    try {
        const securityToken = `TRC-${Math.floor(Math.random() * 9000 + 1000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
        const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : '127.0.0.1';
        const userAgent = req ? req.headers['user-agent'] : 'System-Trigger';

        await pool.query(
            `INSERT INTO site1_superadmin.audit_logs 
            (security_token, admin_id, admin_name, action, category, details, ip_address, user_agent, sql_query, prev_state, new_state)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [securityToken, adminId, adminName, action, category, details, ip, userAgent, sqlTrace, JSON.stringify(prevState), JSON.stringify(newState)]
        );
        console.log(`[AUDIT] Recorded: ${action} by ${adminName}`);
    } catch (err) {
        console.error('[AUDIT ERROR]', err);
    }
}
