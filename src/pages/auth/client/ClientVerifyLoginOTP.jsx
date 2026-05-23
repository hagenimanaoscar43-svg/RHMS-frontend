// frontend/src/pages/auth/client/ClientVerifyLoginOTP.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ClientVerifyLoginOTP = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const tempToken = sessionStorage.getItem("tempLoginToken") || "";
  const email = sessionStorage.getItem("loginEmail") || "";

  // Redirect if no temp session
  useEffect(() => {
    if (!tempToken || !email) {
      navigate("/client/login");
    }
  }, [tempToken, email, navigate]);

  // Countdown timer
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

  // OTP input handling
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    // Move back if deleting
    if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // Verify OTP
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
      const response = await fetch(
        "https://rhms-backend.onrender.com/api/client/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            temp_token: tempToken,
            otp: otpCode,
          }),
        }
      );

      const data = await response.json();

      console.log("OTP Verification Response:", data);

      if (response.ok && data.token) {
        // Save login data
        localStorage.setItem("clientToken", data.token);
        localStorage.setItem(
          "clientUser",
          JSON.stringify(data.user)
        );

        // Remove temp session
        sessionStorage.removeItem("tempLoginToken");
        sessionStorage.removeItem("loginEmail");

        setSuccess("Login successful! Redirecting...");

        setTimeout(() => {
          navigate("/client/dashboard");
        }, 1500);
      } else {
        setError(data.error || "Invalid OTP code");
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setTimer(60);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "https://rhms-backend.onrender.com/api/client/resend-login-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            temp_token: tempToken,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("New OTP code sent to your email");

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(data.error || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP Error:", error);
      setError("Network error. Could not resend OTP.");
    }
  };

  return (
    <div className="client-otp-container">
      <div className="client-otp-card">

        {/* Back Button */}
        <button
          onClick={() => navigate("/client/login")}
          className="client-back-btn"
        >
          ← Back to Login
        </button>

        {/* Header */}
        <div className="client-otp-header">
          <div
            className="client-logo"
            style={{
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <div className="logo-icon">🔐</div>
            <h2>Two-Factor Authentication</h2>
          </div>

          <p>Enter the 6-digit verification code sent to</p>
          <p>
            <strong>{email}</strong>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="client-alert error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="client-alert success">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* OTP Inputs */}
        <div className="client-otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              className="client-otp-input"
              value={digit}
              onChange={(e) =>
                handleOtpChange(e.target.value, index)
              }
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="client-submit-btn"
          disabled={loading || otp.some((d) => d === "")}
        >
          {loading
            ? "Verifying..."
            : "Verify & Complete Login"}
        </button>

        {/* Resend */}
        <div className="client-resend">
          {canResend ? (
            <button
              onClick={handleResend}
              className="client-resend-btn"
            >
              Resend Code
            </button>
          ) : (
            <span className="client-timer">
              Resend in {timer}s
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="client-otp-footer">
          <p>
            Didn’t receive the code? Check your spam folder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientVerifyLoginOTP;