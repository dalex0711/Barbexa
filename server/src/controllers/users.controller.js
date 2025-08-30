import * as users from '../services/users.service.js';

/**
 * Controller: Get total number of users.
 * - Calls the service layer to count active users.
 * - Returns JSON with the count.
 *
 * @route   GET /usersCount
 * @access  Protected
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUsersCount = async (req, res) => {
    try {
        const count = await users.getUsersCount();
        res.status(200).json({ count });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Controller: Get all barber users.
 * @route   GET /barberUser
 * @access  Protected
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getBarberUser = async (req, res) => {
    try {
        const barberUser = await users.getBarberUser();
        res.status(200).json({ barberUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const usersList = await users.getUsers();
        res.status(200).json({ users: usersList });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};