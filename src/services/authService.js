const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://rhms-backend.onrender.com/api';

/* =========================
   CLIENT AUTH
========================= */

// LOGIN
export const clientLogin = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/client/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// REGISTER
export const clientRegister = async (data) => {
  const res = await fetch(`${API_BASE_URL}/client/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// VERIFY OTP
export const clientVerify = async (data) => {
  const res = await fetch(`${API_BASE_URL}/client/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};