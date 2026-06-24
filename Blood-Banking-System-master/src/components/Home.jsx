import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { FaChevronRight, FaHeartbeat, FaShieldAlt, FaPlus } from "react-icons/fa";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { loggedIn } = useContext(AuthContext);

  const handleClick = (path) => {
    if (path === "/request") navigate(path);
    else if (loggedIn) navigate(path);
    else navigate("/login");
  };

  return (
    <main className="home-container">
      <section className="hero">
        <div className="hero-copy animate-fade-in">
          <span className="eyebrow">
            <span className="pulse-dot"></span> Trusted blood network
          </span>
          <h1>
            Donate blood, <span className="text-gradient">save lives</span>, and speed up critical help.
          </h1>
          <p className="subtitle">
            Experience a modern, glassmorphic blood banking platform built for donors, patients, and hospitals.
            Track requests, register safely, and join a life-saving community.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate("/register")}>
              Become a Donor <FaChevronRight className="btn-icon" />
            </button>
            <button className="btn-secondary" onClick={() => handleClick("/request")}>
              Request Blood
            </button>
          </div>
        </div>

        <div className="hero-visual animate-slide-up">
          <div className="hero-graphic">
            <div className="hero-glow" />
            <div className="hero-card glass-panel">
              <span className="hero-badge">
                <span className="pulse-dot green"></span> Live matching active
              </span>
              <h3>Urgent Request Broadcast</h3>
              <p>
                Our platform connects verified donors, hospitals, and patients in real time so lifesaving blood reaches those who need it most.
              </p>

              <div className="heart-rate-visual">
                <svg className="heart-rate-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 60">
                  <path className="heart-rate-path" d="M0,30 L50,30 L60,30 L70,10 L80,50 L90,30 L100,30 L110,30 L120,30 L130,5 L140,55 L150,30 L160,30 L220,30 L230,15 L240,45 L250,30 L300,30" fill="none" stroke="#ff3366" strokeWidth="2.5" />
                </svg>
              </div>

              <div className="hero-feature-cards">
                <div className="feature-card glass-panel" onClick={() => handleClick("/donar")}> 
                  <div className="feature-card-header">
                    <div className="feature-icon-circle"><FaPlus /></div>
                    <div>
                      <h4>Register as Donor</h4>
                      <p>Create your profile and join our community of life-savers.</p>
                    </div>
                  </div>
                </div>

                <div className="feature-card glass-panel" onClick={() => handleClick("/request")}> 
                  <div className="feature-card-header">
                    <div className="feature-icon-circle pink"><FaHeartbeat /></div>
                    <div>
                      <h4>Request Blood</h4>
                      <p>Submit requests specifying blood type, quantity, and urgency.</p>
                    </div>
                  </div>
                </div>

                <div className="feature-card glass-panel">
                  <div className="feature-card-header">
                    <div className="feature-icon-circle blue"><FaShieldAlt /></div>
                    <div>
                      <h4>Safe & Secure</h4>
                      <p>All your data is encrypted and protected on our secure platform.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
