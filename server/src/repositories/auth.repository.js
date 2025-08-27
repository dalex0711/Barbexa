import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';

export const authRepository = {
    /**
     * Finds a user by email.
     *
     * @param {string} email - Email address to search for
     * @returns {Promise<object|null>} User record if found, otherwise null
     */
    async findUserByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    },

    /**
     * Creates a new user in the database.
     * - Password is hashed before storage.
     * - Role is resolved from the rol table using code_name.
     *
     * @param {object} user - User data
     * @param {string} user.username - User's username
     * @param {string} user.email - Unique email address
     * @param {string} user.password - Plain text password (hashed here)
     * @param {string} user.code_name - Role code name (must exist in rol table)
     * @returns {Promise<{message: string}>} Confirmation message
     */
    async createUser(user) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await pool.query(
            `INSERT INTO users (username, email, password, enabled, rol_id)
             VALUES (?, ?, ?, ?, (SELECT id FROM rol WHERE code_name = ?))`,
            [user.username, user.email, hashedPassword, 1, user.code_name]
        );
        return { message: "User created successfully" };
    },

    /**
     * Retrieves role code_name by role ID.
     *
     * @param {number} id_rol - Role ID
     * @returns {Promise<string>} Role code name
     */
    async getRoleById(id_rol) {
        const [rows] = await pool.query(
            'SELECT code_name FROM rol WHERE id = ?',
            [id_rol]
        );
        return rows[0].code_name;
    }
};
