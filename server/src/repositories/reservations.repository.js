// server/src/repositories/reservations.repository.js
import { pool } from "../config/db.js";

/* ============================
   Utility functions
============================ */

/**
 * Builds a SQL IN clause with the correct number of placeholders.
 * Example: inClause([1,2,3]) -> "(?,?,?)"
 *
 * @param {Array<any>} arr - Array of values for the IN clause
 * @returns {string} SQL IN clause string
 */
const inClause = (arr) => `(${arr.map(() => "?").join(",")})`;

/**
 * Ensures the array is not empty, throws an error otherwise.
 *
 * @param {Array<any>} arr - Input array
 * @param {string} msg - Error message if invalid
 * @throws {Error} If array is empty or not valid
 */
const assertNonEmptyArray = (arr, msg) => {
  if (!Array.isArray(arr) || arr.length === 0) throw new Error(msg);
};

/* ============================
   Validation queries
============================ */

/**
 * Ensures all given services exist and are enabled.
 *
 * @param {number[]} serviceIds - Array of service IDs
 * @throws {Error} If any service is disabled or does not exist
 */
export const assertServicesEnabled = async (serviceIds) => {
  assertNonEmptyArray(serviceIds, "Debe enviar al menos un service_id");
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt
       FROM services
      WHERE enabled=1
        AND id IN ${inClause(serviceIds)}`,
    serviceIds
  );
  if (Number(rows[0]?.cnt) !== serviceIds.length) {
    throw new Error("Algún servicio no existe o está deshabilitado");
  }
};

/**
 * Ensures a barber provides all requested services.
 *
 * @param {number} barber_id - Barber ID
 * @param {number[]} serviceIds - Array of service IDs
 * @throws {Error} If barber does not provide all services
 */
export const assertBarberProvidesServices = async (barber_id, serviceIds) => {
  assertNonEmptyArray(serviceIds, "Debe enviar al menos un service_id");
  const params = [barber_id, ...serviceIds];
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt
       FROM barber_services
      WHERE barber_id = ?
        AND service_id IN ${inClause(serviceIds)}`,
    params
  );
  if (Number(rows[0]?.cnt) !== serviceIds.length) {
    throw new Error("El barbero no ofrece todos los servicios solicitados");
  }
};

/**
 * Calculates total minutes from service durations.
 * - Only enabled services are included.
 * - Uses TIME_TO_SEC(duration)/60 to convert TIME to minutes.
 *
 * @param {number[]} serviceIds - Array of service IDs
 * @returns {Promise<number>} Total duration in minutes
 */
export const getTotalServiceMinutes = async (serviceIds) => {
  assertNonEmptyArray(serviceIds, "Debe enviar al menos un service_id");
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(TIME_TO_SEC(duration))/60,0) AS total_minutes
       FROM services
      WHERE enabled=1
        AND id IN ${inClause(serviceIds)}`,
    serviceIds
  );
  return Number(rows[0]?.total_minutes || 0);
};

/**
 * Checks if a reservation overlaps with existing ones for the same barber.
 * Active states considered: 1=PENDIENTE, 2=CONFIRMADA, 3=EN_PROCESO.
 *
 * @param {number} barber_id - Barber ID
 * @param {Date} start_at - Proposed start time
 * @param {Date} end_at - Proposed end time
 * @returns {Promise<boolean>} True if overlap exists, false otherwise
 */
export const existsOverlap = async (barber_id, start_at, end_at) => {
  const [rows] = await pool.query(
    `SELECT 1
       FROM reservations r
      WHERE r.barber_id = ?
        AND r.status_id IN (1,2,3)
        AND (? < r.end_at) AND (? > r.start_at)
      LIMIT 1`,
    [barber_id, start_at, end_at]
  );
  return rows.length > 0;
};

/* ============================
   Transactional creation
============================ */

/**
 * Creates a reservation and related services transactionally.
 * - Inserts into reservations table
 * - Inserts into reservation_service table
 * - Commits both or rolls back on error
 *
 * @param {object} data - Reservation data
 * @param {number} data.status_id - Reservation status
 * @param {number} data.client_id - Client ID
 * @param {number} data.barber_id - Barber ID
 * @param {string|null} data.notes - Optional notes
 * @param {Date} data.start_at - Start datetime
 * @param {Date} data.end_at - End datetime
 * @param {number[]} data.services - Array of service IDs
 * @returns {Promise<object>} Created reservation with related services
 */
export const createReservationTx = async ({
  status_id,
  client_id,
  barber_id,
  notes,
  start_at,
  end_at,
  services,
}) => {
  assertNonEmptyArray(services, "Debe enviar al menos un service_id");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert reservation
    const [ins] = await conn.query(
      `INSERT INTO reservations
         (status_id, client_id, barber_id, notas, start_at, end_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [status_id, client_id, barber_id, notes || null, start_at, end_at]
    );
    const reservation_id = ins.insertId;

    // Insert related services
    const values = services.map((sid) => [sid, reservation_id]);
    await conn.query(
      `INSERT INTO reservation_service (service_id, reservation_id) VALUES ?`,
      [values]
    );

    await conn.commit();

    // Return reservation with joined details
    const [resRows] = await conn.query(
      `SELECT r.*,
              s.name AS status_name,
              c.username AS client_name,
              b.username AS barber_name
         FROM reservations r
         JOIN status_reservation s ON s.id = r.status_id
         JOIN users c ON c.id = r.client_id
         JOIN users b ON b.id = r.barber_id
        WHERE r.id = ?`,
      [reservation_id]
    );

    const [svcRows] = await conn.query(
      `SELECT sv.id, sv.name, sv.price, sv.duration
         FROM reservation_service rs
         JOIN services sv ON sv.id = rs.service_id
        WHERE rs.reservation_id = ?`,
      [reservation_id]
    );

    const result = resRows[0] || null;
    if (result) result.services = svcRows;
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

