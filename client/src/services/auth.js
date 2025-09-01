import { apiRequest } from "../api/request.js";

const ENDPOINTS = {
  profile: "/profile",
  logout: "/logout",
};

/**
 * Get the logged-in user from the backend.
 * Requires a valid JWT cookie (HttpOnly).
 * 
 * @returns {Promise<object|null>} Returns user object if logged in, otherwise null
 */
export async function getLoggedUser() {
  try {
    const data = await apiRequest("GET", ENDPOINTS.profile);
    return data.user; 
  } catch (e) {
    if (e.status === 401 || e.status === 403) return null;
    throw e;
  }
}

/**
 * Logout the user by clearing the JWT cookie in the backend.
 * 
 * @returns {Promise<object>} Returns { message: "logout successfully" }
 */
export async function logoutUser() {
  return apiRequest("POST", ENDPOINTS.logout, {});
}
