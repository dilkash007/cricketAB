import express from 'express';
import { cricketPool as pool } from '../config/cricket_db.js';
import { recordAuditLog } from '../utils/logger.js';

const router = express.Router();

// GET Financial Statistics for Financial Command page
router.get('/financial-stats', async (req, res) => {
  console.log('--- FETCHING FINANCIAL STATS ---');
  try {
    // Query 1: Total Admin Allocations to Vendors
    const allocResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total_allocated
      FROM site1_superadmin.admin_fund_allocations
      WHERE allocation_type = 'to_vendor'
    `);
    console.log('Allocations:', allocResult.rows[0].total_allocated);

    // Query 2: Total Vendor Credits
    const vendorResult = await pool.query(`
      SELECT 
        COALESCE(SUM(credit_limit), 0) as total_limits,
        COALESCE(SUM(used_credit), 0) as total_used,
        COUNT(*) FILTER (WHERE status = 'Active') as active_vendors
      FROM site2_vendor.vendors
    `);

    // Query 3: Total User Balances & Exposure
    const userResult = await pool.query(`
      SELECT 
        COALESCE(SUM(balance), 0) as total_balance,
        COALESCE(SUM(exposure), 0) as total_exposure,
        COUNT(*) FILTER (WHERE status = 'Active') as active_users
      FROM site3_users.users
    `);

    // Query 4: Pending Withdrawals
    const withdrawalResult = await pool.query(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM site1_superadmin.withdrawal_queue
      WHERE status = 'pending'
    `);

    // Query 5: Daily Transaction Volume (last 24 hours)
    const dailyVolumeResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as daily_volume
      FROM site3_users.user_transactions
      WHERE transaction_type = 'bet_placed'
        AND created_at >= NOW() - INTERVAL '24 hours'
    `);

    // Query 6: Unpaid Commissions
    const commissionsResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as unpaid_commissions
      FROM site2_vendor.vendor_transactions
      WHERE transaction_type = 'commission_earned'
        AND created_at >= DATE_TRUNC('month', NOW())
    `);

    const totalAllocated = parseFloat(allocResult.rows[0].total_allocated);
    const totalVendorLimits = parseFloat(vendorResult.rows[0].total_limits);
    const totalVendorUsed = parseFloat(vendorResult.rows[0].total_used);
    const totalUserBalance = parseFloat(userResult.rows[0].total_balance);
    const totalUserExposure = parseFloat(userResult.rows[0].total_exposure);
    const activeVendors = parseInt(vendorResult.rows[0].active_vendors);
    const activeUsers = parseInt(userResult.rows[0].active_users);
    const pendingWithdrawalsCount = parseInt(withdrawalResult.rows[0].count);
    const pendingWithdrawalsAmount = parseFloat(withdrawalResult.rows[0].total_amount);
    const dailyVolume = parseFloat(dailyVolumeResult.rows[0].daily_volume);
    const unpaidCommissions = parseFloat(commissionsResult.rows[0].unpaid_commissions);

    // Calculate Total System Exposure
    // Total Liquidity = Vendor Used Credit + User Total Exposure
    const totalLiquidity = totalVendorUsed + totalUserExposure;

    // Reserve Cluster = Total Allocated - Total Used
    const reserveCluster = totalAllocated - totalVendorUsed;

    // User Liability = Total User Balance
    const userLiability = totalUserBalance;

    res.json({
      success: true,
      data: {
        // Main hero card
        totalLiquidity,
        reserveCluster,
        userLiability,

        // Mini cards
        pendingWithdrawals: pendingWithdrawalsAmount,
        pendingWithdrawalsCount,
        dailyVolume,
        unpaidCommissions,

        // System stats
        totalAllocated,
        totalVendorLimits,
        totalVendorUsed,
        totalUserBalance,
        totalUserExposure,
        activeVendors,
        activeUsers
      }
    });

  } catch (error) {
    console.error('Error fetching financial stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch financial statistics'
    });
  }
});

// GET Withdrawal Requests (for Withdrawal Queue table)
router.get('/withdrawal-queue', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        w.id,
        w.withdrawal_id as "withdrawalId",
        w.user_id as "userId",
        w.username,
        w.vendor_id as "vendorId",
        v.name as "vendorName",
        w.amount,
        w.risk_protocol as "riskScore",
        w.requested_at as timestamp,
        w.status
      FROM site1_superadmin.withdrawal_queue w
      LEFT JOIN site2_vendor.vendors v ON w.vendor_id = v.vendor_id
      WHERE w.status = 'pending'
      ORDER BY w.requested_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching withdrawal queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch withdrawal queue'
    });
  }
});

// GET Master Ledger (for Master Ledger table)
router.get('/master-ledger', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        ledger_id as "ledgerId",
        transaction_type as type,
        from_entity_id as "refId",
        amount,
        created_by as admin,
        transaction_date as timestamp
      FROM site1_superadmin.master_ledger
      ORDER BY transaction_date DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching master ledger:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch master ledger'
    });
  }
});

// POST Approve Withdrawal
router.post('/withdrawal-queue/:id/approve', async (req, res) => {
  const { id } = req.params;

  try {
    // Update withdrawal status
    const result = await pool.query(`
      UPDATE site1_superadmin.withdrawal_queue
      SET 
        status = 'approved',
        approved_by = 'admin',
        approved_at = NOW(),
        processed_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    const approvedWithdrawal = result.rows[0];

    // RECORD AUDIT LOG
    await recordAuditLog({
      action: 'Withdrawal Approved',
      category: 'Finance',
      details: `Admin approved withdrawal of ₹${approvedWithdrawal?.amount} for user ${approvedWithdrawal?.username}`,
      sqlTrace: `UPDATE withdrawal_queue SET status = 'approved' WHERE id = ${id}`,
      newState: approvedWithdrawal,
      req
    });

    res.json({
      success: true,
      message: 'Withdrawal approved successfully'
    });

  } catch (error) {
    console.error('Error approving withdrawal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve withdrawal'
    });
  }
});

export default router;
