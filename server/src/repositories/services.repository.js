import { pool } from '../config/db.js';
import { updateService } from '../services/services.service.js';

export const serviceRepository = {
    /**
     * Inserts a new service into the database.
     *
     * @param {object} service - Service data
     * @param {string} service.name - Service name
     * @param {number} service.price - Service price (integer)
     * @param {string} service.duration - Service duration in HH:mm:ss format
     * @param {string} service.description - Service description
     * @returns {Promise<{message: string}>} Confirmation message
     */
    async createService(service) {
        const [result] = await pool.query(
            'INSERT INTO services (name, price, duration, description) VALUES (?, ?, ?, ?)',
            [service.name, service.price, service.duration, service.description]
        );
        return { message: "Service created successfully" };
    },

    /**
     * Retrieves all active (enabled) services.
     *
     * @returns {Promise<Array<object>>} List of active services
     */
    async getAllServices() {
        const [rows] = await pool.query(
            'SELECT * FROM services WHERE enabled = 1'
        );
        return rows;
    },

    /**
     * Soft deletes a service by setting enabled = 0.
     *
     * @param {number} id - Service ID
     * @returns {Promise<{message: string}>} Confirmation message
     */
    async deleteService(id) {
        const [result] = await pool.query(
            'UPDATE services SET enabled = 0 WHERE id = ?',
            [id]
        );
        return { message: "Service deleted successfully" };
    },

    /**
     * Updates service information by ID.
     *
     * @param {number} service_id - Service ID
     * @param {object} service - Updated service data
     * @param {string} service.name - Updated name
     * @param {number} service.price - Updated price
     * @param {string} service.duration - Updated duration (HH:mm:ss)
     * @param {string} service.description - Updated description
     * @returns {Promise<{message: string}>} Confirmation message
     */
    async updateService(service_id, service) {
        console.log(service);
        const [result] = await pool.query(
            'UPDATE services SET name = ?, price = ?, duration = ?, description = ? WHERE id = ?',
            [service.name, service.price, service.duration, service.description, service_id]
        );
        return { message: "Service updated successfully" };
    },

    /**
     * Assigns one or more services to a barber.
     * - Uses INSERT IGNORE to avoid duplicates.
     *
     * @param {Array<Array<number>>} valuesId - Array of [barber_id, service_id] pairs
     * @returns {Promise<{message: string}>} Confirmation message
     */
    async createBarberServices(valuesId) {
        await pool.query(
            'INSERT IGNORE INTO barber_services (barber_id, service_id) VALUES ?',
            [valuesId]
        );

        return { message: "Services assigned to barber successfully" };
    }
};
