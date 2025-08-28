import * as svc from "../services/combos.service.js";

export const createCombo = async (req, res, next) => {
  try {
    const r = await svc.createCombo(req.body);
    res.status(201).json(r);
  } catch (e) { next(e); }
};

export const listCombos = async (req, res, next) => {
  try {
    const r = await svc.listCombos();
    res.json(r);
  } catch (e) { next(e); }
};

export const updateCombo = async (req, res, next) => {
  try {
    const r = await svc.updateCombo(Number(req.params.id), req.body);
    res.json(r);
  } catch (e) { next(e); }
};

export const deleteCombo = async (req, res, next) => {
  try {
    const r = await svc.deleteCombo(Number(req.params.id));
    res.json(r);
  } catch (e) { next(e); }
};

export const setComboServices = async (req, res, next) => {
  try {
    const r = await svc.setComboServices(Number(req.params.id), req.body.services);
    res.status(201).json(r);
  } catch (e) { next(e); }
};
