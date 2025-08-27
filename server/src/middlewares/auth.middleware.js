import jwt from 'jsonwebtoken'; 
import { config } from '../config/index.js';

/**
 * Middleware that verifies the presence and validity of a JWT token.

 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Access denied.' });

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded; // Attach user data (id, username, role, etc.) to request
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

/**
 * Middleware that restricts access to administrators only.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const adminMiddleware = (req, res, next) => {
    if (req.user?.code_name === 'ADMIN_01') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied.' });
};
