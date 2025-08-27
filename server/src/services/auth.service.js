import { authRepository } from '../repositories/auth.repository.js';
import { validateEmail, validatePassword, validateName } from '../shared/validation.js';
import { config } from '../config/index.js';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Registers a new user after applying validation rules.
 *
 * @param {string} username - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} password - The plain text password (to be hashed).
 * @param {string} code_name - Role code name (e.g., "client", "barber", "admin").
 * @returns {Promise<object>} The newly created user object.
 * @throws {Error} If validation fails or user already exists.
 */
export const registerUser = async (username, email, password, code_name) => {
    if (!validateEmail(email)) throw new Error('Invalid email format');
    if (!validatePassword(password)) throw new Error('Invalid password format');
    if (!validateName(username)) throw new Error('Invalid username format');

    const user = await authRepository.findUserByEmail({ email });
    if (user) {
        throw new Error('User already exists');
    }

    const newUser = await authRepository.createUser({ username, email, password, code_name });
    return newUser;
};

/**
 * Logs in a user after verifying credentials.
 *
 * @param {string} email - The user's email.
 * @param {string} password - The plain text password.
 * @returns {Promise<{ user: object, token: string }>} User data plus JWT token.
 * @throws {Error} If validation fails, user is not found, or password is invalid.
 */
export const loginUser = async (email, password) => {
    if (!validateEmail(email)) throw new Error('Invalid email format');
    if (!validatePassword(password)) throw new Error('Invalid password format');

    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new Error('User not found');

    const code_name = await authRepository.getRoleById(user.rol_id);

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new Error('Invalid password');

    const token = jwt.sign(
        { id: user.id, username: user.username, code_name: code_name },
        config.jwt.secret,
        { expiresIn: config.jwt.expires }
    );

    return { user, token };
};
