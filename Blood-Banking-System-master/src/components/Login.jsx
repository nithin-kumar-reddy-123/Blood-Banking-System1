import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Auth.css";
import { AuthContext } from "./AuthContext";
import api from "../api/client";

const Login = () => {
  const { setLoggedIn, setUser } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("registered") === "true") {
      setInfoMessage("Registration successful. Please verify your email before logging in.");
    }
    if (params.get("verified") === "true") {
      setInfoMessage("Email verified successfully. You can now log in.");
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await api.post("/donors/login", { username, password });

      setLoggedIn(true);
      setUser(res.data);
      alert("Login Successful!");
      navigate("/donar");
    } catch (err) {
      console.error(err);
      const error = err.response?.data;
      if (error?.error === "Email not verified. Please check your inbox.") {
        setShowResend(true);
        setResendStatus("If you did not receive the email, enter your registered email and resend it.");
      }
      alert(error?.error || "Login failed");
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail) {
      alert("Please enter your registered email to resend the verification link.");
      return;
    }

    try {
      const response = await api.post("/donors/resend-verification", { email: resendEmail });
      setResendStatus(response.data.message || "Verification email resent. Check your inbox.");
    } catch (err) {
      const error = err.response?.data?.error || "Unable to resend verification email.";
      setResendStatus(error);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form glass-panel" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p className="subtitle">Access your blood donor dashboard with secure credentials.</p>
        {infoMessage && <p className="auth-info">{infoMessage}</p>}
        
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="btn-primary auth-submit-btn">Login</button>
        {showResend && (
          <div className="resend-section">
            <p className="auth-info">{resendStatus}</p>
            <div className="form-group">
              <input
                type="email"
                placeholder="Registered email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
            </div>
            <button type="button" className="btn-secondary auth-submit-btn" onClick={handleResendVerification}>
              Resend Verification Email
            </button>
          </div>
        )}
        
        <p className="auth-footer">
          Don't have an account?{" "}
          <span className="auth-link" onClick={() => navigate("/register")}>
            Register here
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
