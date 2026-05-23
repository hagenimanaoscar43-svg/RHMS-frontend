// frontend/src/pages/auth/hotel/HotelForgot.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HotelForgot = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('https://rhms-backend.onrender.com/api/hotel/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password reset link sent to your email!");
        setTimeout(() => {
          navigate("/hotel/auth");
        }, 2000);
      } else {
        setError(data.error || "Email not found in our system");
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
        <button onClick={() => navigate("/hotel/auth")} className="hotel-back-btn">
          ← Back to Login
        </button>

        <div className="hotel-forgot-header">
          <h2>Forgot Password?</h2>
          <p>Enter your email to receive a password reset link</p>
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
            <label>📧 Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hotel@example.com"
              required
            />
          </div>

          <button type="submit" className="hotel-submit-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="hotel-auth-footer">
          <p>
            Remember your password? 
            <button type="button" onClick={() => navigate("/hotel/auth")}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HotelForgot;