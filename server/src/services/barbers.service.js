import { scheduleRepository as repo } from "../repositories/barbers.repository.js";
export const getBarberSchedule = async (barberId) => {
    return repo.getBarberSchedule(barberId);
};
