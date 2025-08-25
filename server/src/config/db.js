import {createPool} from 'mysql2/promise'
import { config }  from './index.js'

export const pool = createPool({
    host: config.bd.host,
    user: config.bd.user,
    password: config.bd.password,
    database: config.bd.database,
    port: config.bd.port || 3306
})


// Function to test the database connection
// async function testDatabaseConnection() {
//     try {
//         const connection = await pool.getConnection();
//         console.log('Database connection successful');
//         connection.release();
//     } catch (error) {
//         console.error('Error connecting to the database:', error.message);
//     }
// }

// // Execute the test
// testDatabaseConnection();