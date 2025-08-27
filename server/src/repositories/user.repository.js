import { pool } from '../config/db.js';

export const userRepository = {
    /**
     * Counts all active users in the system.
     * - Only users with enabled = 1 are included.
     *
     * @returns {Promise<number>} Total number of active users
     */
    countUsers: async () => {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE enabled = 1'
        );
        return rows[0].count;
    },    
    /**
     * Retrieves all users that belong to the "BARBER_02" role.
     * - Joins users with the rol table by rol_id.
     *
     * @returns {Promise<Array<{ username: string }>>} Array of barber users
     */
    getBarberUser: async () => {
        const [rows] = await pool.query(`
            SELECT u.username
            FROM users u
            JOIN rol r ON u.rol_id = r.id
            WHERE r.code_name = 'BARBER_02';
        `);
        return rows;
    }
};
