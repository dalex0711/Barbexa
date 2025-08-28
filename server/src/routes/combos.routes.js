import { Router } from "express";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";
import * as ctrl from "../controllers/combos.controller.js";

const router = Router();

// Solo admin puede crear/editar/eliminar combos
router.post("/combos", authMiddleware, adminMiddleware, ctrl.createCombo);
router.put("/combos/:id", authMiddleware, adminMiddleware, ctrl.updateCombo);
router.delete("/combos/:id", authMiddleware, adminMiddleware, ctrl.deleteCombo);
router.post("/combos/:id/services", authMiddleware, adminMiddleware, ctrl.setComboServices);

// Cualquier usuario autenticado puede listar combos
router.get("/combos", authMiddleware, ctrl.listCombos);

export default router;
