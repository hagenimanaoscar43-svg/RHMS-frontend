// src/services/api.js
// TEMPORARILY HARDCODED FOR PRODUCTION
const API_BASE_URL = 'https://rhms-backend.onrender.com/api';

/* ================================
   CORE API CALL (GLOBAL HANDLER)
================================ */
const apiCall = async (endpoint, options = {}, authType = "client") => {
  const clientToken = localStorage.getItem("clientToken");
  const adminToken = localStorage.getItem("adminToken");
  const employeeToken = localStorage.getItem("employeeToken");

  let token = null;
  if (authType === "admin") token = adminToken;
  else if (authType === "employee") token = employeeToken;
  else token = clientToken;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
};

/* ================================
   AUTH HELPERS
================================ */
export const authAPI = {
  loginClient: (data) =>
    apiCall("/client/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyClientOTP: (data) =>
    apiCall("/client/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resendClientOTP: (data) =>
    apiCall("/client/resend-login-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  loginAdmin: (data) =>
    apiCall("/admin/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  loginEmployee: (data) =>
    apiCall("/employee/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/* ================================
   HOTELS API
================================ */
export const hotelAPI = {
  getAll: () => apiCall("/client/hotels"),
  getById: (id) => apiCall(`/client/hotels/${id}`),
  search: (query) => apiCall(`/client/hotels/search?q=${query}`),
};

/* ================================
   BOOKINGS API (CLIENT)
================================ */
export const bookingAPI = {
  getAll: () => apiCall("/client/bookings"),
  create: (data) => apiCall("/client/bookings", { method: "POST", body: JSON.stringify(data) }),
  getById: (id) => apiCall(`/client/bookings/${id}`),
  cancel: (id) => apiCall(`/client/bookings/${id}/cancel`, { method: "PUT" }),
  delete: (id) => apiCall(`/client/bookings/${id}`, { method: "DELETE" }),
};

/* ================================
   USER PROFILE API
================================ */
export const userAPI = {
  getProfile: () => apiCall("/user/profile"),
  updateProfile: (data) => apiCall("/user/profile", { method: "PUT", body: JSON.stringify(data) }),
  changePassword: (data) => apiCall("/user/change-password", { method: "POST", body: JSON.stringify(data) }),
};

/* ================================
   ATTENDANCE API (EMPLOYEE)
================================ */
export const attendanceAPI = {
  clockIn: () => apiCall("/employee/clock-in", { method: "POST" }, "employee"),
  clockOut: () => apiCall("/employee/clock-out", { method: "PUT" }, "employee"),
  getHistory: () => apiCall("/employee/attendance", {}, "employee"),
};

/* ================================
   ADMIN DASHBOARD API
================================ */
export const adminAPI = {
  getStats: () => apiCall("/admin/stats", {}, "admin"),
  getUsers: () => apiCall("/admin/users", {}, "admin"),
  getBookings: () => apiCall("/admin/bookings", {}, "admin"),
};

/* ================================
   OTHER APIS
================================ */
export const chatAPI = {
  getMessages: () => apiCall("/chat/messages"),
  sendMessage: (data) => apiCall("/chat/messages", { method: "POST", body: JSON.stringify(data) }),
};

export const taskAPI = {
  getAll: () => apiCall("/tasks"),
  create: (data) => apiCall("/tasks", { method: "POST", body: JSON.stringify(data) }),
};

export const notificationAPI = {
  getAll: () => apiCall("/notifications"),
};

export const reportAPI = {
  getAll: () => apiCall("/reports"),
};

export const salaryAPI = {
  getCurrent: () => apiCall("/employee/salary", {}, "employee"),
};

export default {
  authAPI,
  hotelAPI,
  bookingAPI,
  userAPI,
  attendanceAPI,
  adminAPI,
  chatAPI,
  taskAPI,
  notificationAPI,
  reportAPI,
  salaryAPI,
};