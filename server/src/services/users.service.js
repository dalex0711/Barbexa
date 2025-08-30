import { userRepository } from '../repositories/user.repository.js';

/**
 * Retrieves the total number of users in the system.
 *
 * @returns {Promise<number>} - Total count of users
 */
export const getUsersCount = async () => {
    const count = await userRepository.countUsers();
    return count;
}

/**
 * Retrieves all users with the "barber" role.
 *
 * @returns {Promise<Array<object>>} - Array of barber user objects
 */
export const getBarberUser = async () => {
    const barberUser = await userRepository.getBarberUser();
    return barberUser;
}


export const getUsers = async () => {
    const users = await userRepository.getUsers();
    return users;
}
