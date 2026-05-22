// frontend/src/pages/auth/client/ClientOTP.jsx
// Purpose: OTP verification for REGISTRATION only
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ClientOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || localStorage.getItem("pendingVerificationEmail") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/client/auth");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('http://localhost:5001/api/client/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess("Email verified successfully! Redirecting to login...");
        localStorage.removeItem("pendingVerificationEmail");
        setTimeout(() => {
          navigate("/client/auth");
        }, 1500);
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(60);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch('http://localhost:5001/api/client/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setSuccess("New verification code sent to your email!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to resend code");
      }
    } catch (error) {
      setError("Network error. Could not resend code.");
    }
  };

  return (
    <div className="client-otp-container">
      <div className="client-otp-card">
        <button onClick={() => navigate("/client/auth")} className="client-back-btn">
          ← Back to Login
        </button>

        <div className="client-otp-header">
          <div className="client-logo" style={{ justifyContent: 'center', marginBottom: '20px' }}>
            <div className="logo-icon">📧</div>
            <h2>Verify Your Email</h2>
          </div>
          <p>We've sent a 6-digit verification code to</p>
          <p><strong>{email}</strong></p>
        </div>

        {error && (
          <div className="client-alert error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="client-alert success">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        <div className="client-otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              className="client-otp-input"
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <button 
          onClick={handleVerify} 
          className="client-submit-btn" 
          disabled={loading || otp.some(d => d === "")}
        >
          {loading ? "Verifying..." : "Verify & Activate"}
        </button>

        <div className="client-resend">
          {canResend ? (
            <button onClick={handleResend} className="client-resend-btn">
              Resend Code
            </button>
          ) : (
            <span className="client-timer">Resend in {timer}s</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientOTP;