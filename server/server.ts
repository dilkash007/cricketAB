/**
 * ============================================
 * ELITE BETTING ADMIN - BACKEND SERVER
 * ============================================
 * 
 * Database: Betting_at_cricket (PostgreSQL)
 * Architecture: 3-Schema Multi-Site System
 * - Site 1: SuperAdmin (Matches, Admins, Settings)
 * - Site 2: Vendors/Masters/Agents
 * - Site 3: Betting Users/Players
 * 
 * Features:
 * - Diamond API Integration (Live Cricket Data)
 * - RESTful API Routes
 * - CORS enabled for frontend
 * - Database connection pooling
 * - Error handling & logging
 */

import dotenv from 'dotenv';
// Load environment variables immediately at the very top
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { cricketPool, connectCricketDatabase } from './config/cricket_db.js';

// ============================================
// ROUTE IMPORTS
// ============================================

import site1AdminRouter from './routes/site1_admin.js';
import site2VendorsRouter from './routes/site2_vendors.js';
import site3UsersRouter from './routes/site3_users.js';
import diamondAPIRouter from './routes/diamond_api.js';
import cricketInspectRouter from './routes/cricket_inspect.js';
import cricketUsersRouter from './routes/cricket_users.js';
import cricketVendorsRouter from './routes/cricket_vendors.js';
import authRouter from './routes/auth.js';
import vendorDetailsRouter from './routes/vendor_details.js'; // Vendor management APIs
import financialCommandRouter from './routes/financial_command.js'; // Financial stats APIs
import reportsRouter from './routes/reports.js'; // Intelligence & Reports APIs
import riskRouter from './routes/risk.js'; // Risk & Fraud APIs
import auditRouter from './routes/audit.js'; // Forensic Audit APIs

// ============================================
// CONFIGURATION
// ============================================

// dotenv.config(); // Already called at the top

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const isDevelopment = process.env.NODE_ENV !== 'production';

