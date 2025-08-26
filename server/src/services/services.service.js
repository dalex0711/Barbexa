import {serviceRepository} from '../repositories/services.repository.js';
import { validateName,isDecimal,isValidTime,decripValidate } from '../shared/validation.js';

export const postService = async (name, price,duration,description) => {
    if(!validateName(name)) throw new Error('Invalid name format');
    if(isDecimal(price)) throw new Error('Price must be an integer');
    if(!isValidTime(duration)) throw new Error('Invalid duration format');
    if(!decripValidate(description)) throw new Error('Description too long');

    const newService = await serviceRepository.createService({name, price,duration,description});
    return newService;
}