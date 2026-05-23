// frontend/src/pages/auth/hotel/HotelOTP.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const HotelOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email') || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('https://rhms-backend.onrender.com/api/hotel/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp })
      });
      
      const data = await response.json();
      console.log("Verification response:", data);
      
      if (response.ok) {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/hotel/login");
        }, 2000);
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => navigate("/hotel/login")} style={styles.backBtn}>
          ← Back to Login
        </button>

        <div style={styles.header}>
          <div style={styles.icon}>📧</div>
          <h2>Verify Your Email</h2>
          <p>Enter the 6-digit verification code sent to</p>
          <p style={styles.email}>{email || "your email"}</p>
        </div>

        {error && (
          <div style={styles.error}>
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            <span>✓</span> {success}
          </div>
        )}

        <div style={styles.otpContainer}>
          <input
            type="text"
            maxLength="6"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            style={styles.otpInput}
            autoFocus
          />
        </div>

        <button 
          onClick={handleVerify} 
          disabled={loading || otp.length !== 6}
          style={{...styles.button, opacity: (loading || otp.length !== 6) ? 0.6 : 1}}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <p style={styles.note}>
          Didn't receive the code? Check your spam folder
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '450px',
    width: '100%',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  backBtn: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '14px'
  },
  header: { textAlign: 'center', marginBottom: '30px', marginTop: '20px' },
  icon: { fontSize: '48px', marginBottom: '15px' },
  email: { color: '#667eea', fontWeight: 'bold', wordBreak: 'break-all' },
  otpContainer: { marginBottom: '20px' },
  otpInput: {
    width: '100%',
    padding: '14px',
    fontSize: '24px',
    textAlign: 'center',
    letterSpacing: '8px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  success: {
    background: '#d1fae5',
    color: '#065f46',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  note: { textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#6b7280' }
};

export default HotelOTP;