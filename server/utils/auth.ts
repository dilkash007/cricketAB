import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'elite-betting-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        return hash;
    } catch (error: any) {
        throw new Error(`Password hashing failed: ${error.message}`);
    }
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    try {
        const isMatch = await bcrypt.compare(password, hash);
        return isMatch;
    } catch (error: any) {
        throw new Error(`Password comparison failed: ${error.message}`);
    }
};

/**
 * Generate JWT token
 */
export const generateToken = (payload: object): string => {
    try {
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return token;
    } catch (error: any) {
        throw new Error(`Token generation failed: ${error.message}`);
    }
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): any => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error: any) {
        throw new Error(`Token verification failed: ${error.message}`);
    }
};

/**
 * Validate password strength
 * Minimum 6 characters
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (!password || password.length < 6) {
        return {
            valid: false,
            message: 'Password must be at least 6 characters long'
        };
    }

    return { valid: true };
};

/**
 * Generate random password (for testing)
 */
export const generateRandomPassword = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};
