import dns from 'dns';
// Force IPv4 over IPv6 to prevent ENETUNREACH errors on platforms like Render/Supabase
if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
}

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

/**
 * ============================================
 * CRICKET BETTING DATABASE - CONNECTION POOL
 * ============================================
 * 
 * Database: Betting_at_cricket
 * Schemas: site1_superadmin | site2_vendor | site3_users
 */

// Hard-fix for Render connection issues: 
// If it's the Supabase host, use the known IPv4 IP to bypass IPv6 ENETUNREACH errors
const rawHost = process.env.CRICKET_DB_HOST || 'localhost';
const DB_HOST = rawHost === 'db.zehrxdlqoccqrppfpcwk.supabase.co'
    ? '185.38.109.200'
    : rawHost;

console.log('🔗 Database Host resolved to:', DB_HOST);

export const cricketPool = new Pool({
    host: DB_HOST,
    user: process.env.CRICKET_DB_USER || 'postgres',
    password: process.env.CRICKET_DB_PASSWORD,
    database: process.env.CRICKET_DB_NAME || 'postgres',
    port: parseInt(process.env.CRICKET_DB_PORT || '5432'),
    ssl: process.env.CRICKET_DB_SSL === 'true' ? {
        rejectUnauthorized: false,
        // family 4 can be passed here in some versions of node/tls
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000 // Increased timeout
});

/**
 * Test database connection
 */
export const connectCricketDatabase = async () => {
    try {
        const client = await cricketPool.connect();
        const result = await client.query('SELECT current_database(), current_schema(), version()');
        console.log('✅ Connected to Cricket Betting Database Successfully');
        console.log(`🎯 Database: ${result.rows[0].current_database}`);
        client.release();
        return true;
    } catch (error: any) {
        console.error('❌ Cricket Database Connection Error:', error.message);
        throw error;
    }
};

/**
 * Execute query with schema support
 * @param query SQL query string
 * @param params Query parameters
 * @param schema Schema to use (site1_superadmin, site2_vendor, site3_users)
 */
export const cricketQuery = async (
    query: string,
    params: any[] = [],
    schema?: string
) => {
    const client = await cricketPool.connect();

    try {
        // Set schema if provided
        if (schema) {
            await client.query(`SET search_path TO ${schema}, public`);
        }

        const result = await client.query(query, params);
        return result;
    } catch (error: any) {
        console.error('Database query error:', error.message);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Health check for database
 */
export const checkDatabaseHealth = async () => {
    try {
        const result = await cricketQuery('SELECT NOW() as server_time');
        return {
            healthy: true,
            serverTime: result.rows[0].server_time,
            poolTotalCount: cricketPool.totalCount,
            poolIdleCount: cricketPool.idleCount,
            poolWaitingCount: cricketPool.waitingCount
        };
    } catch (error: any) {
        return {
            healthy: false,
            error: error.message
        };
    }
};

// Handle pool errors
cricketPool.on('error', (err: Error) => {
    console.error('💥 Unexpected database pool error:', err.message);
});

cricketPool.on('connect', () => {
    console.log('🔌 New database connection established');
});

cricketPool.on('remove', () => {
    console.log('🔌 Database connection removed from pool');
});
