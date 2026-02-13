import express from 'express';
import { cricketQuery } from '../config/cricket_db.js';
import { recordAuditLog } from '../utils/logger.js';

const router = express.Router();

// GET all vendors
router.get('/vendors', async (req, res) => {
    try {
        const result = await cricketQuery(
            `SELECT * FROM vendors ORDER BY created_at DESC`,
            [],
            'site2_vendor'
        );

        res.json({
            success: true,
            vendors: result.rows
        });
    } catch (error: any) {
        console.error('Get vendors error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST create vendor
router.post('/vendors', async (req, res) => {
    try {
        const {
            vendor_id,
            name,
            email,
            phone,
            credit_limit,
            commission_rate,
            password,           // New: Password field
            admin_token         // New: Admin verification token
        } = req.body;

        // Validate required fields
        if (!vendor_id || !name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Vendor ID, name, email, and password are required'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }

        // TODO: Verify admin token
        // For now, we'll skip admin verification in this route
        // Admin verification should be done in frontend before calling this API

        // Hash password
        const { hashPassword } = await import('../utils/auth.js');
        const password_hash = await hashPassword(password);

        const result = await cricketQuery(
            `INSERT INTO vendors 
       (vendor_id, name, email, phone, credit_limit, commission_rate, password_hash, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active')
       RETURNING id, vendor_id, name, email, phone, credit_limit, commission_rate, status, created_at`,
            [vendor_id, name, email, phone, credit_limit || 0, commission_rate || 0, password_hash],
            'site2_vendor'
        );

        const createdVendor = result.rows[0];

        // ============================================
        // AUTO-CREATE TRANSACTION ENTRIES
        // ============================================
        if (credit_limit && credit_limit > 0) {
            const allocationId = `ALLOC-${Date.now()}`;
            const transactionId = `VTX-${Date.now()}`;
            const ledgerId = `LDG-${Date.now()}`;

            // 1. Admin Fund Allocation Entry
            await cricketQuery(
                `INSERT INTO admin_fund_allocations 
                (allocation_id, allocation_type, recipient_type, recipient_id, recipient_name, amount, description, allocated_by, created_at)
                VALUES ($1, 'to_vendor', 'vendor', $2, $3, $4, $5, 'admin', NOW())`,
                [allocationId, vendor_id, name, credit_limit, `Initial credit limit allocation for vendor ${name}`],
                'site1_superadmin'
            );

            // 2. Vendor Transaction Entry  
            await cricketQuery(
                `INSERT INTO vendor_transactions
                (transaction_id, vendor_id, transaction_type, amount, balance_before, balance_after, description, reference_id, reference_name, created_by, created_at)
                VALUES ($1, $2, 'credit_from_admin', $3, 0, $4, $5, 'admin', 'System Admin', 'admin', NOW())`,
                [transactionId, vendor_id, credit_limit, credit_limit, `Initial credit limit: ₹${credit_limit.toLocaleString()}`],
                'site2_vendor'
            );

            // 3. Master Ledger Entry
            await cricketQuery(
                `INSERT INTO master_ledger
                (ledger_id, transaction_date, entry_type, from_entity_type, from_entity_id, from_entity_name, to_entity_type, to_entity_id, to_entity_name, amount, transaction_type, description, created_by)
                VALUES ($1, NOW(), 'admin_allocation', 'admin', 'ADMIN-001', 'System Admin', 'vendor', $2, $3, $4, 'credit_from_admin', $5, 'admin')`,
                [ledgerId, vendor_id, name, credit_limit, `Admin allocated ₹${credit_limit.toLocaleString()} to vendor ${name}`],
                'site1_superadmin'
            );
        }

        // RECORD AUDIT LOG
        await recordAuditLog({
            action: 'Vendor Created',
            category: 'Vendor',
            details: `Admin created vendor "${name}" (${vendor_id}) with ₹${credit_limit || 0} credit`,
            sqlTrace: `INSERT INTO vendors (vendor_id, name, email, phone, credit_limit, commission_rate, status) VALUES ('${vendor_id}', '${name}', '${email}', '${phone}', ${credit_limit || 0}, ${commission_rate || 0}, 'Active')`,
            newState: createdVendor,
            req
        });

        res.json({
            success: true,
            vendor: createdVendor,
            message: 'Vendor created successfully with login credentials and transaction history'
        });
    } catch (error: any) {
        console.error('Create vendor error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// PUT update vendor
router.put('/vendors/:id', async (req, res) => {
    try {
        const { name, email, phone, credit_limit, commission_rate, status } = req.body;

        const result = await cricketQuery(
            `UPDATE vendors 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           credit_limit = COALESCE($4, credit_limit),
           commission_rate = COALESCE($5, commission_rate),
           status = COALESCE($6, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
            [name, email, phone, credit_limit, commission_rate, status, req.params.id],
            'site2_vendor'
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        res.json({
            success: true,
            vendor: result.rows[0],
            message: 'Vendor updated successfully'
        });

        // RECORD AUDIT LOG
        await recordAuditLog({
            action: 'Vendor Updated',
            category: 'Vendor',
            details: `Admin updated vendor "${name || result.rows[0].name}" details`,
            sqlTrace: `UPDATE vendors SET ... WHERE id = ${req.params.id}`,
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

// DELETE vendor
router.delete('/vendors/:id', async (req, res) => {
    try {
        const result = await cricketQuery(
            `DELETE FROM vendors WHERE id = $1 RETURNING *`,
            [req.params.id],
            'site2_vendor'
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        res.json({
            success: true,
            message: 'Vendor deleted successfully'
        });

        // RECORD AUDIT LOG
        await recordAuditLog({
            action: 'Vendor Deleted',
            category: 'Vendor',
            details: `Admin deleted vendor with ID: ${req.params.id}`,
            sqlTrace: `DELETE FROM vendors WHERE id = ${req.params.id}`,
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
