import { pool } from "../config/db.js";

// Utility: builds an IN clause string "(?, ?, ?)" for dynamic queries
const inClause = (arr) => `(${arr.map(() => "?").join(",")})`;

/**
 * Repository layer for combos.
 * Handles direct database access (CRUD, validation, relation with services).
 */
export const combosRepository = {
  /**
   * Insert a new combo
   * @param {Object} payload - Combo data
   * @param {string} payload.name - Combo name
   * @param {string} [payload.description] - Optional description
   * @param {number|null} [payload.price] - Optional fixed price (otherwise calculate from services)
   * @param {number} payload.discount_percent - Discount applied over services
   * @param {string|null} [payload.duration_override] - Optional override for duration (HH:mm:ss)
   * @returns {Promise<Object>} Confirmation message
   */
  async createCombo({ name, description, price, discount_percent, duration_override }) {
    await pool.query(
      `INSERT INTO combos (name, description, price, discount_percent, duration_override)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description || null, price, discount_percent, duration_override]
    );
    return { message: "Combo creado" };
  },

  /**
   * List all enabled combos
   * @returns {Promise<Array>} Array of combo rows
   */
  async listCombos() {
    const [rows] = await pool.query(`SELECT * FROM combos WHERE enabled=1`);
    return rows;
  },

  /**
   * Update an existing combo by ID
   * @param {number} id - Combo ID
   * @param {Object} payload - Updated fields
   * @returns {Promise<Object>} Confirmation message
   */
  async updateCombo(id, { name, description, price, discount_percent, duration_override }) {
    await pool.query(
      `UPDATE combos
          SET name=?, description=?, price=?, discount_percent=?, duration_override=?
        WHERE id=?`,
      [name, description || null, price, discount_percent, duration_override, id]
    );
    return { message: "Combo actualizado" };
  },

  /**
   * Soft delete a combo (disable instead of removing from DB)
   * @param {number} id - Combo ID
   * @returns {Promise<Object>} Confirmation message
   */
  async deleteCombo(id) {
    await pool.query(`UPDATE combos SET enabled=0 WHERE id=?`, [id]);
    return { message: "Combo eliminado" };
  },

  /**
   * Replace all services associated with a combo.
   * Uses a transaction to ensure atomicity.
   * @param {number} comboId - Combo ID
   * @param {Array<{service_id:number, quantity:number}>} items - List of services with quantities
   * @returns {Promise<Object>} Confirmation message
   */
  async setComboServices(comboId, items) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      // Clear existing relations
      await conn.query(`DELETE FROM combo_services WHERE combo_id=?`, [comboId]);
      // Insert new relations
      if (Array.isArray(items) && items.length) {
        const values = items.map(it => [comboId, it.service_id, it.quantity || 1]);
        await conn.query(
          `INSERT INTO combo_services (combo_id, service_id, quantity) VALUES ?`,
          [values]
        );
      }
      await conn.commit();
      return { message: "Servicios del combo guardados" };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  /**
   * Validate that all combo IDs are enabled and exist
   * @param {Array<number>} comboIds - IDs to check
   * @throws {Error} If any combo is missing or disabled
   */
  async assertCombosEnabled(comboIds) {
    if (!Array.isArray(comboIds) || comboIds.length === 0) return;
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM combos WHERE enabled=1 AND id IN ${inClause(comboIds)}`,
      comboIds
    );
    if (Number(rows[0]?.cnt) !== comboIds.length) {
      throw new Error("Algún combo no existe o está deshabilitado");
    }
  },

  /**
   * Retrieve services inside a combo
   * @param {number} comboId - Combo ID
   * @returns {Promise<Array>} List of services with quantity
   */
  async getComboServices(comboId) {
    const [rows] = await pool.query(
      `SELECT cs.service_id, cs.quantity, s.name, s.price, s.duration, s.enabled
         FROM combo_services cs
         JOIN services s ON s.id = cs.service_id
        WHERE cs.combo_id = ?`,
      [comboId]
    );
    return rows;
  },

  /**
   * Retrieve a combo by ID
   * @param {number} id - Combo ID
   * @returns {Promise<Object|null>} Combo row or null
   */
  async getComboById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM combos WHERE id=? AND enabled=1`,
      [id]
    );
    return rows[0] || null;
  }
};
