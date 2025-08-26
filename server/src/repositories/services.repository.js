import { pool } from '../config/db.js';


export const serviceRepository = {
    async createService(service) {
        const [result] = await pool.query('INSERT INTO services (name, price, duration, description) VALUES (?, ?, ?, ?)', [service.name, service.price, service.duration, service.description]);
        return { message: "Service created successfully" };
    }
}