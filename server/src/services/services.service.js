import { serviceRepository } from '../repositories/services.repository.js';
import { validateName, isDecimal, isValidTime, decripValidate, validateArray } from '../shared/validation.js';

/**
 * Creates a new service after validating input fields
 *
 * @param {string} name - Name of the service
 * @param {number} price - Price of the service (integer)
 * @param {string} duration - Duration in HH:mm:ss format
 * @param {string} description - Service description
 * @returns {Promise<object>} Newly created service
 * @throws {Error} If validation fails
 */
export const postService = async (name, price, duration, description) => {
    if (isDecimal(price)) throw new Error('Price must be an integer');
    if (!isValidTime(duration)) throw new Error('Invalid duration format');
    if (!decripValidate(description)) throw new Error('Description too long');

    const newService = await serviceRepository.createService({ name, price, duration, description });
    return newService;
}

/**
 * Retrieves all services available in the system.
 *
 * @returns {Promise<Array<object>>} List of services
 */
export const getServices = async () => {
    const services = await serviceRepository.getAllServices();
    return services;
}

/**
 * Deletes a service by its ID.
 *
 * @param {number} id - Service ID
 * @returns {Promise<object>} Result of the deletion operation
 */
export const deleteService = async (id) => {
    const result = await serviceRepository.deleteService(id);
    return result;
}

/**
 * Updates an existing service with new data after validation.
 *
 * @param {number} id - Service ID to update
 * @param {string} name - Updated service name
 * @param {number} price - Updated price
 * @param {string} duration - Updated duration (HH:mm:ss)
 * @param {string} description - Updated description
 * @returns {Promise<object>} Updated service object
 * @throws {Error} If validation fails
 */
export const updateService = async (id, name, price, duration, description) => {
    if (!validateName(name)) throw new Error('Invalid name format');
    if (isDecimal(price)) throw new Error('Price must be an integer');
    if (!isValidTime(duration)) throw new Error('Invalid duration format');
    if (!decripValidate(description)) throw new Error('Description too long');

    const updatedService = await serviceRepository.updateService(id, { name, price, duration, description });
    return updatedService;
}

/**
 * Assigns multiple services to a specific barber.
 * - Expects a non-empty array of service IDs
 *
 * @param {number} barberId - Barber user ID
 * @param {Array<number>} services - Array of service IDs
 * @returns {Promise<object>} Result of the insert operation
 * @throws {Error} If validation fails
 */
export const postBarberService = async (barberId, services) => {
    if (!validateArray(services)) throw new Error('Services must be a valid matrix');
    const valuesId = services.map(serviceId => [barberId, serviceId]);
    const newServices = await serviceRepository.createBarberServices(valuesId);
    return newServices;
}