/* ============================
   Reads / Listings / Updates
============================ */

/**
 * Retrieves a reservation by ID, including related services and joined user/role data.
 *
 * @param {number} id - Reservation ID
 * @returns {Promise<object|null>} Reservation with details or null if not found
 */
export const getReservationById = async (id) => {
  const [rows] = await pool.query(
    `SELECT r.*,
            s.name AS status_name,
            c.username AS client_name,
            b.username AS barber_name
       FROM reservations r
       JOIN status_reservation s ON s.id = r.status_id
       JOIN users c ON c.id = r.client_id
       JOIN users b ON b.id = r.barber_id
      WHERE r.id = ?`,
    [id]
  );
  if (!rows[0]) return null;

  const [services] = await pool.query(
    `SELECT sv.id, sv.name, sv.price, sv.duration
       FROM reservation_service rs
       JOIN services sv ON sv.id = rs.service_id
      WHERE rs.reservation_id = ?`,
    [id]
  );
  rows[0].services = services;
  return rows[0];
};

/**
 * Lists reservations filtered by barber, client, status, or date range.
 *
 * @param {object} filters - Query filters
 * @param {number} [filters.barber_id] - Barber ID
 * @param {number} [filters.client_id] - Client ID
 * @param {number} [filters.status_id] - Reservation status ID
 * @param {Date|string} [filters.from] - Start date filter (inclusive)
 * @param {Date|string} [filters.to] - End date filter (exclusive)
 * @param {number} [filters.limit=200] - Maximum number of rows to return
 * @returns {Promise<object[]>} Array of reservations
 */
export const listReservations = async ({
  barber_id,
  client_id,
  status_id,
  from,
  to,
  limit = 200,
}) => {
  const where = [];
  const params = [];
  if (barber_id) { where.push("r.barber_id = ?"); params.push(barber_id); }
  if (client_id) { where.push("r.client_id = ?"); params.push(client_id); }
  if (status_id) { where.push("r.status_id = ?"); params.push(status_id); }
  if (from) { where.push("r.start_at >= ?"); params.push(new Date(from)); }
  if (to)   { where.push("r.start_at < ?"); params.push(new Date(to)); }

  const sql = `
    SELECT r.id, r.start_at, r.end_at, r.notas,
           r.status_id, s.name AS status_name,
           r.client_id, c.username AS client_name,
           r.barber_id, b.username AS barber_name
      FROM reservations r
      JOIN status_reservation s ON s.id = r.status_id
      JOIN users c ON c.id = r.client_id
      JOIN users b ON b.id = r.barber_id
     ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY r.start_at DESC
     LIMIT ?`;
  params.push(Number(limit));

  const [rows] = await pool.query(sql, params);
  return rows;
};

/**
 * Updates reservation status by ID and returns the updated record.
 *
 * @param {number} id - Reservation ID
 * @param {number} status_id - New status ID
 * @returns {Promise<object>} Updated reservation
 */
export const updateReservationStatus = async (id, status_id) => {
  await pool.query(
    `UPDATE reservations SET status_id = ? WHERE id = ?`,
    [status_id, id]
  );
  return getReservationById(id);
};

/**
 * Retrieves all busy time ranges for a barber within a day (or custom range).
 * Useful for the frontend to block unavailable slots.
 *
 * @param {number} barber_id - Barber ID
 * @param {Date} dayStart - Start of the day
 * @param {Date} dayEnd - End of the day
 * @returns {Promise<Array<{start_at: Date, end_at: Date, status_id: number}>>}
 */
export const getBarberBusyRanges = async (barber_id, dayStart, dayEnd) => {
  const [rows] = await pool.query(
    `SELECT start_at, end_at, status_id
       FROM reservations
      WHERE barber_id = ?
        AND start_at >= ?
        AND start_at <= ?
        AND status_id IN (1,2,3)
      ORDER BY start_at ASC`,
    [barber_id, dayStart, dayEnd]
  );
  return rows;
};
