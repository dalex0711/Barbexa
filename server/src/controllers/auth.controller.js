import * as authService from '../services/auth.service.js'

// User registration
export const register = async (req, res) => {
    const { username, email, password, code_name } = req.body;
    try {
        const user = await authService.registerUser(username, email, password,code_name);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// User login
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const {user, token} = await authService.loginUser(email, password);
        // JWT in secure cookie
        res.cookie('token',token,{
            httpOnly: true,
            secure:false,
            sameSite: 'Strict',
            maxAge: 60 * 60 * 1000
        });

        res.json(
            {
                message: 'Login successful',
            });

    } catch (error) {
        res.status(401).json({ error: error.message });
    }
}

// User profile authentication
export const getProfile = (req, res) => {
    res.json({
    message: "User profile",
    user: req.user
    });
};

export const logout = async(req,res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure:false,
        sameSite: 'Strict'

    });
    res.json({ message : 'logout successfully'})
}