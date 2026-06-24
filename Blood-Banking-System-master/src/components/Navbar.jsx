import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { ThemeContext } from "./ThemeContext";
import { FaHeartbeat, FaSun, FaMoon } from "react-icons/fa";
import UserMenu from "./UserMenu";
import "./Home.css";

const Navbar = () => {
  const { loggedIn } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar glass-panel">
      <div className="nav-inner">
        <div className="nav-left">
          <div className="nav-logo" onClick={() => navigate("/")}>
            <FaHeartbeat className="logo-icon" />
            <span className="logo-text">Pulse<span className="text-gradient">Share</span></span>
          </div>
          <div className="nav-links">
            <button 
              type="button" 
              className={`nav-link ${isActive("/") ? "active" : ""}`} 
              onClick={() => navigate("/")}
            >
              Home
            </button>
            <button 
              type="button" 
              className={`nav-link ${isActive("/request") ? "active" : ""}`} 
              onClick={() => navigate("/request")}
            >
              Requests
            </button>
            <button 
              type="button" 
              className={`nav-link ${isActive("/donors") ? "active" : ""}`} 
              onClick={() => navigate("/donors")}
            >
              Donors
            </button>
            <button 
              type="button" 
              className={`nav-link ${isActive("/ai-assistant") ? "active" : ""}`} 
              onClick={() => navigate("/ai-assistant")}
            >
              AI Help
            </button>
          </div>
        </div>
        <div className="nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            type="button" 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            style={{ fontSize: '1.2rem', color: 'var(--text)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
          {loggedIn ? (
            <UserMenu />
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="nav-btn btn-secondary">Login</button>
              <button onClick={() => navigate("/register")} className="nav-btn btn-primary">Register</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