console.log('\n🚀 ====================================');
console.log('   ELITE BETTING ADMIN SERVER');
console.log(`   Environment: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
console.log('   Database: Betting_at_cricket');
console.log(`   Port: ${PORT}`);
console.log('   Process ID:', process.pid);
console.log('   __dirname:', __dirname);
console.log('🚀 ====================================\n');

// Keep-alive interval to ensure process doesn't exit prematurely
const keepAlive = setInterval(() => {
    // This empty interval keeps the event loop active
}, 60000);

process.on('SIGINT', () => {
    clearInterval(keepAlive);
    gracefulShutdown('SIGINT');
});
process.on('SIGTERM', () => {
    clearInterval(keepAlive);
    gracefulShutdown('SIGTERM');
});

// ============================================
// SECURITY & MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Request logging
app.use(morgan(isDevelopment ? 'dev' : 'combined'));

// CORS configuration
app.use(cors({
    origin: '*', // Allow all origins for now to ensure production works
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Response compression
app.use(compression());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// DATABASE CONNECTION
// ============================================

let dbConnected = false;

const initializeDatabase = async () => {
    if (dbConnected) return true;

    // Validate essential environment variables
    const requiredEnv = ['CRICKET_DB_HOST', 'CRICKET_DB_USER', 'CRICKET_DB_PASSWORD', 'CRICKET_DB_NAME'];
    const missing = requiredEnv.filter(k => !process.env[k]);

    if (missing.length > 0) {
        console.error('❌ CRITICAL: Missing Environment Variables:', missing.join(', '));
        console.error('Please add these to Vercel Project Settings > Environment Variables');
        return false;
    }

    try {
        await connectCricketDatabase();
        console.log('✅ Database Connection: SUCCESS');
        dbConnected = true;
        return true;
    } catch (error: any) {
        console.error('❌ Database Connection: FAILED', error.message);
        dbConnected = false;
        return false;
    }
};

// Middleware to ensure DB connection for every request (Serverless friendly)
app.use(async (req, res, next) => {
    if (!dbConnected && !req.path.startsWith('/health')) {
        await initializeDatabase();
    }
    next();
});

// ============================================
// API ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'running',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'connected' : 'disconnected',
        dbName: 'Betting_at_cricket',
        schemas: ['site1_superadmin', 'site2_vendor', 'site3_users'],
        environment: isDevelopment ? 'development' : 'production'
    });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Elite Betting Admin API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            site1: '/api/site1/*',
            site2: '/api/site2/*',
            site3: '/api/site3/*',
            diamond: '/api/diamond/*',
            inspect: '/api/cricket/inspect/*'
        }
    });
});

// ============================================
// SITE-SPECIFIC ROUTES
// ============================================

/**
 * SITE 1: SuperAdmin Routes
 * - Matches management
 * - Admin management
 * - Global settings
 */
app.use('/api/site1', site1AdminRouter);

/**
 * SITE 2: Vendor Routes
 * - Vendor/Master/Agent management
 * - Credit/Commission management
 * - Vendor transactions
 */
app.use('/api/site2', site2VendorsRouter);
app.use('/api/site2', vendorDetailsRouter); // Vendor details and fund management

/**
 * SITE 3: User Routes
 * - Betting user/player management
 * - User transactions
 * - Betting history
 */
app.use('/api/site3', site3UsersRouter);

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * Authentication Routes
 * - Admin login and verification
 * - Vendor login
 * - User login
 * - Token management
 */
app.use('/api/auth', authRouter);

// ============================================
// FINANCIAL COMMAND ROUTES
// ============================================
app.use('/api/financial', financialCommandRouter);

// ============================================
// INTELLIGENCE & REPORTS ROUTES
// ============================================
app.use('/api/reports', reportsRouter);

// ============================================
// RISK & FRAUD SURVEILLANCE ROUTES
// ============================================
app.use('/api/risk', riskRouter);

// ============================================
// FORENSIC AUDIT ROUTES
// ============================================
app.use('/api/audit', auditRouter);

/**
 * Diamond API Integration
 */
app.use('/api/diamond', diamondAPIRouter);

// ============================================
// UTILITY ROUTES
// ============================================

/**
 * Database inspection tools
 * - Schema inspection
 * - Table listing
 * - Data queries
 */
app.use('/api/cricket/inspect', cricketInspectRouter);

/**
 * Legacy routes (backward compatibility)
 */
app.use('/api/cricket/users', cricketUsersRouter);
app.use('/api/cricket/vendors', cricketVendorsRouter);

// ============================================
// FRONTEND SERVING (PRODUCTION)
// ============================================

const distPath = path.resolve(__dirname, '../dist');
console.log('📂 Serving static files from:', distPath);
app.use(express.static(distPath));

// Static files routing for React - Catch-all fallback
app.use((req: Request, res: Response, next: NextFunction) => {
    // Only handle GET requests that aren't for API or Health
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/health')) {
        console.log(`📄 Fallback: Serving index.html for ${req.path}`);
        return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method,
        availableEndpoints: [
            '/health',
            '/api/site1/*',
            '/api/site2/*',
            '/api/site3/*',
            '/api/financial/*',
            '/api/diamond/*',
            '/api/cricket/inspect/*'
        ]
    });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR:`, err.message);

    if (isDevelopment) {
        console.error('Stack:', err.stack);
    }

    res.status(err.status || 500).json({
        success: false,
        error: isDevelopment ? err.message : 'Internal server error',
        timestamp,
        ...(isDevelopment && { stack: err.stack })
    });
});

// ============================================
// SERVER STARTUP
// ============================================

const startServer = async () => {
    // Initialize database connection
    await initializeDatabase();

    // Start server
    if (!process.env.VERCEL) {
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log('✅ Server Status: RUNNING');
            console.log(`🌐 Server URL: http://0.0.0.0:${PORT}`);
        });

        server.on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`💥 Port ${PORT} is already in use.`);
            } else {
                console.error('💥 Server error:', error.message);
            }
            process.exit(1);
        });
    } else {
        console.log('☁️  Running in Serverless mode (Vercel)');
    }
};

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = async (signal: string) => {
    console.log(`\n⚡ Received ${signal} - Starting graceful shutdown...`);

    try {
        // Close database connections
        await cricketPool.end();
        console.log('✅ Database connections closed');

        // Exit process
        console.log('✅ Server shut down successfully');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
    }
};

// Handle shutdown signals (Handled near top for keep-alive)
// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
    console.error('💥 UNCAUGHT EXCEPTION:', error.message);
    console.error(error.stack);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason: any) => {
    console.error('💥 UNHANDLED REJECTION:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
});

// Log when process exits to debug why it might be happening
process.on('exit', (code) => {
    console.log(`\n🚫 Process exited with code: ${code}`);
});

// ============================================
// START THE SERVER
// ============================================

startServer().catch((error: Error) => {
    console.error('💥 Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
});

// Export app for testing
export default app;
