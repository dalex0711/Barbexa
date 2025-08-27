import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
    createReservation,
    getReservationById,
    listReservations,
    updateReservationStatus,
    getBarberDayAvailability
} from "../controllers/reservations.controller.js";

const router = Router();

/**
 * @route   POST /reservations
 * @desc    Create a new reservation.
 * @access  Protected (requires authentication)
 */
router.post("/reservations", authMiddleware, createReservation);

/**
 * @route   GET /reservations/detail/:id
 * @desc    Retrieve reservation details by reservation ID.
 * @access  Protected (requires authentication)
 */
router.get("/reservations/detail/:id", authMiddleware, getReservationById);

/**
 * @route   GET /reservations/list
 * @desc    List reservations with optional filters (?client_id=... & barber_id=...).
 * @access  Protected (requires authentication)
 */
router.get("/reservations/list", authMiddleware, listReservations);

/**
 * @route   PATCH /reservations/:id/status
 * @desc    Update the status of an existing reservation (e.g., confirm, cancel).
 * @access  Protected (requires authentication)
 */
router.patch("/reservations/:id/status", authMiddleware, updateReservationStatus);

/**
 * @route   GET /reservations/barber/:barberId/availability
 * @desc    Retrieve all occupied time slots for a barber on a given day.
 * @access  Protected (requires authentication)
 */
router.get("/reservations/barber/:barberId/availability", authMiddleware, getBarberDayAvailability);

export default router;
