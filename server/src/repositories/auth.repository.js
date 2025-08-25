import {pool} from '../config/db.js';
import bcrypt from 'bcrypt';

export const authRepository = {
     /**
     * Search for a user in the database using their email address.
     * @param {string} email - The email address of the user to search for.
     * @returns {Promise<Object|null>} - Returns the user object if found, otherwise null.
     */
    async findUserByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },
    /**
     * Creates a new user in the database.
     * @param {Object} user - User data to create.
     * @param {string} user.username - Username.
     * @param {string} user.email - Unique email address.
     * @param {string} user.password - Plain text password (will be hashed here).
     * @returns {Promise<Object>} - Confirmation message of creation.
     */
    async createUser(user) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const [result] = await pool.query('INSERT INTO users (username, email, password, enabled, rol_id) VALUES (?, ?, ?, ?, ?)', [user.username, user.email, hashedPassword, 1, 3]);
        return {message :"User created successfully"};
    }
};
