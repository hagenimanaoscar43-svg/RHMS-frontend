import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./logo.png";
import bg from "./convention.jpg";

const RdbLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!form.username || !form.password) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://rhms-backend.onrender.com/api/rdb/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("rdbToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("rdbUser", JSON.stringify(data.user));
        localStorage.setItem("userRole", "rdb");
        
        setSuccess("Login successful!");
        
        setTimeout(() => {
          navigate("/rdb/dashboard");
        }, 1500);
      } else {
        setError(data.message || data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("RDB login error:", err);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.container, backgroundImage: `url(${bg})` }}>
      <div style={styles.overlay}></div>

      <div style={styles.card}>
        <img src={logo} alt="RDB Logo" style={styles.logo} />

        <h2 style={styles.title}>RDB Admin Portal</h2>
        <p style={styles.subtitle}>Secure Login Access</p>

        {error && (
          <div style={styles.error}>
            <span style={{ marginRight: "8px" }}>⚠️</span>
            {error}
          </div>
        )}
        
        {success && (
          <div style={styles.success}>
            <span style={{ marginRight: "8px" }}>✓</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username or Email"
            value={form.username}
            onChange={handleChange}
            style={styles.input}
            required
            autoFocus
          />

          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <span
              style={styles.showBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={styles.demoCredentials}>
          <p style={styles.demoText}>Demo Credentials:</p>
          <p style={styles.demoCreds}>Username: rdb_admin or admin@rdb.gov.rw</p>
          <p style={styles.demoCreds}>Password: rdb@123</p>
        </div>

        <p style={styles.footer}>
          <a href="/" style={styles.link}>← Back to Home</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    top: 0,
    left: 0,
  },
  card: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(15px)",
    padding: "40px",
    borderRadius: "20px",
    width: "400px",
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  },
  logo: {
    width: "80px",
    marginBottom: "15px",
    background: "white",
    borderRadius: "50%",
    padding: "10px",
  },
  title: {
    marginBottom: "5px",
    fontSize: "26px",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: "14px",
    marginBottom: "25px",
    opacity: 0.8,
  },
  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    fontSize: "15px",
    background: "rgba(255,255,255,0.9)",
    color: "#333",
    boxSizing: "border-box",
  },
  passwordWrapper: {
    position: "relative",
  },
  showBtn: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#666",
    fontSize: "18px",
    background: "transparent",
    padding: "0",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#ff4d4d",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
    transition: "background 0.3s",
  },
  error: {
    background: "rgba(255,0,0,0.2)",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: "14px",
    border: "1px solid rgba(255,0,0,0.3)",
  },
  success: {
    background: "rgba(0,255,0,0.2)",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: "14px",
    border: "1px solid rgba(0,255,0,0.3)",
  },
  footer: {
    marginTop: "20px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "14px",
    opacity: 0.8,
  },
  demoCredentials: {
    marginTop: "25px",
    paddingTop: "15px",
    borderTop: "1px solid rgba(255,255,255,0.2)",
  },
  demoText: {
    fontSize: "12px",
    opacity: 0.7,
    marginBottom: "5px",
  },
  demoCreds: {
    fontSize: "11px",
    opacity: 0.5,
    margin: "3px 0",
  },
};

export default RdbLogin;