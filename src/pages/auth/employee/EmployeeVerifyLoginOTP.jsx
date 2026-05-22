// frontend/src/pages/auth/employee/EmployeeVerifyLoginOTP.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const EmployeeVerifyLoginOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || sessionStorage.getItem("employeeLoginEmail") || "";
  const userId = location.state?.userId || sessionStorage.getItem("employeeUserId") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email || !userId) {
      navigate("/employee/login");
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
      const response = await fetch('http://localhost:5001/api/employee/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, otp: otpCode })
      });
      
      const data = await response.json();
      console.log("Employee 2FA verification response:", data);
      
      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("employeeToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.staff) {
          localStorage.setItem("staff", JSON.stringify(data.staff));
        }
        sessionStorage.removeItem("employeeLoginEmail");
        sessionStorage.removeItem("employeeUserId");
        setSuccess("2FA verified! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/employee/dashboard");
        }, 1500);
      } else {
        setError(data.error || "Invalid 2FA code. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        document.getElementById("otp-0")?.focus();
      }
    } catch (error) {
      console.error("2FA verification error:", error);
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
      const response = await fetch('http://localhost:5001/api/employee/resend-login-otp', {
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
      setError("Network error. Could not resend code.");
    }
  };

  return (
    <div className="employee-verify-container">
      <div className="employee-verify-card">
        <button onClick={() => navigate("/employee/login")} className="back-btn">
          ← Back to Login
        </button>

        <div className="verify-header">
          <div className="logo-icon">🔐</div>
          <h2>Two-Factor Authentication</h2>
          <p>Enter the 6-digit verification code sent to</p>
          <p className="email-highlight">{email}</p>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              className="otp-input"
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <button onClick={handleVerify} className="verify-btn" disabled={loading}>
          {loading ? "Verifying..." : "Verify & Login"}
        </button>

        <div className="resend-section">
          {canResend ? (
            <button onClick={handleResend} className="resend-btn">Resend Code</button>
          ) : (
            <span className="timer">Resend in {timer}s</span>
          )}
        </div>
      </div>

      <style>{`
        .employee-verify-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .employee-verify-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .back-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
        }
        .verify-header { text-align: center; margin-bottom: 30px; }
        .logo-icon { font-size: 48px; margin-bottom: 15px; }
        .email-highlight { color: #667eea; font-weight: bold; }
        .alert { padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .alert.error { background: #fee2e2; color: #dc2626; }
        .alert.success { background: #d1fae5; color: #065f46; }
        .otp-inputs { display: flex; gap: 12px; justify-content: center; margin: 30px 0; }
        .otp-input { width: 55px; height: 55px; text-align: center; font-size: 24px; border: 2px solid #e5e7eb; border-radius: 12px; }
        .otp-input:focus { outline: none; border-color: #667eea; }
        .verify-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer; }
        .resend-section { text-align: center; margin-top: 20px; }
        .resend-btn { background: none; border: none; color: #667eea; cursor: pointer; }
        .timer { color: #666; }
      `}</style>
    </div>
  );
};

export default EmployeeVerifyLoginOTP;