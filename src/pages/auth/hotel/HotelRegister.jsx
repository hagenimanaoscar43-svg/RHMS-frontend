// frontend/src/pages/auth/hotel/HotelRegister.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HotelAuth.css";

const HotelRegister = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    hotelName: "",
    address: "",
    city: "Kigali",
    country: "Rwanda",
    email: "",
    phone: "",
    contactPerson: "",
    registrationNumber: "",
    taxId: "",
    password: "",
    confirmPassword: "",
    termsAgreement: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState("");  // ← ADDED - FIXES THE ERROR

  const countries = [
    { value: "Rwanda", code: "+250", flag: "🇷🇼", placeholder: "78XXXXXXX" },
    { value: "Uganda", code: "+256", flag: "🇺🇬", placeholder: "7XXXXXXXX" },
    { value: "Tanzania", code: "+255", flag: "🇹🇿", placeholder: "6XXXXXXXX" },
    { value: "Kenya", code: "+254", flag: "🇰🇪", placeholder: "7XXXXXXXX" },
    { value: "Burundi", code: "+257", flag: "🇧🇮", placeholder: "7XXXXXXXX" }
  ];

  const cities = [
    "Kigali", "Rubavu", "Musanze", "Nyagatare", "Huye", 
    "Muhanga", "Rusizi", "Rwamagana", "Kayonza", "Gicumbi"
  ];

  // Get country config
  const getCountryConfig = () => {
    return countries.find(c => c.value === formData.country) || countries[0];
  };

  // Update phone placeholder when country changes
  useEffect(() => {
    const config = getCountryConfig();
    if (formData.phone && !formData.phone.match(/^\d+$/)) {
      setFormData(prev => ({ ...prev, phone: "" }));
    }
  }, [formData.country]);

  // Check password strength
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.hotelName.trim()) {
      newErrors.hotelName = "Hotel name is required";
    } else if (formData.hotelName.length < 3) {
      newErrors.hotelName = "Hotel name must be at least 3 characters";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    
    if (!formData.city) {
      newErrors.city = "City is required";
    }
    
    if (!formData.country) {
      newErrors.country = "Country is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const config = getCountryConfig();
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (formData.country === "Rwanda" && !/^\d{9}$/.test(formData.phone)) {
      newErrors.phone = `Phone must be 9 digits (${config.placeholder})`;
    } else if (formData.phone.length < 7) {
      newErrors.phone = "Phone number is too short";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.termsAgreement) {
      newErrors.termsAgreement = "You must agree to the terms and conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const config = getCountryConfig();
    
    let maxLength = 15;
    if (formData.country === "Rwanda") maxLength = 9;
    
    if (value.length <= maxLength) {
      setFormData(prev => ({ ...prev, phone: value }));
      if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) {
      setCurrentStep(3);
      return;
    }
    
    setLoading(true);
    setError("");  // ← Now works because setError is defined
    setSuccess("");
    
    try {
      const response = await fetch('https://rhms-backend.onrender.com/api/hotel/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotel_name: formData.hotelName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          contact_person: formData.contactPerson,
          registration_number: formData.registrationNumber,
          tax_id: formData.taxId,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess("Hotel registration submitted successfully! Awaiting RDB approval.");
        setTimeout(() => {
          navigate("/hotel/auth");
        }, 3000);
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "#ef4444";
    if (passwordStrength <= 3) return "#f59e0b";
    return "#10b981";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  const config = getCountryConfig();

  return (
    <div className="hotel-auth-container">
      <div className="hotel-auth-bg">
        <div className="animated-pattern"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
      
      <div className="hotel-auth-card" style={{ width: "650px", maxWidth: "95%" }}>
        <div className="hotel-auth-header">
          <div className="hotel-logo">
            <div className="logo-icon">🏨</div>
            <h1>Hotel Registration</h1>
          </div>
          <p className="hotel-subtitle">Register your hotel with Rwanda Development Board (RDB)</p>
        </div>

        {/* Progress Steps */}
        <div className="hotel-progress">
          <div className={`hotel-progress-step ${currentStep >= 1 ? "active" : ""}`}>
            <div className={`step-circle ${currentStep > 1 ? "completed" : ""}`}>
              {currentStep > 1 ? "✓" : "1"}
            </div>
            <span>Hotel Info</span>
          </div>
          <div className="hotel-progress-line"></div>
          <div className={`hotel-progress-step ${currentStep >= 2 ? "active" : ""}`}>
            <div className={`step-circle ${currentStep > 2 ? "completed" : ""}`}>
              {currentStep > 2 ? "✓" : "2"}
            </div>
            <span>Contact</span>
          </div>
          <div className="hotel-progress-line"></div>
          <div className={`hotel-progress-step ${currentStep >= 3 ? "active" : ""}`}>
            <div className={`step-circle ${currentStep > 3 ? "completed" : ""}`}>
              {currentStep > 3 ? "✓" : "3"}
            </div>
            <span>Security</span>
          </div>
        </div>

        {success && (
          <div className="hotel-alert success">
            <i className="fas fa-check-circle"></i>
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="hotel-alert error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Hotel Basic Information */}
          {currentStep === 1 && (
            <div className="hotel-form step1">
              <div className="hotel-form-group">
                <label>
                  <i className="fas fa-hotel"></i> Hotel Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="hotelName"
                  value={formData.hotelName}
                  onChange={handleChange}
                  placeholder="Enter official hotel name"
                  className={errors.hotelName ? "error" : ""}
                />
                {errors.hotelName && <span className="hotel-error">{errors.hotelName}</span>}
              </div>

              <div className="hotel-form-group">
                <label>
                  <i className="fas fa-map-marker-alt"></i> Address <span className="required">*</span>
                </label>
                <textarea
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full physical address"
                  className={errors.address ? "error" : ""}
                />
                {errors.address && <span className="hotel-error">{errors.address}</span>}
              </div>

              <div className="hotel-form-row">
                <div className="hotel-form-group">
                  <label>
                    <i className="fas fa-city"></i> City <span className="required">*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? "error" : ""}
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.city && <span className="hotel-error">{errors.city}</span>}
                </div>

                <div className="hotel-form-group">
                  <label>
                    <i className="fas fa-globe-africa"></i> Country <span className="required">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={errors.country ? "error" : ""}
                  >
                    {countries.map(country => (
                      <option key={country.value} value={country.value}>
                        {country.flag} {country.value}
                      </option>
                    ))}
                  </select>
                  {errors.country && <span className="hotel-error">{errors.country}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="hotel-form step2">
              <div className="hotel-form-group">
                <label>
                  <i className="fas fa-envelope"></i> Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hotel@example.com"
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <span className="hotel-error">{errors.email}</span>}
              </div>

              <div className="hotel-form-group">
                <label>
                  <i className="fas fa-phone"></i> Phone Number <span className="required">*</span>
                </label>
                <div className="hotel-phone-input">
                  <div className="phone-code">{config.flag} {config.code}</div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder={config.placeholder}
                    className={errors.phone ? "error" : ""}
                  />
                </div>
                {errors.phone && <span className="hotel-error">{errors.phone}</span>}
                <small className="hotel-hint">{config.flag} {config.value} format: {config.placeholder}</small>
              </div>

              <div className="hotel-form-group">
                <label>
                  <i className="fas fa-user"></i> Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Primary contact person"
                />
              </div>

              <div className="hotel-form-row">
                <div className="hotel-form-group">
                  <label>
                    <i className="fas fa-file-alt"></i> Registration Number
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="Business registration (optional)"
                  />
                </div>

                <div className="hotel-form-group">
                  <label>
                    <i className="fas fa-receipt"></i> Tax ID
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder="Tax identification (optional)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Security & Terms */}
          {currentStep === 3 && (
            <div className="hotel-form step3">
              <div className="hotel-form-row">
                <div className="hotel-form-group">
                  <label>
                    <i className="fas fa-lock"></i> Password <span className="required">*</span>
                  </label>
                  <div className="hotel-password-input">
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
                      className="hotel-toggle-password"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className="strength-fill" 
                          style={{ 
                            width: `${(passwordStrength / 5) * 100}%`, 
                            background: getStrengthColor() 
                          }}
                        />
                      </div>
                      <span style={{ color: getStrengthColor() }}>
                        Password strength: {getStrengthText()}
                      </span>
                    </div>
                  )}
                  {errors.password && <span className="hotel-error">{errors.password}</span>}
                </div>

                <div className="hotel-form-group">
                  <label>
                    <i className="fas fa-lock"></i> Confirm Password <span className="required">*</span>
                  </label>
                  <div className="hotel-password-input">
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
                      className="hotel-toggle-password"
                    >
                      {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="hotel-error">{errors.confirmPassword}</span>}
                </div>
              </div>

              <div className="info-alert">
                <i className="fas fa-info-circle"></i>
                <div>
                  <strong>Important Information</strong>
                  <p>• Your registration requires RDB approval</p>
                  <p>• Approval process takes a few days</p>
                  <p>• You will receive email notification upon approval</p>
                  <p>• Try to login after approval confirmation</p>
                </div>
              </div>

              <div className="hotel-form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="termsAgreement"
                    checked={formData.termsAgreement}
                    onChange={handleChange}
                  />
                  <span>
                    I agree to the <a href="#">Terms and Conditions</a> and 
                    <a href="#"> RDB Hotels Regulations</a>
                    <span className="required">*</span>
                  </span>
                </label>
                {errors.termsAgreement && <span className="hotel-error">{errors.termsAgreement}</span>}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="hotel-form-buttons">
            {currentStep > 1 && (
              <button type="button" onClick={handleBack} className="hotel-btn-secondary">
                <i className="fas fa-arrow-left"></i> Back
              </button>
            )}
            
            {currentStep < 3 ? (
              <button type="button" onClick={handleNext} className="hotel-btn-primary">
                Next <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <button type="submit" className="hotel-btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Submit Registration
                  </>
                )}
              </button>
            )}
          </div>

          <div className="hotel-auth-footer">
            <p>
              Already have an account? 
              <button type="button" onClick={() => navigate("/hotel/auth")}>
                Login here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelRegister;