// server/src/config/index.js
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env está en server/.env  (dos niveles arriba)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  app: { port: Number(process.env.PORT) || 3000 },
  bd: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expires: process.env.JWT_EXPIRES || "1h",
  },
};
