import app from './app.js';                      // Express app with routes & middlewares
import { config } from './src/config/index.js';  // Centralized configuration (env variables, port, etc.)

const PORT = config.app.port;

// Start server on configured port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
