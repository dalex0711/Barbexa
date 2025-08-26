import { Router } from "express";
import { postService } from "../controllers/services.controller.js";
import { adminMiddleware } from '../middlewares/auth.middleware.js'

const router = Router();

router.post('/services',adminMiddleware,postService)

export default router;
