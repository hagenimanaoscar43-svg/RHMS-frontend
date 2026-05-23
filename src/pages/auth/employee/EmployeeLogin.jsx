// frontend/src/pages/auth/employee/EmployeeLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeLogin = () => {
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
      const response = await fetch('https://rhms-backend.onrender.com/api/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log("Employee login response:", data);
      
      if (response.ok && data.step === 'otp_required') {
        // Store data for 2FA verification
        sessionStorage.setItem("employeeUserId", data.user_id);
        sessionStorage.setItem("employeeLoginEmail", email);
        // Redirect to 2FA verification page
        navigate("/employee/verify-login-otp", { 
          state: { email: email, userId: data.user_id } 
        });
      } else if (response.ok && data.token) {
        // Direct login (if no 2FA configured)
        localStorage.setItem("token", data.token);
        localStorage.setItem("employeeToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.staff) {
          localStorage.setItem("staff", JSON.stringify(data.staff));
        }
        if (rememberMe) {
          localStorage.setItem("rememberedEmployeeEmail", email);
        }
        navigate("/employee/dashboard");
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (error) {
      console.error("Employee login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-login-container">
      <div className="employee-login-card">
        <div className="employee-login-header">
          <div className="logo-icon">👨‍💼</div>
          <h2>Employee Login</h2>
          <p>Welcome back! Please login to your account</p>
        </div>

        {error && (
          <div className="alert error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📧 Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@hotel.com"
              required
            />
          </div>

          <div className="form-group">
            <label>🔒 Password</label>
            <div className="password-input">
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
                className="toggle-password"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span>Remember me</span>
            </label>
            <button 
              type="button" 
              onClick={() => navigate("/employee/forgot-password")} 
              className="forgot-link"
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Sending 2FA Code..." : "Sign In"}
          </button>
        </form>

        {/* REMOVED REGISTER LINK - Employees cannot register themselves */}
      </div>

      <style>{`
        .employee-login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        
        .employee-login-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .employee-login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .logo-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        
        .employee-login-header h2 {
          margin: 0 0 10px;
          color: #1f2937;
          font-size: 28px;
        }
        
        .employee-login-header p {
          margin: 0;
          color: #6b7280;
        }
        
        .alert {
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
        }
        
        .alert.error {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #374151;
          font-weight: 500;
        }
        
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .password-input {
          position: relative;
        }
        
        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
        }
        
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        
        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #6b7280;
        }
        
        .forgot-link {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-size: 14px;
        }
        
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default EmployeeLogin;