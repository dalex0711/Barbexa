import * as services from '../services/services.service.js'

export const postService = async (req,res) => {
    const { name, price, duration,description } = req.body;
    try {
        const service = await services.postService(name,price,duration,description);
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}