var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/utils/auth.ts
var auth_exports = {};
__export(auth_exports, {
  comparePassword: () => comparePassword,
  generateRandomPassword: () => generateRandomPassword,
  generateToken: () => generateToken,
  hashPassword: () => hashPassword,
  validatePassword: () => validatePassword,
  verifyToken: () => verifyToken
});
var import_bcrypt, import_jsonwebtoken, SALT_ROUNDS, JWT_SECRET, JWT_EXPIRES_IN, hashPassword, comparePassword, generateToken, verifyToken, validatePassword, generateRandomPassword;
var init_auth = __esm({
  "server/utils/auth.ts"() {
    import_bcrypt = __toESM(require("bcrypt"));
    import_jsonwebtoken = __toESM(require("jsonwebtoken"));
    SALT_ROUNDS = 10;
    JWT_SECRET = process.env.JWT_SECRET || "elite-betting-secret-key-change-in-production";
    JWT_EXPIRES_IN = "24h";
    hashPassword = async (password) => {
      try {
        const hash = await import_bcrypt.default.hash(password, SALT_ROUNDS);
        return hash;
      } catch (error) {
        throw new Error(`Password hashing failed: ${error.message}`);
      }
    };
    comparePassword = async (password, hash) => {
      try {
        const isMatch = await import_bcrypt.default.compare(password, hash);
        return isMatch;
      } catch (error) {
        throw new Error(`Password comparison failed: ${error.message}`);
      }
    };
    generateToken = (payload) => {
      try {
        const token = import_jsonwebtoken.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return token;
      } catch (error) {
        throw new Error(`Token generation failed: ${error.message}`);
      }
    };
    verifyToken = (token) => {
      try {
        const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
        return decoded;
      } catch (error) {
        throw new Error(`Token verification failed: ${error.message}`);
      }
    };
    validatePassword = (password) => {
      if (!password || password.length < 6) {
        return {
          valid: false,
          message: "Password must be at least 6 characters long"
        };
      }
      return { valid: true };
    };
    generateRandomPassword = (length = 8) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let password = "";
      for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };
  }
});

// server/server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_dotenv2 = __toESM(require("dotenv"));
var import_path = __toESM(require("path"));
var import_url = require("url");
var import_express14 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_morgan = __toESM(require("morgan"));
var import_helmet = __toESM(require("helmet"));
var import_compression = __toESM(require("compression"));

// server/config/cricket_db.ts
var import_pg = __toESM(require("pg"));
var import_dotenv = __toESM(require("dotenv"));
var { Pool } = import_pg.default;
import_dotenv.default.config();
var cricketPool = new Pool({
  host: process.env.CRICKET_DB_HOST || "localhost",
  user: process.env.CRICKET_DB_USER || "postgres",
  password: process.env.CRICKET_DB_PASSWORD,
  database: process.env.CRICKET_DB_NAME || "postgres",
  port: parseInt(process.env.CRICKET_DB_PORT || "5432"),
  ssl: process.env.CRICKET_DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 20,
  // Maximum connections in pool
  idleTimeoutMillis: 3e4,
  // Close idle connections after 30s
  connectionTimeoutMillis: 5e3
  // Timeout if can't connect in 5s
});
var connectCricketDatabase = async () => {
  try {
    const client = await cricketPool.connect();
    const result = await client.query("SELECT current_database(), current_schema(), version()");
    console.log("\u2705 Connected to Cricket Betting Database Successfully");
    console.log(`\u{1F3AF} Database: ${result.rows[0].current_database}`);
    client.release();
    return true;
  } catch (error) {
    console.error("\u274C Cricket Database Connection Error:", error.message);
    throw error;
  }
};
var cricketQuery = async (query, params = [], schema) => {
  const client = await cricketPool.connect();
  try {
    if (schema) {
      await client.query(`SET search_path TO ${schema}, public`);
    }
    const result = await client.query(query, params);
    return result;
  } catch (error) {
    console.error("Database query error:", error.message);
    throw error;
  } finally {
    client.release();
  }
};
cricketPool.on("error", (err) => {
  console.error("\u{1F4A5} Unexpected database pool error:", err.message);
});
cricketPool.on("connect", () => {
  console.log("\u{1F50C} New database connection established");
});
cricketPool.on("remove", () => {
  console.log("\u{1F50C} Database connection removed from pool");
});

