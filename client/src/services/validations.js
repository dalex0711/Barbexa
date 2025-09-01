// Validate that all inputs are not null, undefined, or empty strings
export function validateInputs(...inputs) {
  return inputs.every(input => input !== null && input !== undefined && input.trim() !== '');
};

// Validate password complexity
export function validatePassword(pass) {
  const hasUppercase = /[A-Z]/.test(pass); // must contain at least one uppercase letter
  const hasLowercase = /[a-z]/.test(pass); // must contain at least one lowercase letter
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass); // must contain at least one special character
  const minLength = pass.length >= 6; // must be at least 6 characters long

  return hasUppercase && hasLowercase && hasSpecialChar && minLength;
};

// Check if terms & conditions checkbox is accepted
export const acceptedTerms = (termsChecked) => {
  return termsChecked === true;
};

// Validate if a string is a properly formatted email
export const isEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(String(value).trim());
};

// Validate that the name is a non-empty string
export const isValidName = (name) => {
  return typeof name === "string" && name.trim().length > 0;
};
