import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat); // Extend dayjs with custom parse format plugin

/**
 * Validates whether an email has a proper format.
 *
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validates whether a password meets minimum security rules.
 *
 * @param {string} password - The password to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validatePassword(password) {
    const minLength = 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return password.length >= minLength && hasUppercase && hasLowercase && hasNumber;
}

/**
 * Validates whether a username follows naming rules.
 *
 * @param {string} username - The username to validate
 * @returns {boolean} True if valid, false otherwise
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

/**
 * Checks if a number is decimal (not an integer).
 *
 * @param {number} price - The number to validate
 * @returns {boolean} True if decimal, false if integer
 */
export function isDecimal(price) {
  return !Number.isInteger(price);
}

/**
 * Validates whether a string is a valid time in HH:mm:ss format.
 *
 * @param {string} time - The time string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidTime(time) {
  return dayjs(time, "HH:mm:ss", true).isValid();
}

/**
 * Validates that a description does not exceed max length.
 *
 * @param {string} description - The description text
 * @returns {boolean} True if valid, false otherwise
 */
export function decripValidate(description) {
  const maxLength = 255;
  return description.length <= maxLength;
}

/**
 * Validates whether an array is non-empty.
 *
 * @param {Array} array - The array to validate
 * @returns {boolean} True if array has at least one element, false otherwise
 */
export function validateArray(array) {
  return Array.isArray(array) && array.length > 0;
}
