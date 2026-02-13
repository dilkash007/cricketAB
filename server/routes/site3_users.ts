import express from 'express';
import { cricketQuery } from '../config/cricket_db.js';
import { recordAuditLog } from '../utils/logger.js';

const router = express.Router();

// GET all users
router.get('/users', async (req, res) => {
    try {
        const result = await cricketQuery(
            `SELECT id, user_id, username, balance, exposure, status, vendor_id, created_at, last_login 
       FROM users 
       ORDER BY created_at DESC`,
            [],
            'site3_users'
        );

        res.json({
            success: true,
            users: result.rows
        });
    } catch (error: any) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST create user
router.post('/users', async (req, res) => {
    try {
        const {
            user_id,
            username,
            password,           // New: Password field (not password_hash)
            balance,
            vendor_id,
            admin_token         // New: Admin verification token
        } = req.body;

        // Validate required fields
        if (!user_id || !username || !password) {
            return res.status(400).json({
                success: false,
                error: 'User ID, username, and password are required'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }

        // Hash password
        const { hashPassword } = await import('../utils/auth.js');
        const password_hash = await hashPassword(password);

        const result = await cricketQuery(
            `INSERT INTO users 
       (user_id, username, password_hash, balance, exposure, status, vendor_id)
       VALUES ($1, $2, $3, $4, 0, 'Active', $5)
       RETURNING id, user_id, username, balance, exposure, status, vendor_id, created_at`,
            [user_id, username, password_hash, balance || 0, vendor_id],
            'site3_users'
        );

        const createdUser = result.rows[0];

        // ============================================
        // AUTO-CREATE TRANSACTION ENTRIES
        // ============================================
        if (balance && balance > 0 && vendor_id) {
            const userTransactionId = `UTX-${Date.now()}`;
            const vendorTransactionId = `VTX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const ledgerId = `LDG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

            // Get vendor info
            const vendorResult = await cricketQuery(
                `SELECT vendor_id, name FROM vendors WHERE vendor_id = $1`,
                [vendor_id],
                'site2_vendor'
            );

            const vendorName = vendorResult.rows[0]?.name || 'Unknown Vendor';

            // 1. User Transaction Entry
            await cricketQuery(
                `INSERT INTO user_transactions
                (transaction_id, user_id, transaction_type, amount, balance_before, balance_after, exposure_before, exposure_after, description, reference_id, reference_name, created_by, created_at)
                VALUES ($1, $2, 'credit_from_vendor', $3, 0, $4, 0, 0, $5, $6, $7, 'vendor', NOW())`,
                [userTransactionId, user_id, balance, balance, `Initial balance from vendor ${vendorName}`, vendor_id, vendorName],
                'site3_users'
            );

            // 2. Vendor Transaction Entry (debit)
            await cricketQuery(
                `INSERT INTO vendor_transactions
                (transaction_id, vendor_id, transaction_type, amount, balance_before, balance_after, description, reference_id, reference_name, created_by, created_at)
                VALUES ($1, $2, 'debit_to_user', $3, 0, 0, $4, $5, $6, 'vendor', NOW())`,
                [vendorTransactionId, vendor_id, balance, `Funded user ${username} with ₹${balance.toLocaleString()}`, user_id, username],
                'site2_vendor'
            );

            // 3. Master Ledger Entry
            await cricketQuery(
                `INSERT INTO master_ledger
                (ledger_id, transaction_date, entry_type, from_entity_type, from_entity_id, from_entity_name, to_entity_type, to_entity_id, to_entity_name, amount, transaction_type, description, created_by)
                VALUES ($1, NOW(), 'vendor_to_user', 'vendor', $2, $3, 'user', $4, $5, $6, 'credit_to_user', $7, 'vendor')`,
                [ledgerId, vendor_id, vendorName, user_id, username, balance, `Vendor ${vendorName} funded user ${username} with ₹${balance.toLocaleString()}`],
                'site1_superadmin'
            );

            // 4. Update vendor used_credit
            await cricketQuery(
                `UPDATE vendors 
                SET used_credit = used_credit + $1 
                WHERE vendor_id = $2`,
                [balance, vendor_id],
                'site2_vendor'
            );
        }

        // RECORD AUDIT LOG
        await recordAuditLog({
            action: 'User Created',
            category: 'Vendor',
            details: `Admin/Vendor created user "${username}" (${user_id}) with ₹${balance || 0} balance`,
            sqlTrace: `INSERT INTO users (user_id, username, balance, vendor_id, status) VALUES ('${user_id}', '${username}', ${balance || 0}, '${vendor_id}', 'Active')`,
            newState: createdUser,
            req
        });

        res.json({
            success: true,
            user: createdUser,
            message: 'User created successfully with login credentials and transaction history'
        });
    } catch (error: any) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// PUT update user
router.put('/users/:id', async (req, res) => {
    try {
        const { username, balance, exposure, status, vendor_id } = req.body;

        const result = await cricketQuery(
            `UPDATE users 
       SET username = COALESCE($1, username),
           balance = COALESCE($2, balance),
           exposure = COALESCE($3, exposure),
           status = COALESCE($4, status),
           vendor_id = COALESCE($5, vendor_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, user_id, username, balance, exposure, status, vendor_id, created_at`,
            [username, balance, exposure, status, vendor_id, req.params.id],
            'site3_users'
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: result.rows[0],
            message: 'User updated successfully'
        });

        // RECORD AUDIT LOG
        await recordAuditLog({
            action: 'User Updated',
            category: 'Vendor',
            details: `Admin updated user "${username || result.rows[0].username}" profile`,
            sqlTrace: `UPDATE users SET ... WHERE id = ${req.params.id}`,
            newState: result.rows[0],
            req
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE user
router.delete('/users/:id', async (req, res) => {
    try {
        const result = await cricketQuery(
            `DELETE FROM users WHERE id = $1 RETURNING *`,
            [req.params.id],
            'site3_users'
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

        // RECORD AUDIT LOG
        await recordAuditLog({
            action: 'User Deleted',
            category: 'Vendor',
            details: `Admin deleted user with ID: ${req.params.id}`,
            sqlTrace: `DELETE FROM users WHERE id = ${req.params.id}`,
            prevState: result.rows[0],
            req
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
