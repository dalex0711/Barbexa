import express from 'express';
import authRoutes from './src/routes/auth.routes.js';
import servicesRoutes from './src/routes/services.routes.js';
import userRoutes from './src/routes/users.routes.js';
import reservationsRoutes from './src/routes/reservations.routes.js';
import combosRoutes from "./src/routes/combos.routes.js";
import { errorMiddleware } from "./src/middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors"; 

const app = express();

// Core middlewares
app.use(express.json());       // Parse incoming JSON payloads
app.use(cookieParser());       // Parse cookies for authentication/session handling
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://barbexa.netlify.app",
      "https://barbexa1.netlify.app"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


// API routes
app.use(authRoutes);           // Authentication & authorization endpoints
app.use(servicesRoutes);       // Services catalog endpoints
app.use(userRoutes);           // User management endpoints
app.use(reservationsRoutes);   // Reservations endpoints
app.use(combosRoutes);
// Global error handler (must be last)
app.use(errorMiddleware);

export default app;
