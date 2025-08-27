import * as servicesS from '../services/services.service.js';

/**
 * Controller: Create a new service.

 * @route   POST /services
 * @access  Protected (Admin only)
 */
export const postService = async (req, res) => {
    const { name, price, duration, description } = req.body;
    try {
        const service = await servicesS.postService(name, price, duration, description);
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Controller: Get all active services.

 * @route   GET /services
 * @access  Protected
 */
export const getServices = async (req, res) => {
    try {
        const servicesList = await servicesS.getServices();
        res.status(200).json(servicesList);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Controller: Delete (soft delete) a service by ID.

 * @route   DELETE /services/:id
 * @access  Protected (Admin only)
 */
export const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        const service = await servicesS.deleteService(id);
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Controller: Update an existing service.

 * @route   PUT /services/:id
 * @access  Protected (Admin only)
 */
export const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, price, duration, description } = req.body;
    try {
        const service = await servicesS.updateService(id, name, price, duration, description);
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Controller: Assign services to a barber.

 * @route   POST /barbers/:barberId/services
 * @access  Protected (Admin only)
 */
export const postBarberService = async (req, res) => {
    const { barberId } = req.params;
    const { services } = req.body;
    try {
        const service = await servicesS.postBarberService(barberId, services);
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
