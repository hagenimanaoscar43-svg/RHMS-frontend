import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const EmployeeOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const userId = location.state?.userId || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Actual API call for login 2FA
      const response = await fetch('https://rhms-backend.onrender.com/api/employee/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, otp: otpCode })
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem("employeeToken", data.token);
        localStorage.setItem("employeeUser", JSON.stringify(data.user));
        navigate('/employee/dashboard');
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    
    try {
      // Call resend OTP API for login
      const response = await fetch('http://localhost:5001/api/employee/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setTimer(60);
        setCanResend(false);
        alert('OTP resent successfully!');
      } else {
        setError('Failed to resend OTP');
      }
    } catch (error) {
      setError('Network error. Could not resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-otp-container">
      <button onClick={() => navigate('/employee/auth')} className="employee-back-btn">
        <ArrowLeft size={18} />
        Back to Login
      </button>
      
      <form onSubmit={handleVerify} className="employee-form">
        <div className="employee-otp-header">
          <Shield size={48} className="otp-icon" />
          <h3>Verify OTP</h3>
          <p>We've sent a 6-digit code to <strong>{email || 'your email'}</strong></p>
        </div>
        
        {error && (
          <div className="employee-alert error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        <div className="employee-otp-inputs">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              maxLength="1"
              className="employee-otp-input"
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, i)}
              autoFocus={i === 0}
            />
          ))}
        </div>
        
        <button type="submit" className="employee-submit-btn" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        
        <div className="employee-resend">
          {canResend ? (
            <button type="button" onClick={handleResendOTP} className="employee-resend-btn">
              Resend OTP
            </button>
          ) : (
            <span className="employee-timer">Resend in {timer}s</span>
          )}
        </div>
      </form>
    </div>
  );
};

export default EmployeeOTP;