import { Router } from "express";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";
import * as ctrl from "../controllers/combos.controller.js";

const router = Router();

/**
 * Combo routes
 * - Only admins are allowed to create, update, delete, or manage combo services
 * - Any authenticated user can list available combos
 */

// Create a new combo (Admin only)
router.post("/combos", authMiddleware, adminMiddleware, ctrl.createCombo);

// Update an existing combo by ID (Admin only)
router.put("/combos/:id", authMiddleware, adminMiddleware, ctrl.updateCombo);

// Delete an existing combo by ID (Admin only)
router.delete("/combos/:id", authMiddleware, adminMiddleware, ctrl.deleteCombo);

// Define or replace services of a combo (Admin only)
router.post("/combos/:id/services", authMiddleware, adminMiddleware, ctrl.setComboServices);

// List all enabled combos (Authenticated users)
router.get("/combos", authMiddleware, ctrl.listCombos);

export default router;
