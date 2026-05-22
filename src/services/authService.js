const API_URL = "http://localhost:5001/api";

/* =========================
   CLIENT AUTH
========================= */

// LOGIN
export const clientLogin = async (email, password) => {
  const res = await fetch(`${API_URL}/client/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// REGISTER
export const clientRegister = async (data) => {
  const res = await fetch(`${API_URL}/client/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// VERIFY OTP
export const clientVerify = async (data) => {
  const res = await fetch(`${API_URL}/client/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};