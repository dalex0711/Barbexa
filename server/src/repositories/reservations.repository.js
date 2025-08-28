// server/src/repositories/reservations.repository.js
import { pool } from "../config/db.js";

const inClause = (arr) => `(${arr.map(() => "?").join(",")})`;
const assertNonEmptyArray = (arr, msg) => {
  if (!Array.isArray(arr) || arr.length === 0) throw new Error(msg);
};

/* ============================
   Validaciones
============================ */
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
 * Retorna minutos totales sumando TIME duration de servicios habilitados.
 */
export const getTotalServiceMinutes = async (serviceIds) => {
  if (!Array.isArray(serviceIds) || serviceIds.length === 0) return 0;
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
 * Valida si existe choque de horario para el barbero en el rango.
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
   Crear reserva (con combos)
============================ */
export const createReservationTx = async ({
  status_id,
  client_id,
  barber_id,
  notes,
  start_at,
  end_at,
  services = [],
  combos = []
}) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert principal
    const [ins] = await conn.query(
      `INSERT INTO reservations
         (status_id, client_id, barber_id, notas, start_at, end_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [status_id, client_id, barber_id, notes || null, start_at, end_at]
    );
    const reservation_id = ins.insertId;

    // Insert detalle: servicios
    if (Array.isArray(services) && services.length) {
      const values = services.map((sid) => [sid, reservation_id]);
      await conn.query(
        `INSERT INTO reservation_service (service_id, reservation_id) VALUES ?`,
        [values]
      );
    }

    // Insert detalle: combos
    if (Array.isArray(combos) && combos.length) {
      const values = combos.map((cid) => [cid, reservation_id]);
      await conn.query(
        `INSERT INTO reservation_combo (combo_id, reservation_id) VALUES ?`,
        [values]
      );
    }

    await conn.commit();

    // Retornar reserva con detalles
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

    // Servicios
    const [svcRows] = await conn.query(
      `SELECT sv.id, sv.name, sv.price, sv.duration
         FROM reservation_service rs
         JOIN services sv ON sv.id = rs.service_id
        WHERE rs.reservation_id = ?`,
      [reservation_id]
    );

    // Combos
    const [comboRows] = await conn.query(
      `SELECT c.id, c.name, c.price, c.discount_percent, c.duration_override
         FROM reservation_combo rc
         JOIN combos c ON c.id = rc.combo_id
        WHERE rc.reservation_id = ?`,
      [reservation_id]
    );
    for (const c of comboRows) {
      const [items] = await conn.query(
        `SELECT s.id AS service_id, s.name, s.price, s.duration, cs.quantity
           FROM combo_services cs
           JOIN services s ON s.id = cs.service_id
          WHERE cs.combo_id = ?`,
        [c.id]
      );
      c.items = items;
    }

    const result = resRows[0] || null;
    if (result) {
      result.services = svcRows;
      result.combos = comboRows;
    }
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

/* ============================
   Lecturas / Updates
============================ */
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
  const [combos] = await pool.query(
    `SELECT c.id, c.name, c.price, c.discount_percent, c.duration_override
       FROM reservation_combo rc
       JOIN combos c ON c.id = rc.combo_id
      WHERE rc.reservation_id = ?`,
    [id]
  );
  for (const c of combos) {
    const [items] = await pool.query(
      `SELECT s.id AS service_id, s.name, s.price, s.duration, cs.quantity
         FROM combo_services cs
         JOIN services s ON s.id = cs.service_id
        WHERE cs.combo_id = ?`,
      [c.id]
    );
    c.items = items;
  }

  rows[0].services = services;
  rows[0].combos = combos;
  return rows[0];
};

export const listReservations = async ({ barber_id, client_id, status_id, from, to, limit = 200 }) => {
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

export const updateReservationStatus = async (id, status_id) => {
  await pool.query(
    `UPDATE reservations SET status_id = ? WHERE id = ?`,
    [status_id, id]
  );
  return getReservationById(id);
};

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
