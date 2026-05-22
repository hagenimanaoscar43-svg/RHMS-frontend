import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeForgot = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
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
      const res = await fetch("http://localhost:5001/api/employee/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Password reset link sent to your email! Redirecting...");
        localStorage.setItem("resetEmployeeEmail", email);
        setTimeout(() => {
          // Redirect to login page, user will click link from email
          navigate("/employee/auth");
        }, 2000);
      } else {
        setError(data.message || data.error || "Email not found in our system");
      }
    } catch (error) {
      console.error(error);
      setError("Network error. Please check your connection.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgAnimation}>
        <div style={styles.shapes}>
          <div style={{...styles.shape, ...styles.shape1}}></div>
          <div style={{...styles.shape, ...styles.shape2}}></div>
          <div style={{...styles.shape, ...styles.shape3}}></div>
          <div style={{...styles.shape, ...styles.shape4}}></div>
        </div>
      </div>

      <div style={styles.card}>
        <button onClick={() => navigate("/employee/auth")} style={styles.backBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Login
        </button>

        <div style={styles.iconContainer}>
          <div style={styles.iconWrapper}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="url(#gradient)" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="3" stroke="url(#gradient)" strokeWidth="1.5"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea"/>
                  <stop offset="100%" stopColor="#764ba2"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h2 style={styles.title}>Forgot Password?</h2>
        <p style={styles.subtitle}>
          Enter your registered email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div style={styles.errorContainer}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{...styles.errorContainer, background: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={{...styles.label, ...(focused || email ? styles.labelFocused : {})}}>
              Email Address
            </label>
            <div style={styles.inputWrapper}>
              <div style={styles.inputIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="employee@hotel.com"
                style={styles.input}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {})}}
            disabled={loading}
          >
            {loading ? (
              <>
                <div style={styles.spinner}></div>
                Sending Reset Link...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Send Reset Link
              </>
            )}
          </button>
        </form>

        <div style={styles.helpSection}>
          <p style={styles.helpText}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            Need help? Contact your system administrator
          </p>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/employee/auth")}
              style={styles.loginLink}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
    overflow: "hidden",
  },
  bgAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  shapes: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  shape: {
    position: "absolute",
    borderRadius: "50%",
    opacity: 0.1,
    animation: "float 20s infinite ease-in-out",
  },
  shape1: {
    top: "10%",
    left: "10%",
    width: "300px",
    height: "300px",
    background: "white",
    animationDelay: "0s",
  },
  shape2: {
    bottom: "10%",
    right: "10%",
    width: "400px",
    height: "400px",
    background: "white",
    animationDelay: "5s",
  },
  shape3: {
    top: "50%",
    left: "50%",
    width: "250px",
    height: "250px",
    background: "white",
    animationDelay: "10s",
  },
  shape4: {
    bottom: "20%",
    left: "20%",
    width: "200px",
    height: "200px",
    background: "white",
    animationDelay: "15s",
  },
  card: {
    background: "white",
    borderRadius: "32px",
    padding: "48px",
    width: "500px",
    maxWidth: "90%",
    position: "relative",
    zIndex: 10,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    animation: "slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: "#667eea",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    padding: "8px 0",
    marginBottom: "32px",
    transition: "all 0.3s ease",
  },
  iconContainer: {
    textAlign: "center",
    marginBottom: "24px",
  },
  iconWrapper: {
    display: "inline-flex",
    padding: "16px",
    background: "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
    borderRadius: "60px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: "12px",
    marginTop: 0,
  },
  subtitle: {
    fontSize: "15px",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "32px",
    lineHeight: "1.6",
  },
  errorContainer: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "12px 16px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#dc2626",
    fontSize: "14px",
  },
  form: {
    marginBottom: "24px",
  },
  inputGroup: {
    marginBottom: "32px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: "8px",
    transition: "all 0.2s ease",
  },
  labelFocused: {
    color: "#667eea",
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    pointerEvents: "none",
  },
  inputCheck: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
  },
  input: {
    width: "100%",
    padding: "14px 40px 14px 46px",
    fontSize: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: "#f9fafb",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  },
  submitBtnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  helpSection: {
    textAlign: "center",
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
  },
  helpText: {
    fontSize: "13px",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
  },
  footerText: {
    fontSize: "14px",
    color: "#6b7280",
  },
  loginLink: {
    background: "none",
    border: "none",
    color: "#667eea",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    transition: "color 0.3s ease",
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -30px) rotate(120deg); }
    66% { transform: translate(-20px, 20px) rotate(240deg); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default EmployeeForgot;