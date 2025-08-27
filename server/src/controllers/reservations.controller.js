import * as service from "../services/reservations.service.js";

/**
 * Controller: Create a new reservation.
 *
 * @route   POST /reservations
 * @access  Protected
 */
export const createReservation = async (req, res, next) => {
    try {
        const userIdFromJwt = req.user?.id; // Provided by auth middleware
        const payload = { ...req.body, userIdFromJwt };
        const created = await service.createReservation(payload);
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
};

/**
 * Controller: Get reservation details by ID.
 *
 * @route   GET /reservations/detail/:id
 * @access  Protected
 */
export const getReservationById = async (req, res, next) => {
    try {
        const data = await service.getReservationById(Number(req.params.id));
        if (!data) return res.status(404).json({ message: "Not found" });
        res.json(data);
    } catch (err) {
        next(err);
    }
};

/**
 * Controller: List reservations with optional filters.

 *
 * @route   GET /reservations/list
 * @access  Protected
 */
export const listReservations = async (req, res, next) => {
    try {
        const data = await service.listReservations(req.query);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

/**
 * Controller: Update reservation status by ID.

 * @route   PATCH /reservations/:id/status
 * @access  Protected
 */
export const updateReservationStatus = async (req, res, next) => {
    try {
        const data = await service.updateReservationStatus(
            Number(req.params.id),
            req.body.status_id
        );
        res.json(data);
    } catch (err) {
        next(err);
    }
};

/**
 * Controller: Get barber's busy time slots for a specific day.
 * @route   GET /reservations/barber/:barberId/availability
 * @access  Protected
 */
export const getBarberDayAvailability = async (req, res, next) => {
    try {
        const { barberId } = req.params;
        const { date } = req.query; // "YYYY-MM-DD"
        const data = await service.getBarberDayAvailability(Number(barberId), date);
        res.json(data);
    } catch (err) {
        next(err);
    }
};
