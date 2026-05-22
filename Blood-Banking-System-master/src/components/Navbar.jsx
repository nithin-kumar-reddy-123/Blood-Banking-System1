import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { FaHeartbeat } from "react-icons/fa";
import UserMenu from "./UserMenu";
import "./Home.css";

const Navbar = () => {
  const { loggedIn } = useContext(AuthContext);
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
              className={`nav-link ${isActive("/contact") ? "active" : ""}`} 
              onClick={() => navigate("/contact")}
            >
              Contact
            </button>
          </div>
        </div>
        <div className="nav-buttons">
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
