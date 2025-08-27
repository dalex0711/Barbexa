import * as repo from "../repositories/reservations.repository.js";
import dayjs from "dayjs";

/**
 * Creates a new reservation after validating business rules
 *
 * @param {object} payload - Reservation data
 * @param {number} payload.client_id - Client ID (optional if inferred from JWT)
 * @param {number} payload.barber_id - Barber ID
 * @param {number[]} payload.services - Array of service IDs
 * @param {string|Date} payload.start_at - Reservation start time (ISO string or Date)
 * @param {string} [payload.notes] - Optional notes
 * @param {number} [payload.userIdFromJwt] - User ID from authenticated token
 * @returns {Promise<object>} Newly created reservation with services included
 * @throws {Error} If validation fails or overlap is detected
 */
export const createReservation = async ({
  client_id, barber_id, services, start_at, notes, userIdFromJwt
}) => {
  if (!client_id) client_id = userIdFromJwt; // Infer client_id from JWT if not provided

  if (!Array.isArray(services) || services.length === 0)
    throw new Error("Debe indicar al menos un servicio");

  await repo.assertServicesEnabled(services);           // Step 1: services enabled
  await repo.assertBarberProvidesServices(barber_id, services); // Step 2: barber provides services

  const totalMin = await repo.getTotalServiceMinutes(services); // Step 3: calculate duration
  if (totalMin <= 0) throw new Error("Duración total inválida");
  const start = dayjs(start_at);
  const end = start.add(totalMin, "minute").toDate();

  const hasOverlap = await repo.existsOverlap(barber_id, new Date(start_at), end); // Step 4: overlap check
  if (hasOverlap) throw new Error("El barbero ya tiene una reserva en ese rango");

  // Step 5: create reservation transactionally
  const status_id = 1; // Default: PENDING
  const reservation = await repo.createReservationTx({
    status_id, client_id, barber_id, notes, start_at: new Date(start_at), end_at: end, services
  });

  return reservation;
};

/**
 * Retrieves a reservation by its ID.
 *
 * @param {number} id - Reservation ID
 * @returns {Promise<object|null>} Reservation object or null if not found
 */
export const getReservationById = (id) => repo.getReservationById(id);

/**
 * Lists reservations using optional filters (client_id, barber_id, status_id, from, to, limit).
 *
 * @param {object} filters - Filter options
 * @returns {Promise<object[]>} Array of reservations
 */
export const listReservations = (filters) => repo.listReservations(filters);

/**
 * Updates the status of a reservation.
 *
 * @param {number} id - Reservation ID
 * @param {number} status_id - New status ID
 * @returns {Promise<object>} Updated reservation
 */
export const updateReservationStatus = (id, status_id) =>
  repo.updateReservationStatus(id, status_id);

/**
 * Retrieves occupied time ranges for a barber on a given date.
 * Useful for blocking unavailable slots on the frontend.
 *
 * @param {number} barber_id - Barber ID
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {Promise<Array<{start_at: Date, end_at: Date, status_id: number}>>}
 */
export const getBarberDayAvailability = async (barber_id, dateStr) => {
  const dayStart = dayjs(dateStr).startOf("day").toDate();
  const dayEnd   = dayjs(dateStr).endOf("day").toDate();
  return repo.getBarberBusyRanges(barber_id, dayStart, dayEnd);
};
