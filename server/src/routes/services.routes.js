import { Router } from "express";
import { postService, getServices, deleteService, updateService, postBarberService } from "../controllers/services.controller.js";
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route   POST /services
 * @desc    Create a new service (only admins allowed).
 * @access  Protected (requires authentication + admin role)
 */
router.post('/services', authMiddleware, adminMiddleware, postService);

/**
 * @route   GET /services
 * @desc    Retrieve all services available in the system.
 * @access  Protected (requires authentication)
 */
router.get('/services', authMiddleware, getServices);

/**
 * @route   DELETE /services/:id
 * @desc    Delete a service by its ID (only admins allowed).
 * @access  Protected (requires authentication + admin role)
 */
router.delete('/services/:id', authMiddleware, adminMiddleware, deleteService);

/**
 * @route   PUT /services/:id
 * @desc    Update an existing service by its ID (only admins allowed).
 * @access  Protected (requires authentication + admin role)
 */
router.put('/services/:id', authMiddleware, adminMiddleware, updateService);

/**
 * @route   POST /barbers/:barberId/services
 * @desc    Assign one or more services to a specific barber (only admins allowed).
 * @access  Protected (requires authentication + admin role)
 */
router.post('/barbers/:barberId/services', authMiddleware, adminMiddleware, postBarberService);

export default router;
