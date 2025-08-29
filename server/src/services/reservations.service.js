import * as repo from "../repositories/reservations.repository.js";
import { combosRepository as crepo } from "../repositories/combos.repository.js";
import dayjs from "dayjs";

/**
 * Create a new reservation.
 * Supports both individual services and combos.
 * Performs validation, calculates total duration, checks for overlaps,
 * and finally creates the reservation transaction.
 *
 * @param {Object} params
 * @param {number} params.client_id - Client ID (optional, fallback to JWT user)
 * @param {number} params.barber_id - Barber ID
 * @param {Array<number>} [params.services=[]] - Array of service IDs
 * @param {Array<number>} [params.combos=[]] - Array of combo IDs
 * @param {string|Date} params.start_at - Reservation start date/time
 * @param {string} [params.notes] - Additional notes
 * @param {number} params.userIdFromJwt - User ID decoded from JWT (if client_id not provided)
 * @returns {Promise<Object>} Newly created reservation
 */
export const createReservation = async ({
  client_id, barber_id, services = [], combos = [],
  start_at, notes, userIdFromJwt
}) => {
  if (!client_id) client_id = userIdFromJwt;

  // Must include at least one service or combo
  if ((!services || services.length === 0) && (!combos || combos.length === 0)) {
    throw new Error("At least one service or combo must be specified");
  }

  // Validate services
  if (services.length) {
    await repo.assertServicesEnabled(services);
    await repo.assertBarberProvidesServices(barber_id, services);
  }

  // Validate combos
  if (combos.length) {
    await crepo.assertCombosEnabled(combos);
    // Optional: validate that barber offers all services inside the combo
  }

  // Calculate total duration in minutes
  let totalMin = 0;
  totalMin += await repo.getTotalServiceMinutes(services);

  for (const comboId of combos) {
    const combo = await crepo.getComboById(comboId);
    const items = await crepo.getComboServices(comboId);

    if (combo?.duration_override) {
      // Use combo-specific override if available
      const [hh, mm, ss] = combo.duration_override.split(":").map(Number);
      totalMin += (hh * 60 + mm + Math.floor((ss || 0) / 60));
    } else {
      // Otherwise, sum durations of included services
      for (const it of items) {
        const [hh, mm, ss] = String(it.duration).split(":").map(Number);
        const mins = (hh * 60 + mm + Math.floor((ss || 0) / 60)) * (it.quantity || 1);
        totalMin += mins;
      }
    }
  }

  if (totalMin <= 0) throw new Error("Invalid total duration");

  const start = dayjs(start_at);
  const end = start.add(totalMin, "minute").toDate();

  // Check for overlapping reservations for the same barber
  const overlap = await repo.existsOverlap(barber_id, new Date(start_at), end);
  if (overlap) throw new Error("The barber already has a reservation in that range");

  // Persist reservation with services and combos
  const reservation = await repo.createReservationTx({
    status_id: 1, // Default: PENDING
    client_id,
    barber_id,
    notes,
    start_at: new Date(start_at),
    end_at: end,
    services,
    combos
  });

  return reservation;
};

/**
 * Get reservation by ID
 * @param {number} id - Reservation ID
 * @returns {Promise<Object|null>} Reservation details
 */
export const getReservationById = (id) => repo.getReservationById(id);

/**
 * List reservations by optional filters
 * @param {Object} filters - { client_id, barber_id, status_id, from, to, limit }
 * @returns {Promise<Array>} Reservations list
 */
export const listReservations = (filters) => repo.listReservations(filters);

/**
 * Update the status of a reservation
 * @param {number} id - Reservation ID
 * @param {number} status_id - New status ID
 * @returns {Promise<Object>} Updated reservation
 */
export const updateReservationStatus = (id, status_id) =>
  repo.updateReservationStatus(id, status_id);

/**
 * Get barber availability for a given day
 * Returns busy ranges (occupied slots).
 *
 * @param {number} barber_id - Barber ID
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of occupied ranges
 */
export const getBarberDayAvailability = (barber_id, dateStr) => {
  const dayStart = dayjs(dateStr).startOf("day").toDate();
  const dayEnd   = dayjs(dateStr).endOf("day").toDate();
  return repo.getBarberBusyRanges(barber_id, dayStart, dayEnd);
};
