import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { AuthContext } from "./AuthContext";
import api from "../api/client";

const Login = () => {
  const { setLoggedIn, setUser } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
      alert(error?.error || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form glass-panel" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p className="subtitle">Access your blood donor dashboard with secure credentials.</p>
        
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
