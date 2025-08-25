import {authRepository} from '../repositories/auth.repository.js'
import { validateEmail,validatePassword,validateUsername} from '../shared/validation.js'
import {config} from '../config/index.js'

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
* Service to register a new user, applying validation rules,
* the creation of the user is delegated to the repository.
*
* @param {string} username - The user's name.
* @param {string} email - The user's email address.
* @param {string} password - The plain text password (hashed in the repository).
* @returns {Promise<object>} The newly created user.
 */
export const registerUser = async (username, email, password, code_name) => {
    if (!validateEmail(email)) throw new Error('Invalid email format');
    if (!validatePassword(password)) throw new Error('Invalid password format');
    if (!validateUsername(username)) throw new Error('Invalid username format');

    const user = await authRepository.findUserByEmail({ email });
    if(user){
        throw new Error('User already exists');
    }
    const newUser = await authRepository.createUser({ username, email, password, code_name });
    return newUser;
}

/**
 * Service to log in a user.
 *
 * @param {string} email - The user's email.
 * @param {string} password - The plain text password.
 * @returns {Promise<{ user: object, token: string }>} User data + JWT token.
 */
export const loginUser = async (email, password) => {

    if (!validateEmail(email)) throw new Error('Invalid email format');
    if (!validatePassword(password)) throw new Error('Invalid password format');

    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new Error('User not found');

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new Error('Invalid password');

    const token = jwt.sign(
        { id: user.id,username: user.username, rol: user.rol_id },
        config.jwt.secret,
        { expiresIn: config.jwt.expires }
        );
    return { user, token };
}
