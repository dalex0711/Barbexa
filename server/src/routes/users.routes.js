import { Router } from 'express';
import { getUsersCount, getBarberUser } from '../controllers/users.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route   GET /usersCount
 * @desc    Retrieve the total number of users in the system.
 * @access  Protected (requires authentication)
 */
router.get('/usersCount', authMiddleware, getUsersCount);

/**
 * @route   GET /barberUser
 * @desc    Retrieve all users with the "barber" role.
 * @access  Protected (requires authentication)
 */
router.get('/barberUser', authMiddleware, getBarberUser);

export default router;
