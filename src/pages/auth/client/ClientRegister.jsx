// frontend/src/pages/client/ClientRegister.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ClientRegister = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [apiError, setApiError] = useState("");

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{9,12}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Invalid phone number (9-12 digits)";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain letters and numbers";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setApiError("");
    setSuccess("");
    
    try {
      const response = await fetch('http://localhost:5001/api/client/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });
      
      const data = await response.json();
      console.log("Registration response:", data);
      
      if (response.ok) {
        setSuccess("Registration successful! Verification code sent to your email.");
        localStorage.setItem("pendingVerificationEmail", formData.email);
        setTimeout(() => {
          navigate("/client/verify-otp", { 
            state: { email: formData.email, purpose: "register" } 
          });
        }, 2000);
      } else {
        setApiError(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setApiError("Cannot connect to server. Make sure backend is running on port 5001");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="client-form">
      {/* Success Message */}
      {success && (
        <div className="client-alert success" style={{
          background: '#d1fae5',
          color: '#065f46',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}
      
      {/* Error Message */}
      {apiError && (
        <div className="client-alert error" style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚠️</span>
          <span>{apiError}</span>
        </div>
      )}
      
      {/* Full Name */}
      <div className="client-form-group">
        <label>👤 Full Name *</label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="Enter your full name"
          style={{
            width: '100%',
            padding: '12px',
            border: errors.full_name ? '2px solid #ef4444' : '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        {errors.full_name && (
          <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {errors.full_name}
          </span>
        )}
      </div>

      {/* Email */}
      <div className="client-form-group">
        <label>📧 Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="client@example.com"
          style={{
            width: '100%',
            padding: '12px',
            border: errors.email ? '2px solid #ef4444' : '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        {errors.email && (
          <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {errors.email}
          </span>
        )}
      </div>

      {/* Phone */}
      <div className="client-form-group">
        <label>📞 Phone Number *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="0788888888"
          style={{
            width: '100%',
            padding: '12px',
            border: errors.phone ? '2px solid #ef4444' : '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        {errors.phone && (
          <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {errors.phone}
          </span>
        )}
      </div>

      {/* Password */}
      <div className="client-form-group">
        <label>🔒 Password *</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create password (min 6 characters)"
            style={{
              width: '100%',
              padding: '12px',
              border: errors.password ? '2px solid #ef4444' : '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              paddingRight: '40px'
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        {errors.password && (
          <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {errors.password}
          </span>
        )}
      </div>

      {/* Confirm Password */}
      <div className="client-form-group">
        <label>🔒 Confirm Password *</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            style={{
              width: '100%',
              padding: '12px',
              border: errors.confirmPassword ? '2px solid #ef4444' : '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              paddingRight: '40px'
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        {errors.confirmPassword && (
          <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {errors.confirmPassword}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="client-submit-btn" 
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          marginTop: '10px'
        }}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
};

export default ClientRegister;