// frontend/src/pages/auth/hotel/HotelLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HotelLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/hotel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log("Hotel login response:", data);

      // ✅ STEP 1: OTP REQUIRED FLOW
      if (response.ok && data.step === "otp_required") {
        sessionStorage.setItem("hotelUserId", data.user_id);
        sessionStorage.setItem("hotelLoginEmail", email);

        navigate("/hotel/verify-login-otp", {
          state: {
            email: email,
            userId: data.user_id
          }
        });
      }

      // ✅ STEP 2: DIRECT LOGIN (if OTP disabled or bypass)
      else if (response.ok && data.token) {
        localStorage.setItem("hotelToken", data.token);
        localStorage.setItem("hotelUser", JSON.stringify(data.user));

        if (data.hotel) {
          localStorage.setItem("hotelInfo", JSON.stringify(data.hotel));
        }

        if (rememberMe) {
          localStorage.setItem("rememberedHotelEmail", email);
        }

        navigate("/hotel/dashboard");
      }

      // ❌ ERROR CASE
      else {
        setError(data.error || "Invalid email or password");
      }
    } catch (error) {
      console.error("Hotel login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hotel-login-container">
      <div className="hotel-login-card">
        <div className="hotel-login-header">
          <div className="logo-icon">🏨</div>
          <h2>Hotel Login</h2>
          <p>Welcome back! Please login to your account</p>
        </div>

        {error && (
          <div className="alert error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📧 Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hotel@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>🔒 Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => navigate("/hotel/forgot-password")}
              className="forgot-link"
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Sending OTP..." : "Sign In"}
          </button>
        </form>
      </div>

      <style>{`
        .hotel-login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .hotel-login-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .hotel-login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .logo-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .hotel-login-header h2 {
          margin: 0 0 10px;
          color: #1f2937;
        }

        .hotel-login-header p {
          color: #6b7280;
        }

        .alert {
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
        }

        .alert.error {
          background: #fee2e2;
          color: #dc2626;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
        }

        .password-input {
          position: relative;
        }

        .toggle-password {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default HotelLogin;