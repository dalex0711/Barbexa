import { combosRepository as repo } from "../repositories/combos.repository.js";

export const createCombo = async (payload) => {
  return repo.createCombo(payload);
};

export const listCombos = () => repo.listCombos();

export const updateCombo = (id, payload) => {
  return repo.updateCombo(id, payload);
};

export const deleteCombo = (id) => repo.deleteCombo(id);

export const setComboServices = (id, items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Debes enviar servicios");
  }
  return repo.setComboServices(id, items);
};
