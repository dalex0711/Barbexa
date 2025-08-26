import dayjs from "dayjs";


/**
 * Validates whether an email is formatted correctly.
 * 
 * @param {string} email 
 * @returns {boolean} 
 */
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validates whether a password meets the minimum security requirements.
 *
 * @param {string} password
 * @returns {boolean} 
 */
export function validatePassword(password) {
    const minLength = 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return password.length >= minLength && hasUppercase && hasLowercase && hasNumber;
}
/**
 * Validates whether a username meets the formatting rules.
 *
 * @param {string} username
 * @returns {boolean}
 */
export function validateName(username) {
    const minLength = 1;
    const maxLength = 50;
    const hasNoSpecialChars = /^[a-zA-Z0-9_]+$/.test(username);
    return (
        username.length >= minLength &&
        username.length <= maxLength &&
        hasNoSpecialChars
    );
}

export function isDecimal(price) {
  return !Number.isInteger(price);
}


export function isValidTime(time) {
  return dayjs(time, "HH:mm:ss", true).isValid();
}

export function decripValidate(description) {
  const maxLength = 255;
  return description.length >= maxLength;
}