// frontend/src/pages/auth/hotel/HotelVerifyLoginOTP.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const HotelVerifyLoginOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email and userId from location state or sessionStorage
  const email = location.state?.email || sessionStorage.getItem("hotelLoginEmail") || "";
  const userId = location.state?.userId || sessionStorage.getItem("hotelUserId") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email || !userId) {
      console.log("No email or userId, redirecting to login");
      navigate("/hotel/login");
    }
  }, [email, userId, navigate]);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, canResend]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('https://rhms-backend.onrender.com/api/hotel/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, otp: otp })
      });
      
      const data = await response.json();
      console.log("Verification response:", data);
      
      if (response.ok && data.token) {
        localStorage.setItem("hotelToken", data.token);
        localStorage.setItem("hotelUser", JSON.stringify(data.user));
        if (data.hotel) {
          localStorage.setItem("hotelInfo", JSON.stringify(data.hotel));
        }
        sessionStorage.removeItem("hotelLoginEmail");
        sessionStorage.removeItem("hotelUserId");
        setSuccess("Verification successful! Redirecting...");
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1500);
      } else {
        setError(data.error || "Invalid verification code");
        setOtp("");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(60);
    setCanResend(false);
    setOtp("");
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch('https://rhms-backend.onrender.com/api/hotel/resend-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setSuccess("New verification code sent to your email!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to resend code");
      }
    } catch (error) {
      setError("Network error");
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <button onClick={() => navigate("/hotel/login")} className="back-btn">
          ← Back to Login
        </button>

        <div className="verify-header">
          <div className="icon">🔐</div>
          <h2>Two-Factor Authentication</h2>
          <p>Enter the 6-digit code sent to</p>
          <p className="email">{email}</p>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <input
          type="text"
          maxLength="6"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
          className="otp-input"
          autoFocus
        />

        <button onClick={handleVerify} className="verify-btn" disabled={loading}>
          {loading ? "Verifying..." : "Verify & Login"}
        </button>

        <div className="resend-section">
          {canResend ? (
            <button onClick={handleResend} className="resend-btn">
              Resend Code
            </button>
          ) : (
            <span className="timer">Resend in {timer}s</span>
          )}
        </div>

        <p className="footer-note">Check your spam folder if you don't see the email</p>
      </div>

      <style>{`
        .verify-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .verify-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 450px;
          width: 100%;
          position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
        }
        .back-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          font-size: 14px;
        }
        .verify-header { margin-bottom: 30px; }
        .icon { font-size: 48px; margin-bottom: 15px; }
        .email { color: #667eea; font-weight: bold; word-break: break-all; }
        .alert { padding: 12px; border-radius: 8px; margin-bottom: 20px; }
        .alert.error { background: #fee2e2; color: #dc2626; }
        .alert.success { background: #d1fae5; color: #065f46; }
        .otp-input {
          width: 100%;
          padding: 14px;
          font-size: 24px;
          text-align: center;
          letter-spacing: 8px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .otp-input:focus { outline: none; border-color: #667eea; }
        .verify-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
        }
        .verify-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .resend-section { margin-top: 20px; }
        .resend-btn { background: none; border: none; color: #667eea; cursor: pointer; }
        .timer { color: #6b7280; }
        .footer-note { margin-top: 20px; font-size: 12px; color: #9ca3af; }
      `}</style>
    </div>
  );
};

export default HotelVerifyLoginOTP;