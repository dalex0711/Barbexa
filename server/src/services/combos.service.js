import { combosRepository as repo } from "../repositories/combos.repository.js";

/**
 * Service layer for combos.
 * Handles business validation (when needed) and delegates persistence
 * operations to the repository.
 */

/**
 * Create a new combo
 * @param {Object} payload - Combo data (name, description, price, etc.)
 * @returns {Promise<Object>} Newly created combo
 */
export const createCombo = async (payload) => {
  return repo.createCombo(payload);
};

/**
 * Retrieve all enabled combos
 * @returns {Promise<Array>} List of combos
 */
export const listCombos = () => repo.listCombos();

/**
 * Update an existing combo by ID
 * @param {number} id - Combo identifier
 * @param {Object} payload - Updated combo fields
 * @returns {Promise<Object>} Updated combo
 */
export const updateCombo = (id, payload) => {
  return repo.updateCombo(id, payload);
};

/**
 * Soft delete a combo (disable it instead of physical removal)
 * @param {number} id - Combo identifier
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteCombo = (id) => repo.deleteCombo(id);

/**
 * Replace all services linked to a combo
 * @param {number} id - Combo identifier
 * @param {Array} items - List of service objects with quantities
 * @returns {Promise<Object>} Confirmation of assignment
 * @throws {Error} If items is not a valid non-empty array
 */
export const setComboServices = (id, items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("They must envy services"); // message returned to frontend
  }
  return repo.setComboServices(id, items);
};
