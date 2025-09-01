// app/controllers/login.js
import { apiRequest } from "../api/request.js";
import { getLoggedUser } from "../services/auth.js";
import { isEmail, validatePassword, validateInputs } from "../services/validations.js";

export function init() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const fields = {
    email: document.getElementById("email"),
    password: document.getElementById("password"),
  };

  // Show error message under input
  const setError = (input, msg) => {
    if (!input) return;
    const small = input.closest(".field")?.querySelector(".error");
    if (small) small.textContent = msg || "";
    input.classList.toggle("has-error", !!msg);
  };

  // Clear all previous error messages
  const clearErrors = () => {
    form.querySelectorAll(".error").forEach(el => (el.textContent = ""));
    form.querySelectorAll(".has-error").forEach(el => el.classList.remove("has-error"));
  };

  // Decide route based on user role/code
  function routeForUser(user) {
    const code = user?.code_name;
    const role = user?.role || user?.rol;
    if (code === 'ADMIN_01'  || role === 'admin')  return '/admin';
    if (code === 'BARBER_02' || role === 'barber') return '/barbers';
    return '/client'; // CLIENT_03 or others
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const email = fields.email?.value ?? "";
    const password = fields.password?.value ?? "";

    // === Validations ===
    let ok = true;
    if (!validateInputs(email)) {
      setError(fields.email, "Enter your email.");
      ok = false;
    } else if (!isEmail(email)) {
      setError(fields.email, "Invalid email.");
      ok = false;
    }
    if (!validateInputs(password)) {
      setError(fields.password, "Enter your password.");
      ok = false;
    }
    if (!ok) return;

    // Disable submit button while processing
    const btn = form.querySelector('button[type="submit"]');
    const prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Signing in...";

    try {
      // 1) Login: backend sets HttpOnly cookie
      await apiRequest("POST", "/login", { email: email.trim(), password });

      // 2) Request profile using the cookie (credentials: 'include' already set in apiRequest)
      const user = await getLoggedUser();

      if (!user) {
        // Cookie was not set/stored. Show clear error.
        setError(fields.password, "Session could not be established.");
        return;
      }

      // 3) Redirect based on role/code
      const target = routeForUser(user);
      window.location.href = target; 
      // or: import { navigation } and navigation(target)
    } catch (err) {
      setError(fields.password, err.message || "Invalid credentials.");
    } finally {
      btn.disabled = false;
      btn.textContent = prev;
    }
  });
}
