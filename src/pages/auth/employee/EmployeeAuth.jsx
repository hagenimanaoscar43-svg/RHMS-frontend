import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeLogin from "./EmployeeLogin";
import EmployeeRegister from "./EmployeeRegister";
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

        <div className="employee-toggle">
          <button
            onClick={() => setIsLogin(true)}
            className={`employee-toggle-btn ${isLogin ? 'active' : ''}`}
          >
            🔐 Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`employee-toggle-btn ${!isLogin ? 'active' : ''}`}
          >
            📝 Register
          </button>
        </div>

        <div className="employee-form-wrapper">
          {isLogin ? <EmployeeLogin /> : <EmployeeRegister />}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAuth;