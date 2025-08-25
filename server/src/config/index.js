/** centralization of environment variables */

import dotenv from "dotenv"
dotenv.config()

export const config = {
    app: {
        port:process.env.PORT || 3000 
    },
    bd:  {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Qwe.123*',
        database: process.env.DB_NAME || 'barbexa',
        port: process.env.DB_PORT || 3306
    },
  jwt: {
    secret: process.env.JWT_SECRET || "default_secret",
    expires: process.env.JWT_EXPIRES || "1h"
  }
}

