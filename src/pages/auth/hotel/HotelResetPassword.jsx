// frontend/src/pages/auth/hotel/HotelResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const HotelResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Extract token from URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [location]);

  const getStrength = (password) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (password.length >= 10) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthColors = ["#ef4444", "#f59e0b", "#10b981", "#059669"];
  const strengthText = ["", "Weak", "Medium", "Strong", "Very Strong"];

  const validatePassword = () => {
    if (!newPassword) {
      setError("New password is required");
      return false;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(newPassword)) {
      setError("Password must contain uppercase and number");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('https://rhms-backend.onrender.com/api/hotel/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password reset successful! Redirecting...");
        setTimeout(() => {
          navigate("/hotel/auth");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hotel-forgot-container">
      <div className="hotel-forgot-card">
        <div className="hotel-forgot-header">
          <h2>Reset Password</h2>
          <p>Create a new password for your hotel account</p>
        </div>

        {error && (
          <div className="hotel-alert error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="hotel-alert success">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="hotel-form-group">
            <label>🔒 New Password</label>
            <div className="hotel-password-input">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hotel-toggle-password"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {newPassword && (
              <div style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: "4px",
                        borderRadius: "2px",
                        background: i <= strength ? strengthColors[strength - 1] : "#e5e7eb"
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: "11px", color: strengthColors[strength - 1] || "#9ca3af" }}>
                  Password strength: {strengthText[strength]}
                </span>
              </div>
            )}
          </div>

          <div className="hotel-form-group">
            <label>🔒 Confirm Password</label>
            <div className="hotel-password-input">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <button type="submit" className="hotel-submit-btn" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="hotel-auth-footer">
            <p>
              <button type="button" onClick={() => navigate("/hotel/auth")}>
                ← Back to Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelResetPassword;