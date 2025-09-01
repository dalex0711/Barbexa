import * as authService from '../services/auth.service.js';

/**
 * Controller: Register a new user.
 * - Reads user data from the request body.
 * - Delegates validation and creation to the service layer.
 *
 * @route   POST /auth/register
 * @access  Public
 */
export const register = async (req, res) => {
    const { username, email, password, code_name } = req.body;
    try {
        const user = await authService.registerUser(username, email, password, code_name);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Controller: User login.
 * - Validates credentials via the service layer.
 * - On success, sets a JWT in an HTTP-only cookie.
 *
 * @route   POST /auth/login
 * @access  Public
 */
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { user, token } = await authService.loginUser(email, password);

        // Store JWT in a secure HTTP-only cookie
        res.cookie('token', token, {
        httpOnly: true,
        secure: true,        
        sameSite: 'none',    
        maxAge: 60 * 60 * 1000
        });

        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

/**
 * Controller: Retrieve authenticated user profile.
 * - Requires authMiddleware to populate req.user.
 *
 * @route   GET /auth/profile
 * @access  Protected
 */
export const getProfile = (req, res) => {
    res.json({
        message: "User profile",
        user: req.user
    });
};

/**
 * Controller: User logout.
 * - Clears JWT cookie from the client.
 *
 * @route   POST /auth/logout
 * @access  Protected
 */
export const logout = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'none'
    });
    res.json({ message: 'Logout successfully' });
};
