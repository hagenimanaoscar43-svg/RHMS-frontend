import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeLogin from "./EmployeeLogin";
import "./EmployeeAuth.css";

const EmployeeAuth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="employee-auth-container">
      <div className="employee-auth-bg">
        <div className="animated-pattern"></div>
      </div>
      
      <div className="employee-auth-card">
        <div className="employee-auth-header">
          <div className="employee-logo">
            <div className="logo-icon">👔</div>
            <h1>Employee Portal</h1>
          </div>
          <p className="employee-subtitle">Hotel Staff Management System</p>
        </div>

        {/* Remove the toggle buttons - only show login */}
        <div className="employee-form-wrapper">
          <EmployeeLogin />
        </div>

        {/* Optional: Add a note that employees are registered by hotel admin */}
        <div className="employee-info-note">
          <p>📋 Employees are registered by hotel administrators</p>
          <p>Contact your hotel manager for account creation</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAuth;