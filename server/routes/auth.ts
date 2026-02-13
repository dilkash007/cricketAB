import express from 'express';
import { cricketQuery } from '../config/cricket_db.js';
import { hashPassword, comparePassword, generateToken, validatePassword } from '../utils/auth.js';

const router = express.Router();

/**
 * ============================================
 * ADMIN VERIFICATION
 * ============================================
 * Verify admin password before creating vendor/user
 */
router.post('/admin/verify', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Get admin from database
        const result = await cricketQuery(
            `SELECT * FROM admins WHERE username = $1 AND status = 'Active'`,
            [username],
            'site1_superadmin'
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const admin = result.rows[0];

        // Compare password
        const isValid = await comparePassword(password, admin.password_hash);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate verification token (short-lived, 5 minutes)
        const token = generateToken({
            admin_id: admin.admin_id,
            username: admin.username,
            role: admin.role,
            type: 'admin_verification'
        });

        res.json({
            success: true,
            verified: true,
            token,
            message: 'Admin verified successfully'
        });
    } catch (error: any) {
        console.error('Admin verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Verification failed'
        });
    }
});

/**
 * ============================================
 * VENDOR LOGIN
 * ============================================
 */
router.post('/vendor/login', async (req, res) => {
    try {
        const { vendor_id, password } = req.body;

        if (!vendor_id || !password) {
            return res.status(400).json({
                success: false,
                error: 'Vendor ID and password are required'
            });
        }

        // Get vendor from database
        const result = await cricketQuery(
            `SELECT * FROM vendors WHERE vendor_id = $1 AND status = 'Active'`,
            [vendor_id],
            'site2_vendor'
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const vendor = result.rows[0];

        // Check if password is set
        if (!vendor.password_hash) {
            return res.status(400).json({
                success: false,
                error: 'Password not set for this vendor. Please contact admin.'
            });
        }

        // Compare password
        const isValid = await comparePassword(password, vendor.password_hash);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Update last login
        await cricketQuery(
            `UPDATE vendors SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
            [vendor.id],
            'site2_vendor'
        );

        // Generate token
        const token = generateToken({
            vendor_id: vendor.vendor_id,
            id: vendor.id,
            name: vendor.name,
            type: 'vendor'
        });

        res.json({
            success: true,
            token,
            vendor: {
                id: vendor.id,
                vendor_id: vendor.vendor_id,
                name: vendor.name,
                email: vendor.email,
                credit_limit: vendor.credit_limit,
                used_credit: vendor.used_credit
            }
        });
    } catch (error: any) {
        console.error('Vendor login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

/**
 * ============================================
 * USER LOGIN
 * ============================================
 */
router.post('/user/login', async (req, res) => {
    try {
        const { user_id, password } = req.body;

        if (!user_id || !password) {
            return res.status(400).json({
                success: false,
                error: 'User ID and password are required'
            });
        }

        // Get user from database
        const result = await cricketQuery(
            `SELECT * FROM users WHERE user_id = $1 AND status = 'Active'`,
            [user_id],
            'site3_users'
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const user = result.rows[0];

        // Check if password is set
        if (!user.password_hash) {
            return res.status(400).json({
                success: false,
                error: 'Password not set for this user. Please contact admin.'
            });
        }

        // Compare password
        const isValid = await comparePassword(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Update last login
        await cricketQuery(
            `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
            [user.id],
            'site3_users'
        );

        // Generate token
        const token = generateToken({
            user_id: user.user_id,
            id: user.id,
            username: user.username,
            type: 'user'
        });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                user_id: user.user_id,
                username: user.username,
                balance: user.balance,
                exposure: user.exposure
            }
        });
    } catch (error: any) {
        console.error('User login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

/**
 * ============================================
 * ADMIN LOGIN
 * ============================================
 */
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Get admin from database
        const result = await cricketQuery(
            `SELECT * FROM admins WHERE username = $1 AND status = 'Active'`,
            [username],
            'site1_superadmin'
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const admin = result.rows[0];

        // Compare password
        const isValid = await comparePassword(password, admin.password_hash);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Update last login
        await cricketQuery(
            `UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
            [admin.id],
            'site1_superadmin'
        );

        // Generate token
        const token = generateToken({
            admin_id: admin.admin_id,
            id: admin.id,
            username: admin.username,
            role: admin.role,
            type: 'admin'
        });

        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                admin_id: admin.admin_id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error: any) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

export default router;
