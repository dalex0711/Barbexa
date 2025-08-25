import jwt from 'jsonwebtoken'; 
import { config } from '../config/index.js';

/**
 * JWT-based authentication middleware.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 * @param {Function} next - Function to pass control to the next middleware.
 */
export const authMiddleware = (req,res,next) => {
    const token = req.cookies.token;
    if(!token) return res.status(401).json({error: 'Access denied.'});

    try {
        const decoded = jwt.verify(token,config.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({error: 'Invalid token.'});
    }
}