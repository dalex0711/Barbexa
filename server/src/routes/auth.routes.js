import { Router } from "express";
import { register, login, getProfile } from '../controllers/auth.controller.js'
import { authMiddleware as verifyToken } from '../middlewares/auth.middleware.js'

const router = Router();

/**
 * @route POST /auth/register
 * @desc Register a new user in the system.
 * @access Public
 */
router.post('/register', register)

/**
 * @route POST /auth/login
 * @desc Authenticate a user with email and password, returns a JWT in cookie.
 * @access Public
 */
router.post('/login', login)

/**
 * @route GET /auth/profile
 * @desc Returns the information of the authenticated user (extracted from the JWT).
 * @access Private (requires valid token in the cookie)
 */
router.get("/profile", verifyToken, getProfile);

export default router;