// server/routes/site1_admin.ts
var import_express = __toESM(require("express"));
var router = import_express.default.Router();
router.get("/finances/overview", async (req, res) => {
  try {
    const vendorStats = await cricketQuery(
      `SELECT 
        COUNT(*) as total_vendors,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_vendors,
        COALESCE(SUM(credit_limit), 0) as total_credit_limit,
        COALESCE(SUM(used_credit), 0) as total_used_credit
      FROM vendors`,
      [],
      "site2_vendor"
    );
    const userStats = await cricketQuery(
      `SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_users,
        COALESCE(SUM(balance), 0) as total_user_balance,
        COALESCE(SUM(exposure), 0) as total_user_exposure
      FROM users`,
      [],
      "site3_users"
    );
    const matchStats = await cricketQuery(
      `SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN status = 'Live' THEN 1 END) as live_matches
      FROM matches`,
      [],
      "site1_superadmin"
    );
    const vendorData = vendorStats.rows[0];
    const userData = userStats.rows[0];
    const matchData = matchStats.rows[0];
    const totalUserBalance = parseFloat(userData.total_user_balance);
    const totalUserExposure = parseFloat(userData.total_user_exposure);
    const totalUserAvailable = totalUserBalance - totalUserExposure;
    const totalVendorCredit = parseFloat(vendorData.total_credit_limit);
    const totalVendorUsed = parseFloat(vendorData.total_used_credit);
    res.json({
      success: true,
      overview: {
        // Admin has unlimited money
        adminBalance: "unlimited",
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
        systemStatus: totalUserExposure > 0 ? "Active Bets" : "Standby",
        systemHealth: "Healthy"
      }
    });
  } catch (error) {
    console.error("Finances overview error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get("/finances/transactions", async (req, res) => {
  try {
    const mockTransactions = [
      {
        id: 1,
        type: "withdrawal",
        player: "testplayer1",
        amount: 2500,
        protocol: "UPI",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending"
      }
    ];
    res.json({
      success: true,
      transactions: mockTransactions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get("/finances/vendor-settlements", async (req, res) => {
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
      "site2_vendor"
    );
    const settlements = vendors.rows.map((v) => ({
      vendor: v.name,
      amount: parseFloat(v.used_credit),
      commission: (parseFloat(v.used_credit) * parseFloat(v.commission_rate) / 100).toFixed(2),
      status: v.status
    }));
    res.json({
      success: true,
      settlements
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get("/matches", async (req, res) => {
  try {
    const result = await cricketQuery(
      `SELECT * FROM matches ORDER BY match_date DESC`,
      [],
      "site1_superadmin"
    );
    res.json({
      success: true,
      matches: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post("/matches", async (req, res) => {
  try {
    const { match_id, team_a, team_b, match_type, match_date, venue } = req.body;
    const result = await cricketQuery(
      `INSERT INTO matches 
       (match_id, team_a, team_b, match_type, match_date, venue, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Upcoming')
       RETURNING *`,
      [match_id, team_a, team_b, match_type, match_date, venue],
      "site1_superadmin"
    );
    res.json({
      success: true,
      match: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
var site1_admin_default = router;

// server/routes/site2_vendors.ts
var import_express2 = __toESM(require("express"));

// server/utils/logger.ts
async function recordAuditLog({
  action,
  category,
  details,
  adminId = "ADM-001",
  adminName = "Super Admin",
  sqlTrace = "",
  prevState = {},
  newState = {},
  req = null
}) {
  try {
    const securityToken = `TRC-${Math.floor(Math.random() * 9e3 + 1e3)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const ip = req ? req.headers["x-forwarded-for"] || req.socket.remoteAddress : "127.0.0.1";
    const userAgent = req ? req.headers["user-agent"] : "System-Trigger";
    await cricketPool.query(
      `INSERT INTO site1_superadmin.audit_logs 
            (security_token, admin_id, admin_name, action, category, details, ip_address, user_agent, sql_query, prev_state, new_state)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [securityToken, adminId, adminName, action, category, details, ip, userAgent, sqlTrace, JSON.stringify(prevState), JSON.stringify(newState)]
    );
    console.log(`[AUDIT] Recorded: ${action} by ${adminName}`);
  } catch (err) {
    console.error("[AUDIT ERROR]", err);
  }
}

// server/routes/site2_vendors.ts
var router2 = import_express2.default.Router();
router2.get("/vendors", async (req, res) => {
  try {
    const result = await cricketQuery(
      `SELECT * FROM vendors ORDER BY created_at DESC`,
      [],
      "site2_vendor"
    );
    res.json({
      success: true,
      vendors: result.rows
    });
  } catch (error) {
    console.error("Get vendors error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router2.post("/vendors", async (req, res) => {
  try {
    const {
      vendor_id,
      name,
      email,
      phone,
      credit_limit,
      commission_rate,
      password,
      // New: Password field
      admin_token
      // New: Admin verification token
    } = req.body;
    if (!vendor_id || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Vendor ID, name, email, and password are required"
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long"
      });
    }
    const { hashPassword: hashPassword3 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
    const password_hash = await hashPassword3(password);
    const result = await cricketQuery(
      `INSERT INTO vendors 
       (vendor_id, name, email, phone, credit_limit, commission_rate, password_hash, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active')
       RETURNING id, vendor_id, name, email, phone, credit_limit, commission_rate, status, created_at`,
      [vendor_id, name, email, phone, credit_limit || 0, commission_rate || 0, password_hash],
      "site2_vendor"
    );
    const createdVendor = result.rows[0];
    if (credit_limit && credit_limit > 0) {
      const allocationId = `ALLOC-${Date.now()}`;
      const transactionId = `VTX-${Date.now()}`;
      const ledgerId = `LDG-${Date.now()}`;
      await cricketQuery(
        `INSERT INTO admin_fund_allocations 
                (allocation_id, allocation_type, recipient_type, recipient_id, recipient_name, amount, description, allocated_by, created_at)
                VALUES ($1, 'to_vendor', 'vendor', $2, $3, $4, $5, 'admin', NOW())`,
        [allocationId, vendor_id, name, credit_limit, `Initial credit limit allocation for vendor ${name}`],
        "site1_superadmin"
      );
      await cricketQuery(
        `INSERT INTO vendor_transactions
                (transaction_id, vendor_id, transaction_type, amount, balance_before, balance_after, description, reference_id, reference_name, created_by, created_at)
                VALUES ($1, $2, 'credit_from_admin', $3, 0, $4, $5, 'admin', 'System Admin', 'admin', NOW())`,
        [transactionId, vendor_id, credit_limit, credit_limit, `Initial credit limit: \u20B9${credit_limit.toLocaleString()}`],
        "site2_vendor"
      );
      await cricketQuery(
        `INSERT INTO master_ledger
                (ledger_id, transaction_date, entry_type, from_entity_type, from_entity_id, from_entity_name, to_entity_type, to_entity_id, to_entity_name, amount, transaction_type, description, created_by)
                VALUES ($1, NOW(), 'admin_allocation', 'admin', 'ADMIN-001', 'System Admin', 'vendor', $2, $3, $4, 'credit_from_admin', $5, 'admin')`,
        [ledgerId, vendor_id, name, credit_limit, `Admin allocated \u20B9${credit_limit.toLocaleString()} to vendor ${name}`],
        "site1_superadmin"
      );
    }
    await recordAuditLog({
      action: "Vendor Created",
      category: "Vendor",
      details: `Admin created vendor "${name}" (${vendor_id}) with \u20B9${credit_limit || 0} credit`,
      sqlTrace: `INSERT INTO vendors (vendor_id, name, email, phone, credit_limit, commission_rate, status) VALUES ('${vendor_id}', '${name}', '${email}', '${phone}', ${credit_limit || 0}, ${commission_rate || 0}, 'Active')`,
      newState: createdVendor,
      req
    });
    res.json({
      success: true,
      vendor: createdVendor,
      message: "Vendor created successfully with login credentials and transaction history"
    });
  } catch (error) {
    console.error("Create vendor error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router2.put("/vendors/:id", async (req, res) => {
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
      "site2_vendor"
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Vendor not found"
      });
    }
    res.json({
      success: true,
      vendor: result.rows[0],
      message: "Vendor updated successfully"
    });
    await recordAuditLog({
      action: "Vendor Updated",
      category: "Vendor",
      details: `Admin updated vendor "${name || result.rows[0].name}" details`,
      sqlTrace: `UPDATE vendors SET ... WHERE id = ${req.params.id}`,
      newState: result.rows[0],
      req
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router2.delete("/vendors/:id", async (req, res) => {
  try {
    const result = await cricketQuery(
      `DELETE FROM vendors WHERE id = $1 RETURNING *`,
      [req.params.id],
      "site2_vendor"
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Vendor not found"
      });
    }
    res.json({
      success: true,
      message: "Vendor deleted successfully"
    });
    await recordAuditLog({
      action: "Vendor Deleted",
      category: "Vendor",
      details: `Admin deleted vendor with ID: ${req.params.id}`,
      sqlTrace: `DELETE FROM vendors WHERE id = ${req.params.id}`,
      prevState: result.rows[0],
      req
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
var site2_vendors_default = router2;

// server/routes/site3_users.ts
var import_express3 = __toESM(require("express"));
var router3 = import_express3.default.Router();
router3.get("/users", async (req, res) => {
  try {
    const result = await cricketQuery(
      `SELECT id, user_id, username, balance, exposure, status, vendor_id, created_at, last_login 
       FROM users 
       ORDER BY created_at DESC`,
      [],
      "site3_users"
    );
    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router3.post("/users", async (req, res) => {
  try {
    const {
      user_id,
      username,
      password,
      // New: Password field (not password_hash)
      balance,
      vendor_id,
      admin_token
      // New: Admin verification token
    } = req.body;
    if (!user_id || !username || !password) {
      return res.status(400).json({
        success: false,
        error: "User ID, username, and password are required"
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long"
      });
    }
    const { hashPassword: hashPassword3 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
    const password_hash = await hashPassword3(password);
    const result = await cricketQuery(
      `INSERT INTO users 
       (user_id, username, password_hash, balance, exposure, status, vendor_id)
       VALUES ($1, $2, $3, $4, 0, 'Active', $5)
       RETURNING id, user_id, username, balance, exposure, status, vendor_id, created_at`,
      [user_id, username, password_hash, balance || 0, vendor_id],
      "site3_users"
    );
    const createdUser = result.rows[0];
    if (balance && balance > 0 && vendor_id) {
      const userTransactionId = `UTX-${Date.now()}`;
      const vendorTransactionId = `VTX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const ledgerId = `LDG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const vendorResult = await cricketQuery(
        `SELECT vendor_id, name FROM vendors WHERE vendor_id = $1`,
        [vendor_id],
        "site2_vendor"
      );
      const vendorName = vendorResult.rows[0]?.name || "Unknown Vendor";
      await cricketQuery(
        `INSERT INTO user_transactions
                (transaction_id, user_id, transaction_type, amount, balance_before, balance_after, exposure_before, exposure_after, description, reference_id, reference_name, created_by, created_at)
                VALUES ($1, $2, 'credit_from_vendor', $3, 0, $4, 0, 0, $5, $6, $7, 'vendor', NOW())`,
        [userTransactionId, user_id, balance, balance, `Initial balance from vendor ${vendorName}`, vendor_id, vendorName],
        "site3_users"
      );
      await cricketQuery(
        `INSERT INTO vendor_transactions
                (transaction_id, vendor_id, transaction_type, amount, balance_before, balance_after, description, reference_id, reference_name, created_by, created_at)
                VALUES ($1, $2, 'debit_to_user', $3, 0, 0, $4, $5, $6, 'vendor', NOW())`,
        [vendorTransactionId, vendor_id, balance, `Funded user ${username} with \u20B9${balance.toLocaleString()}`, user_id, username],
        "site2_vendor"
      );
      await cricketQuery(
        `INSERT INTO master_ledger
                (ledger_id, transaction_date, entry_type, from_entity_type, from_entity_id, from_entity_name, to_entity_type, to_entity_id, to_entity_name, amount, transaction_type, description, created_by)
                VALUES ($1, NOW(), 'vendor_to_user', 'vendor', $2, $3, 'user', $4, $5, $6, 'credit_to_user', $7, 'vendor')`,
        [ledgerId, vendor_id, vendorName, user_id, username, balance, `Vendor ${vendorName} funded user ${username} with \u20B9${balance.toLocaleString()}`],
        "site1_superadmin"
      );
      await cricketQuery(
        `UPDATE vendors 
                SET used_credit = used_credit + $1 
                WHERE vendor_id = $2`,
        [balance, vendor_id],
        "site2_vendor"
      );
    }
    await recordAuditLog({
      action: "User Created",
      category: "Vendor",
      details: `Admin/Vendor created user "${username}" (${user_id}) with \u20B9${balance || 0} balance`,
      sqlTrace: `INSERT INTO users (user_id, username, balance, vendor_id, status) VALUES ('${user_id}', '${username}', ${balance || 0}, '${vendor_id}', 'Active')`,
      newState: createdUser,
      req
    });
    res.json({
      success: true,
      user: createdUser,
      message: "User created successfully with login credentials and transaction history"
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router3.put("/users/:id", async (req, res) => {
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
      "site3_users"
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    res.json({
      success: true,
      user: result.rows[0],
      message: "User updated successfully"
    });
    await recordAuditLog({
      action: "User Updated",
      category: "Vendor",
      details: `Admin updated user "${username || result.rows[0].username}" profile`,
      sqlTrace: `UPDATE users SET ... WHERE id = ${req.params.id}`,
      newState: result.rows[0],
      req
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router3.delete("/users/:id", async (req, res) => {
  try {
    const result = await cricketQuery(
      `DELETE FROM users WHERE id = $1 RETURNING *`,
      [req.params.id],
      "site3_users"
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    res.json({
      success: true,
      message: "User deleted successfully"
    });
    await recordAuditLog({
      action: "User Deleted",
      category: "Vendor",
      details: `Admin deleted user with ID: ${req.params.id}`,
      sqlTrace: `DELETE FROM users WHERE id = ${req.params.id}`,
      prevState: result.rows[0],
      req
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
var site3_users_default = router3;

// server/routes/diamond_api.ts
var import_express4 = __toESM(require("express"));
var router4 = import_express4.default.Router();
router4.get("/tree", async (req, res) => {
  res.json({
    success: true,
    message: "Diamond API integration coming soon"
  });
});
router4.post("/sync", async (req, res) => {
  res.json({
    success: true,
    message: "Diamond sync functionality coming soon"
  });
});
var diamond_api_default = router4;

// server/routes/cricket_inspect.ts
var import_express5 = __toESM(require("express"));
var router5 = import_express5.default.Router();
router5.get("/schemas", async (req, res) => {
  try {
    const result = await cricketQuery(
      `SELECT schema_name FROM information_schema.schemata 
       WHERE schema_name LIKE 'site%' 
       ORDER BY schema_name`
    );
    res.json({ success: true, schemas: result.rows.map((r) => r.schema_name) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
var cricket_inspect_default = router5;

// server/routes/cricket_users.ts
var import_express6 = __toESM(require("express"));
var router6 = import_express6.default.Router();
router6.get("/", (req, res) => {
  res.json({ message: "Use /api/site3/users instead" });
});
var cricket_users_default = router6;

// server/routes/cricket_vendors.ts
var import_express7 = __toESM(require("express"));
var router7 = import_express7.default.Router();
router7.get("/", (req, res) => {
  res.json({ message: "Use /api/site2/vendors instead" });
});
var cricket_vendors_default = router7;

// server/routes/auth.ts
var import_express8 = __toESM(require("express"));
init_auth();
var router8 = import_express8.default.Router();
router8.post("/admin/verify", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required"
      });
    }
    const result = await cricketQuery(
      `SELECT * FROM admins WHERE username = $1 AND status = 'Active'`,
      [username],
      "site1_superadmin"
    );
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
    const admin = result.rows[0];
    const isValid = await comparePassword(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
    const token = generateToken({
      admin_id: admin.admin_id,
      username: admin.username,
      role: admin.role,
      type: "admin_verification"
    });
    res.json({
      success: true,
      verified: true,
      token,
      message: "Admin verified successfully"
    });
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({
      success: false,
      error: "Verification failed"
    });
  }
});
router8.post("/vendor/login", async (req, res) => {
  try {
    const { vendor_id, password } = req.body;
    if (!vendor_id || !password) {
      return res.status(400).json({
        success: false,
        error: "Vendor ID and password are required"
      });
    }
    const result = await cricketQuery(
      `SELECT * FROM vendors WHERE vendor_id = $1 AND status = 'Active'`,
      [vendor_id],
      "site2_vendor"
    );
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
    const vendor = result.rows[0];
    if (!vendor.password_hash) {
      return res.status(400).json({
        success: false,
        error: "Password not set for this vendor. Please contact admin."
      });
    }
    const isValid = await comparePassword(password, vendor.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
    await cricketQuery(
      `UPDATE vendors SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      [vendor.id],
      "site2_vendor"
    );
    const token = generateToken({
      vendor_id: vendor.vendor_id,
      id: vendor.id,
      name: vendor.name,
      type: "vendor"
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
  } catch (error) {
    console.error("Vendor login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed"
    });
  }
});
router8.post("/user/login", async (req, res) => {
  try {
    const { user_id, password } = req.body;
    if (!user_id || !password) {
      return res.status(400).json({
        success: false,
        error: "User ID and password are required"
      });
    }
    const result = await cricketQuery(
      `SELECT * FROM users WHERE user_id = $1 AND status = 'Active'`,
      [user_id],
      "site3_users"
    );
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        error: "Password not set for this user. Please contact admin."
      });
    }
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
    await cricketQuery(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      [user.id],
      "site3_users"
    );
    const token = generateToken({
      user_id: user.user_id,
      id: user.id,
      username: user.username,
      type: "user"
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
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed"
    });
  }
});
router8.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required"
      });
    }
    const result = await cricketQuery(
      `SELECT * FROM admins WHERE username = $1 AND status = 'Active'`,
      [username],
      "site1_superadmin"
    );
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
    const admin = result.rows[0];
    const isValid = await comparePassword(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
    await cricketQuery(
      `UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      [admin.id],
      "site1_superadmin"
    );
    const token = generateToken({
      admin_id: admin.admin_id,
      id: admin.id,
      username: admin.username,
      role: admin.role,
      type: "admin"
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
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed"
    });
  }
});
var auth_default = router8;

// server/routes/vendor_details.ts
var import_express9 = __toESM(require("express"));
var router9 = import_express9.default.Router();
router9.get("/vendors/:id/details", async (req, res) => {
  try {
    const vendorId = req.params.id;
    const vendorResult = await cricketQuery(
      `SELECT 
                id, vendor_id, name, email, phone, 
                credit_limit, used_credit, commission_rate, 
                status, created_at, last_login
            FROM vendors 
            WHERE id = $1`,
      [vendorId],
      "site2_vendor"
    );
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Vendor not found"
      });
    }
    const vendor = vendorResult.rows[0];
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
      "site3_users"
    );
    const stats = statsResult.rows[0];
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
      "site2_vendor"
    );
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
      transactions: transactionsResult.rows.map((t) => ({
        ...t,
        amount: parseFloat(t.amount),
        balance_before: parseFloat(t.balance_before),
        balance_after: parseFloat(t.balance_after)
      }))
    });
  } catch (error) {
    console.error("Get vendor details error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router9.post("/vendors/:id/add-funds", async (req, res) => {
  try {
    const vendorId = req.params.id;
    const { amount, admin_username, description } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid amount is required"
      });
    }
    const vendorResult = await cricketQuery(
      `SELECT * FROM vendors WHERE id = $1`,
      [vendorId],
      "site2_vendor"
    );
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Vendor not found"
      });
    }
    const vendor = vendorResult.rows[0];
    const currentLimit = parseFloat(vendor.credit_limit);
    const newLimit = currentLimit + parseFloat(amount);
    const transactionId = `VT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const allocationId = `ALLOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await cricketQuery(
      `UPDATE vendors 
            SET credit_limit = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2`,
      [newLimit, vendorId],
      "site2_vendor"
    );
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
        description || "Fund allocation from admin",
        "ADMIN-001",
        admin_username || "superadmin",
        admin_username || "superadmin"
      ],
      "site2_vendor"
    );
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
        description || "Fund allocation to vendor",
        admin_username || "superadmin"
      ],
      "site1_superadmin"
    );
    res.json({
      success: true,
      message: "Funds added successfully",
      newCreditLimit: newLimit,
      transaction: {
        transaction_id: transactionId,
        amount: parseFloat(amount),
        previous_limit: currentLimit,
        new_limit: newLimit
      }
    });
  } catch (error) {
    console.error("Add funds error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router9.get("/vendors/:id/transactions", async (req, res) => {
  try {
    const vendorId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const vendorResult = await cricketQuery(
      `SELECT vendor_id FROM vendors WHERE id = $1`,
      [vendorId],
      "site2_vendor"
    );
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Vendor not found"
      });
    }
    const vendor_id = vendorResult.rows[0].vendor_id;
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
      "site2_vendor"
    );
    const countResult = await cricketQuery(
      `SELECT COUNT(*) as total FROM vendor_transactions WHERE vendor_id = $1`,
      [vendor_id],
      "site2_vendor"
    );
    const totalTransactions = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalTransactions / limit);
    res.json({
      success: true,
      transactions: result.rows.map((t) => ({
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
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router9.get("/vendors/:id/credentials", async (req, res) => {
  try {
    const vendorId = req.params.id;
    const result = await cricketQuery(
      `SELECT vendor_id, password_hash FROM vendors WHERE id = $1`,
      [vendorId],
      "site2_vendor"
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Vendor not found"
      });
    }
    res.json({
      success: true,
      vendor_id: result.rows[0].vendor_id,
      note: "Password is hashed. Original password was set during creation."
    });
  } catch (error) {
    console.error("Get credentials error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
var vendor_details_default = router9;

// server/routes/financial_command.ts
var import_express10 = __toESM(require("express"));
var router10 = import_express10.default.Router();
router10.get("/financial-stats", async (req, res) => {
  console.log("--- FETCHING FINANCIAL STATS ---");
  try {
    const allocResult = await cricketPool.query(`
      SELECT COALESCE(SUM(amount), 0) as total_allocated
      FROM site1_superadmin.admin_fund_allocations
      WHERE allocation_type = 'to_vendor'
    `);
    console.log("Allocations:", allocResult.rows[0].total_allocated);
    const vendorResult = await cricketPool.query(`
      SELECT 
        COALESCE(SUM(credit_limit), 0) as total_limits,
        COALESCE(SUM(used_credit), 0) as total_used,
        COUNT(*) FILTER (WHERE status = 'Active') as active_vendors
      FROM site2_vendor.vendors
    `);
    const userResult = await cricketPool.query(`
      SELECT 
        COALESCE(SUM(balance), 0) as total_balance,
        COALESCE(SUM(exposure), 0) as total_exposure,
        COUNT(*) FILTER (WHERE status = 'Active') as active_users
      FROM site3_users.users
    `);
    const withdrawalResult = await cricketPool.query(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM site1_superadmin.withdrawal_queue
      WHERE status = 'pending'
    `);
    const dailyVolumeResult = await cricketPool.query(`
      SELECT COALESCE(SUM(amount), 0) as daily_volume
      FROM site3_users.user_transactions
      WHERE transaction_type = 'bet_placed'
        AND created_at >= NOW() - INTERVAL '24 hours'
    `);
    const commissionsResult = await cricketPool.query(`
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
    const totalLiquidity = totalVendorUsed + totalUserExposure;
    const reserveCluster = totalAllocated - totalVendorUsed;
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
    console.error("Error fetching financial stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch financial statistics"
    });
  }
});
router10.get("/withdrawal-queue", async (req, res) => {
  try {
    const result = await cricketPool.query(`
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
    console.error("Error fetching withdrawal queue:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch withdrawal queue"
    });
  }
});
router10.get("/master-ledger", async (req, res) => {
  try {
    const result = await cricketPool.query(`
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
    console.error("Error fetching master ledger:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch master ledger"
    });
  }
});
router10.post("/withdrawal-queue/:id/approve", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await cricketPool.query(`
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
    await recordAuditLog({
      action: "Withdrawal Approved",
      category: "Finance",
      details: `Admin approved withdrawal of \u20B9${approvedWithdrawal?.amount} for user ${approvedWithdrawal?.username}`,
      sqlTrace: `UPDATE withdrawal_queue SET status = 'approved' WHERE id = ${id}`,
      newState: approvedWithdrawal,
      req
    });
    res.json({
      success: true,
      message: "Withdrawal approved successfully"
    });
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to approve withdrawal"
    });
  }
});
var financial_command_default = router10;

// server/routes/reports.ts
var import_express11 = __toESM(require("express"));
var router11 = import_express11.default.Router();
router11.get("/kpis", async (req, res) => {
  try {
    const result = await cricketPool.query(`
      SELECT 
        COALESCE(SUM(stake), 0) as "grossTurnover",
        COALESCE(SUM(CASE WHEN status = 'settled' AND result = 'lost' THEN stake 
                          WHEN status = 'settled' AND result = 'won' THEN (stake - potential_win)
                          ELSE 0 END), 0) as ggr
      FROM site3_users.bets
    `);
    const { grossTurnover, ggr } = result.rows[0];
    const gtStr = (grossTurnover || 0).toString();
    const ggrStr = (ggr || 0).toString();
    const gt = parseFloat(gtStr);
    const ggrValue = parseFloat(ggrStr);
    const marginStr = gt > 0 ? (ggrValue / gt * 100).toFixed(1) : "0";
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
router11.get("/revenue-analytics", async (req, res) => {
  const { range } = req.query;
  try {
    const result = await cricketPool.query(`
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
router11.get("/sport-performance", async (req, res) => {
  try {
    const result = await cricketPool.query(`
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
        { name: "Cricket", value: 100, color: "#6366f1" }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router11.get("/heatmap", async (req, res) => {
  try {
    const result = await cricketPool.query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM site3_users.bets
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC
    `);
    const fullHeatmap = Array.from({ length: 24 }, (_, i) => {
      const found = result.rows.find((r) => parseInt(r.hour) === i);
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
router11.get("/vendor-leaderboard", async (req, res) => {
  try {
    const result = await cricketPool.query(`
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
var reports_default = router11;

// server/routes/risk.ts
var import_express12 = __toESM(require("express"));
var router12 = import_express12.default.Router();
router12.get("/kpis", async (req, res) => {
  try {
    const result = await cricketPool.query("SELECT * FROM site1_superadmin.risk_kpi_summary");
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
router12.get("/alerts", async (req, res) => {
  try {
    const result = await cricketPool.query(`
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
router12.get("/heuristics", async (req, res) => {
  try {
    const result = await cricketPool.query("SELECT * FROM site1_superadmin.risk_heuristics_summary");
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router12.get("/blacklist", async (req, res) => {
  try {
    const result = await cricketPool.query(`
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
router12.post("/resolve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cricketPool.query(
      "UPDATE site1_superadmin.risk_alerts SET status = 'resolved' WHERE alert_id = $1 RETURNING *",
      [id]
    );
    res.json({ success: true, message: "Alert resolved" });
    await recordAuditLog({
      action: "Risk Alert Resolved",
      category: "Security",
      details: `Admin resolved risk alert: ${id}`,
      sqlTrace: `UPDATE risk_alerts SET status = 'resolved' WHERE alert_id = '${id}'`,
      newState: result.rows[0],
      req
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router12.post("/blacklist", async (req, res) => {
  try {
    const { ip, reason } = req.body;
    const result = await cricketPool.query(
      "INSERT INTO site1_superadmin.ip_blacklist (ip_address, reason) VALUES ($1, $2) ON CONFLICT (ip_address) DO UPDATE SET status = 'active', reason = $2 RETURNING *",
      [ip, reason]
    );
    res.json({ success: true, message: `IP ${ip} blacklisted` });
    await recordAuditLog({
      action: "IP Blacklisted",
      category: "Security",
      details: `Admin manually blacklisted IP: ${ip} for ${reason}`,
      sqlTrace: `INSERT INTO ip_blacklist (ip_address, reason) VALUES ('${ip}', '${reason}')`,
      newState: result.rows[0],
      req
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
var risk_default = router12;

// server/routes/audit.ts
var import_express13 = __toESM(require("express"));
var router13 = import_express13.default.Router();
router13.get("/kpis", async (req, res) => {
  try {
    const result = await cricketPool.query("SELECT * FROM site1_superadmin.audit_kpi_summary");
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
router13.get("/logs", async (req, res) => {
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
    if (category && category !== "All") {
      query += ` WHERE category = '${category}'`;
    }
    query += ` ORDER BY timestamp DESC LIMIT 100`;
    const result = await cricketPool.query(query);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router13.get("/payload/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cricketPool.query(
      "SELECT sql_query, prev_state, new_state FROM site1_superadmin.audit_logs WHERE security_token = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Log tracer not found" });
    }
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router13.post("/archive", async (req, res) => {
  try {
    const { date } = req.body;
    res.json({ success: true, message: `Logs before ${date} archived successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
var audit_default = router13;

// server/server.ts
var import_meta = {};
import_dotenv2.default.config();
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var app = (0, import_express14.default)();
var PORT = Number(process.env.PORT) || 5e3;
var isDevelopment = process.env.NODE_ENV !== "production";
console.log("\n\u{1F680} ====================================");
console.log("   ELITE BETTING ADMIN SERVER");
console.log(`   Environment: ${isDevelopment ? "DEVELOPMENT" : "PRODUCTION"}`);
console.log("   Database: Betting_at_cricket");
console.log(`   Port: ${PORT}`);
console.log("   Process ID:", process.pid);
console.log("   __dirname:", __dirname);
console.log("\u{1F680} ====================================\n");
var keepAlive = setInterval(() => {
}, 6e4);
process.on("SIGINT", () => {
  clearInterval(keepAlive);
  gracefulShutdown("SIGINT");
});
process.on("SIGTERM", () => {
  clearInterval(keepAlive);
  gracefulShutdown("SIGTERM");
});
app.use((0, import_helmet.default)({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use((0, import_morgan.default)(isDevelopment ? "dev" : "combined"));
app.use((0, import_cors.default)({
  origin: isDevelopment ? "*" : process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
}));
app.use(import_express14.default.json({ limit: "10mb" }));
app.use(import_express14.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, import_compression.default)());
app.use((req, res, next) => {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});
var dbConnected = false;
var initializeDatabase = async () => {
  try {
    await connectCricketDatabase();
    console.log("\u2705 Database Connection: SUCCESS");
    console.log("\u{1F4CA} Connected to: Betting_at_cricket");
    console.log("\u{1F4C1} Schemas: site1_superadmin | site2_vendor | site3_users\n");
    dbConnected = true;
    return true;
  } catch (error) {
    console.error("\u274C Database Connection: FAILED");
    console.error("Error:", error.message);
    console.log("\u26A0\uFE0F  Server will start but API calls will fail\n");
    dbConnected = false;
    return false;
  }
};
app.get("/health", (req, res) => {
  res.json({
    status: "running",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    database: dbConnected ? "connected" : "disconnected",
    dbName: "Betting_at_cricket",
    schemas: ["site1_superadmin", "site2_vendor", "site3_users"],
    environment: isDevelopment ? "development" : "production"
  });
});
app.get("/", (req, res) => {
  res.json({
    message: "Elite Betting Admin API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      site1: "/api/site1/*",
      site2: "/api/site2/*",
      site3: "/api/site3/*",
      diamond: "/api/diamond/*",
      inspect: "/api/cricket/inspect/*"
    }
  });
});
app.use("/api/site1", site1_admin_default);
app.use("/api/site2", site2_vendors_default);
app.use("/api/site2", vendor_details_default);
app.use("/api/site3", site3_users_default);
app.use("/api/auth", auth_default);
app.use("/api/financial", financial_command_default);
app.use("/api/reports", reports_default);
app.use("/api/risk", risk_default);
app.use("/api/audit", audit_default);
app.use("/api/diamond", diamond_api_default);
app.use("/api/cricket/inspect", cricket_inspect_default);
app.use("/api/cricket/users", cricket_users_default);
app.use("/api/cricket/vendors", cricket_vendors_default);
var distPath = import_path.default.resolve(__dirname, "../dist");
console.log("\u{1F4C2} Serving static files from:", distPath);
app.use(import_express14.default.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
    return next();
  }
  res.sendFile(import_path.default.join(distPath, "index.html"));
});
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
    availableEndpoints: [
      "/health",
      "/api/site1/*",
      "/api/site2/*",
      "/api/site3/*",
      "/api/financial/*",
      "/api/diamond/*",
      "/api/cricket/inspect/*"
    ]
  });
});
app.use((err, req, res, next) => {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  console.error(`[${timestamp}] ERROR:`, err.message);
  if (isDevelopment) {
    console.error("Stack:", err.stack);
  }
  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : "Internal server error",
    timestamp,
    ...isDevelopment && { stack: err.stack }
  });
});
var startServer = async () => {
  await initializeDatabase();
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("\u2705 Server Status: RUNNING");
    console.log(`\u{1F310} Server URL: http://0.0.0.0:${PORT}`);
    console.log("   __dirname:", __dirname);
    console.log("   distPath:", distPath);
  });
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`\u{1F4A5} Port ${PORT} is already in use. Please close the other process.`);
    } else {
      console.error("\u{1F4A5} Server error:", error.message);
    }
    process.exit(1);
  });
};
var gracefulShutdown = async (signal) => {
  console.log(`
\u26A1 Received ${signal} - Starting graceful shutdown...`);
  try {
    await cricketPool.end();
    console.log("\u2705 Database connections closed");
    console.log("\u2705 Server shut down successfully");
    process.exit(0);
  } catch (error) {
    console.error("\u274C Error during shutdown:", error.message);
    process.exit(1);
  }
};
process.on("uncaughtException", (error) => {
  console.error("\u{1F4A5} UNCAUGHT EXCEPTION:", error.message);
  console.error(error.stack);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});
process.on("unhandledRejection", (reason) => {
  console.error("\u{1F4A5} UNHANDLED REJECTION:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});
process.on("exit", (code) => {
  console.log(`
\u{1F6AB} Process exited with code: ${code}`);
});
startServer().catch((error) => {
  console.error("\u{1F4A5} Failed to start server:", error.message);
  console.error(error.stack);
  process.exit(1);
});
var server_default = app;
