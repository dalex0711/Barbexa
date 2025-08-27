import { createPool } from 'mysql2/promise';
import { config } from './index.js';

/**
 * MySQL connection pool using mysql2/promise.
 * - Centralizes DB connection configuration.
 * - Reuses connections efficiently across the app.
 */
export const pool = createPool({
    host: config.bd.host,
    user: config.bd.user,
    password: config.bd.password,
    database: config.bd.database,
    port: config.bd.port || 3306
});

/**
 * Function to test database connectivity.
 * - Attempts to acquire a connection from the pool.
 * - Logs success or error message accordingly.
 */
async function testDatabaseConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connection successful');
        connection.release();
    } catch (error) {
        console.error('❌ Error connecting to the database:', error.message);
    }
}

// Run connectivity test at startup
testDatabaseConnection();
