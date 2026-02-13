import express from 'express';
import { cricketQuery } from '../config/cricket_db.js';

const router = express.Router();

/**
 * ============================================
 * GET VENDOR COMPLETE DETAILS
 * ============================================
 * Returns vendor info, stats, and transaction history
 */
router.get('/vendors/:id/details', async (req, res) => {
    try {
        const vendorId = req.params.id;

        // Get vendor basic info
        const vendorResult = await cricketQuery(
            `SELECT 
                id, vendor_id, name, email, phone, 
                credit_limit, used_credit, commission_rate, 
                status, created_at, last_login
            FROM vendors 
            WHERE id = $1`,
            [vendorId],
            'site2_vendor'
        );

        if (vendorResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        const vendor = vendorResult.rows[0];

        // Get vendor statistics
        const statsResult = await cricketQuery(
            `SELECT 
                COUNT(DISTINCT u.id) as total_users,
                COUNT(DISTINCT CASE WHEN u.role = 'User' THEN u.id END) as member_users,
                COUNT(DISTINCT CASE WHEN u.role = 'Master' THEN u.id END) as master_users,
                COUNT(DISTINCT CASE WHEN u.role = 'Agent' THEN u.id END) as agent_users,
                COUNT(DISTINCT CASE WHEN u.status = 'Active' THEN u.id END) as active_users,
                COUNT(DISTINCT CASE WHEN u.status = 'Blocked' THEN u.id END) as blocked_users,
                COALESCE(SUM(u.balance), 0) as total_funds_distributed
            FROM site3_users.users u
            WHERE u.vendor_id = $1`,
            [vendor.vendor_id],
            'site3_users'
        );

        const stats = statsResult.rows[0];

        // Get recent transactions (last 50)
        const transactionsResult = await cricketQuery(
            `SELECT 
                id, transaction_id, transaction_type, amount,
                balance_before, balance_after, description,
                reference_id, reference_name, created_by, created_at
            FROM vendor_transactions
            WHERE vendor_id = $1
            ORDER BY created_at DESC
            LIMIT 50`,
            [vendor.vendor_id],
            'site2_vendor'
        );

        // Calculate available credit
        const availableCredit = parseFloat(vendor.credit_limit) - parseFloat(vendor.used_credit);

        res.json({
            success: true,
            vendor: {
                ...vendor,
                credit_limit: parseFloat(vendor.credit_limit),
                used_credit: parseFloat(vendor.used_credit),
                available_credit: availableCredit,
                commission_rate: parseFloat(vendor.commission_rate)
            },
            stats: {
                totalUsers: parseInt(stats.total_users),
                masterUsers: parseInt(stats.master_users),
                agentUsers: parseInt(stats.agent_users),
                memberUsers: parseInt(stats.member_users),
                activeUsers: parseInt(stats.active_users),
                blockedUsers: parseInt(stats.blocked_users),
                totalFundsDistributed: parseFloat(stats.total_funds_distributed)
            },
            transactions: transactionsResult.rows.map(t => ({
                ...t,
                amount: parseFloat(t.amount),
                balance_before: parseFloat(t.balance_before),
                balance_after: parseFloat(t.balance_after)
            }))
        });
    } catch (error: any) {
        console.error('Get vendor details error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * ============================================
 * ADD FUNDS TO VENDOR
 * ============================================
 * Admin adds funds to vendor's credit limit
 */
router.post('/vendors/:id/add-funds', async (req, res) => {
    try {
        const vendorId = req.params.id;
        const { amount, admin_username, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid amount is required'
            });
        }

        // Get vendor
        const vendorResult = await cricketQuery(
            `SELECT * FROM vendors WHERE id = $1`,
            [vendorId],
            'site2_vendor'
        );

        if (vendorResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        const vendor = vendorResult.rows[0];
        const currentLimit = parseFloat(vendor.credit_limit);
        const newLimit = currentLimit + parseFloat(amount);

        // Generate transaction ID
        const transactionId = `VT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const allocationId = `ALLOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Update vendor credit limit
        await cricketQuery(
            `UPDATE vendors 
            SET credit_limit = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2`,
            [newLimit, vendorId],
            'site2_vendor'
        );

        // Create vendor transaction record
        await cricketQuery(
            `INSERT INTO vendor_transactions 
            (transaction_id, vendor_id, transaction_type, amount, 
             balance_before, balance_after, description, 
             reference_id, reference_name, created_by)
            VALUES ($1, $2, 'credit_from_admin', $3, $4, $5, $6, $7, $8, $9)`,
            [
                transactionId,
                vendor.vendor_id,
                amount,
                currentLimit,
                newLimit,
                description || 'Fund allocation from admin',
                'ADMIN-001',
                admin_username || 'superadmin',
                admin_username || 'superadmin'
            ],
            'site2_vendor'
        );

        // Create admin allocation record
        await cricketQuery(
            `INSERT INTO admin_fund_allocations 
            (allocation_id, allocation_type, recipient_type, recipient_id, 
             recipient_name, amount, description, allocated_by)
            VALUES ($1, 'to_vendor', 'vendor', $2, $3, $4, $5, $6)`,
            [
                allocationId,
                vendor.vendor_id,
                vendor.name,
                amount,
                description || 'Fund allocation to vendor',
                admin_username || 'superadmin'
            ],
            'site1_superadmin'
        );

        res.json({
            success: true,
            message: 'Funds added successfully',
            newCreditLimit: newLimit,
            transaction: {
                transaction_id: transactionId,
                amount: parseFloat(amount),
                previous_limit: currentLimit,
                new_limit: newLimit
            }
        });
    } catch (error: any) {
        console.error('Add funds error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * ============================================
 * GET VENDOR TRANSACTIONS
 * ============================================
 * Paginated transaction history
 */
router.get('/vendors/:id/transactions', async (req, res) => {
    try {
        const vendorId = req.params.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = (page - 1) * limit;

        // Get vendor_id from id
        const vendorResult = await cricketQuery(
            `SELECT vendor_id FROM vendors WHERE id = $1`,
            [vendorId],
            'site2_vendor'
        );

        if (vendorResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        const vendor_id = vendorResult.rows[0].vendor_id;

        // Get transactions
        const result = await cricketQuery(
            `SELECT 
                id, transaction_id, transaction_type, amount,
                balance_before, balance_after, description,
                reference_id, reference_name, created_by, created_at
            FROM vendor_transactions
            WHERE vendor_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3`,
            [vendor_id, limit, offset],
            'site2_vendor'
        );

        // Get total count
        const countResult = await cricketQuery(
            `SELECT COUNT(*) as total FROM vendor_transactions WHERE vendor_id = $1`,
            [vendor_id],
            'site2_vendor'
        );

        const totalTransactions = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalTransactions / limit);

        res.json({
            success: true,
            transactions: result.rows.map(t => ({
                ...t,
                amount: parseFloat(t.amount),
                balance_before: parseFloat(t.balance_before),
                balance_after: parseFloat(t.balance_after)
            })),
            pagination: {
                currentPage: page,
                totalPages,
                totalTransactions,
                limit
            }
        });
    } catch (error: any) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * ============================================
 * GET VENDOR PASSWORD
 * ============================================
 * Get vendor password (admin only)
 */
router.get('/vendors/:id/credentials', async (req, res) => {
    try {
        const vendorId = req.params.id;

        const result = await cricketQuery(
            `SELECT vendor_id, password_hash FROM vendors WHERE id = $1`,
            [vendorId],
            'site2_vendor'
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        // In production, you'd decrypt or fetch from secure storage
        // For now, return a placeholder since we're storing hashed passwords
        res.json({
            success: true,
            vendor_id: result.rows[0].vendor_id,
            note: 'Password is hashed. Original password was set during creation.'
        });
    } catch (error: any) {
        console.error('Get credentials error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
