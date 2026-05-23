// frontend/src/pages/auth/client/ClientLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ClientLogin = () => {
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
      const response = await fetch('https://rhms-backend.onrender.com/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log("Login response:", data);
      
      if (response.ok && data.step === 'otp_required') {
        // Store temp token for 2FA verification
        sessionStorage.setItem("tempLoginToken", data.temp_token);
        sessionStorage.setItem("loginEmail", email);
        // Redirect to 2FA verification page
        navigate("/client/verify-login-otp");
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-auth-container">
      <div className="client-auth-card">
        <div className="client-auth-header">
          <div className="client-logo">
            <div className="logo-icon">🏨</div>
            <h1>RHMS Client</h1>
          </div>
          <p className="client-subtitle">Secure login with 2FA protection</p>
        </div>

        <form onSubmit={handleSubmit} className="client-form">
          {error && (
            <div className="client-alert error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          <div className="client-form-group">
            <label>📧 Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              required
            />
          </div>

          <div className="client-form-group">
            <label>🔒 Password</label>
            <div className="client-password-input">
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
                className="client-toggle-password"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="client-form-options">
            <label className="client-checkbox">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span>Remember me</span>
            </label>
            <button 
              type="button" 
              onClick={() => navigate("/client/forgot")} 
              className="client-forgot-link"
            >
              🔑 Forgot Password?
            </button>
          </div>

          <button type="submit" className="client-submit-btn" disabled={loading}>
            {loading ? "Sending 2FA Code..." : "Sign In"}
          </button>
        </form>

        <div className="client-auth-footer">
          <p>
            Don't have an account?{" "}
            <button type="button" onClick={() => navigate("/client/register")}>
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;