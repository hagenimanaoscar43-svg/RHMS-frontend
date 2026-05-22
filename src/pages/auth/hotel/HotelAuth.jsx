import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelLogin from "./HotelLogin";
import HotelRegister from "./HotelRegister";
import "./HotelAuth.css";

const HotelAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

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
      
      <div className="hotel-auth-card">
        <div className="hotel-auth-header">
          <div className="hotel-logo">
            <div className="logo-icon">🏨</div>
            <h1>Hotel Portal</h1>
          </div>
          <p className="hotel-subtitle">Manage your hotel, rooms, and reservations</p>
        </div>

        <div className="hotel-toggle">
          <button
            onClick={() => setIsLogin(true)}
            className={`hotel-toggle-btn ${isLogin ? "active" : ""}`}
          >
            🔐 Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`hotel-toggle-btn ${!isLogin ? "active" : ""}`}
          >
            📝 Register
          </button>
        </div>

        <div className="hotel-form-wrapper">
          {isLogin ? <HotelLogin /> : <HotelRegister />}
        </div>

        {isLogin && (
          <div className="hotel-auth-footer">
            <p>
              Don't have an account? 
              <button type="button" onClick={() => setIsLogin(false)}>
                Register here
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelAuth;