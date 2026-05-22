import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientLogin from "./ClientLogin";
import ClientRegister from "./ClientRegister";
import "./ClientAuth.css";

const ClientAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="client-auth-container">
      <div className="client-auth-card">
        <div className="client-auth-header">
          <div className="client-logo">
            <div className="logo-icon">🏨</div>
            <h1>RHMS Client</h1>
          </div>
          <p className="client-subtitle">Book hotels, manage reservations, track stays</p>
        </div>

        <div className="client-toggle">
          <button
            onClick={() => setIsLogin(true)}
            className={`client-toggle-btn ${isLogin ? "active" : ""}`}
          >
            🔐 Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`client-toggle-btn ${!isLogin ? "active" : ""}`}
          >
            📝 Register
          </button>
        </div>

        <div>
          {isLogin ? <ClientLogin /> : <ClientRegister />}
        </div>

        {isLogin && (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button
              onClick={() => navigate("/client/forgot")}
              className="client-forgot-link"
            >
              🔑 Forgot Password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAuth;