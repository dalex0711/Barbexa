import { pool } from "../config/db.js";

const inClause = (arr) => `(${arr.map(() => "?").join(",")})`;

export const combosRepository = {
  async createCombo({ name, description, price, discount_percent, duration_override }) {
    await pool.query(
      `INSERT INTO combos (name, description, price, discount_percent, duration_override)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description || null, price, discount_percent, duration_override]
    );
    return { message: "Combo creado" };
  },

  async listCombos() {
    const [rows] = await pool.query(`SELECT * FROM combos WHERE enabled=1`);
    return rows;
  },

  async updateCombo(id, { name, description, price, discount_percent, duration_override }) {
    await pool.query(
      `UPDATE combos
          SET name=?, description=?, price=?, discount_percent=?, duration_override=?
        WHERE id=?`,
      [name, description || null, price, discount_percent, duration_override, id]
    );
    return { message: "Combo actualizado" };
  },

  async deleteCombo(id) {
    await pool.query(`UPDATE combos SET enabled=0 WHERE id=?`, [id]);
    return { message: "Combo eliminado" };
  },

  async setComboServices(comboId, items) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(`DELETE FROM combo_services WHERE combo_id=?`, [comboId]);
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

  async getComboById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM combos WHERE id=? AND enabled=1`,
      [id]
    );
    return rows[0] || null;
  }
};
