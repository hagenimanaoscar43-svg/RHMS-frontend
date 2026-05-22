import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeRegister = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    nid: "",
    telephone: "",
    hotelName: "",
    position: "",
    password: "",
    confirmPassword: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const positions = [
    "Select position",
    "Front Desk Officer",
    "Housekeeping Staff",
    "Restaurant Staff",
    "Manager",
    "Accountant",
    "Security",
    "Maintenance",
    "Other"
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = "Name must be at least 3 characters";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.nid) {
      newErrors.nid = "NID is required";
    } else if (!/^\d{16}$/.test(formData.nid)) {
      newErrors.nid = "NID must be 16 digits";
    }
    
    if (!formData.telephone) {
      newErrors.telephone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(formData.telephone)) {
      newErrors.telephone = "Invalid phone number";
    }
    
    if (!formData.hotelName) {
      newErrors.hotelName = "Hotel name is required";
    }
    
    if (!formData.position || formData.position === "Select position") {
      newErrors.position = "Position is required";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === "nid") {
      processedValue = value.replace(/\D/g, "").slice(0, 16);
    } else if (name === "telephone") {
      processedValue = value.replace(/\D/g, "").slice(0, 15);
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/employee/auth");
      }, 2000);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      {success && (
        <div className="employee-alert success">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}
      
      <div className="employee-form-row">
        <div className="employee-form-group">
          <label>👤 Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={errors.fullName ? "error" : ""}
          />
          {errors.fullName && <span className="employee-error">{errors.fullName}</span>}
        </div>

        <div className="employee-form-group">
          <label>📧 Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="employee@hotel.com"
            className={errors.email ? "error" : ""}
          />
          {errors.email && <span className="employee-error">{errors.email}</span>}
        </div>
      </div>

      <div className="employee-form-row">
        <div className="employee-form-group">
          <label>🆔 NID Number</label>
          <input
            type="text"
            name="nid"
            value={formData.nid}
            onChange={handleChange}
            placeholder="16 digit NID"
            maxLength="16"
            className={errors.nid ? "error" : ""}
          />
          {errors.nid && <span className="employee-error">{errors.nid}</span>}
        </div>

        <div className="employee-form-group">
          <label>📞 Telephone</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="Phone number"
            className={errors.telephone ? "error" : ""}
          />
          {errors.telephone && <span className="employee-error">{errors.telephone}</span>}
        </div>
      </div>

      <div className="employee-form-row">
        <div className="employee-form-group">
          <label>🏨 Hotel Name</label>
          <input
            type="text"
            name="hotelName"
            value={formData.hotelName}
            onChange={handleChange}
            placeholder="Hotel name"
            className={errors.hotelName ? "error" : ""}
          />
          {errors.hotelName && <span className="employee-error">{errors.hotelName}</span>}
        </div>

        <div className="employee-form-group">
          <label>💼 Position</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            className={errors.position ? "error" : ""}
          >
            {positions.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
          {errors.position && <span className="employee-error">{errors.position}</span>}
        </div>
      </div>

      <div className="employee-form-row">
        <div className="employee-form-group">
          <label>🔒 Password</label>
          <div className="employee-password-input">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create password"
              className={errors.password ? "error" : ""}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="employee-toggle-password"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          {errors.password && <span className="employee-error">{errors.password}</span>}
        </div>

        <div className="employee-form-group">
          <label>🔒 Confirm Password</label>
          <div className="employee-password-input">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className={errors.confirmPassword ? "error" : ""}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="employee-toggle-password"
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          {errors.confirmPassword && <span className="employee-error">{errors.confirmPassword}</span>}
        </div>
      </div>

      <button type="submit" className="employee-submit-btn" disabled={loading}>
        {loading ? "Creating Account..." : "Register as Employee"}
      </button>
    </form>
  );
};

export default EmployeeRegister;