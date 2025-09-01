// app/controllers/register.js
import { apiRequest } from "../api/request.js";
import { isEmail, isValidName, validatePassword, acceptedTerms, validateInputs } from "../services/validations.js";

export function init() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const fields = {
    name:     document.getElementById("name"),
    email:    document.getElementById("email"),
    password: document.getElementById("password"),
    terms:    document.getElementById("terms"),
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
    form.querySelectorAll(".error").forEach((s) => (s.textContent = ""));
    form.querySelectorAll(".has-error").forEach((el) => el.classList.remove("has-error"));
    const termsErr = document.getElementById("termsError");
    if (termsErr) termsErr.textContent = "";
  };

  // Show/hide password on eye icon click
  form.querySelectorAll(".toggle-pass").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      const icon = btn.querySelector("i");
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }
    });
  });

  // Form submit handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const name     = fields.name?.value ?? "";
    const email    = fields.email?.value ?? "";
    const password = fields.password?.value ?? "";
    const termsOk  = !!fields.terms?.checked;

    // === Validations using custom functions ===
    let ok = true;

    if (!validateInputs(name)) {
      setError(fields.name, "Enter your name.");
      ok = false;
    } else if (!isValidName(name)) {
      setError(fields.name, "Invalid name.");
      ok = false;
    }

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
    } else if (!validatePassword(password)) {
      setError(fields.password, "At least 6 characters, one uppercase, one lowercase and one special character.");
      ok = false;
    }

    if (!acceptedTerms(termsOk)) {
      const termsErr = document.getElementById("termsError");
      if (termsErr) termsErr.textContent = "You must accept the terms.";
      ok = false;
    }

    if (!ok) return;

    // === Send data to API ===
    const submitBtn = form.querySelector('button[type="submit"]');
    const prevText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    try {
      const payload = {
        username: name.trim(),   // backend expects 'username'
        email: email.trim(),
        password,
        code_name: 'CLIENT_03'
      };

      await apiRequest('POST', '/register', payload);

      // Redirect to login page after successful registration
      window.location.href = "/login";
      // or: import { navegation } from "../router.js"; navegation("/login");
    } catch (err) {
      setError(fields.email, err.message || "Could not create account.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = prevText;
    }
  });
}
