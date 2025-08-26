import express from 'express';
import authRoutes from './src/routes/auth.routes.js';
import servicesRoutes from './src/routes/services.routes.js';
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser()); 

app.use(authRoutes);
app.use(servicesRoutes);

export default app;