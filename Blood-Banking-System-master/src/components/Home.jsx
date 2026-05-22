import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { FaChevronRight, FaHeartbeat, FaShieldAlt, FaPlus, FaCheckCircle, FaUsers, FaHospital } from "react-icons/fa";
import "./Home.css";

const compatibility = {
  "O-": { gives: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], receives: ["O-"] },
  "O+": { gives: ["O+", "A+", "B+", "AB+"], receives: ["O-", "O+"] },
  "A-": { gives: ["A-", "A+", "AB-", "AB+"], receives: ["A-", "O-"] },
  "A+": { gives: ["A+", "AB+"], receives: ["A+", "A-", "O+", "O-"] },
  "B-": { gives: ["B-", "B+", "AB-", "AB+"], receives: ["B-", "O-"] },
  "B+": { gives: ["B+", "AB+"], receives: ["B+", "B-", "O+", "O-"] },
  "AB-": { gives: ["AB-", "AB+"], receives: ["AB-", "A-", "B-", "O-"] },
  "AB+": { gives: ["AB+"], receives: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] },
};

const bloodTypes = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

const Home = () => {
  const navigate = useNavigate();
  const { loggedIn } = useContext(AuthContext);
  const [activeBlood, setActiveBlood] = useState("O+");

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

              <div className="hero-metrics">
                <div className="hero-metric glass-panel">
                  <div className="metric-icon-wrap"><FaUsers /></div>
                  <strong>42K+</strong>
                  <p>Active donors</p>
                </div>
                <div className="hero-metric glass-panel">
                  <div className="metric-icon-wrap"><FaCheckCircle /></div>
                  <strong>98%</strong>
                  <p>Response rate</p>
                </div>
                <div className="hero-metric glass-panel">
                  <div className="metric-icon-wrap"><FaHospital /></div>
                  <strong>120+</strong>
                  <p>Hospitals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="compatibility-section animate-fade-in">
        <div className="compatibility-header">
          <h2>Blood <span className="text-gradient">Compatibility</span> Matrix</h2>
          <p>Select a blood type below to see who they can donate to and receive from.</p>
        </div>
        
        <div className="compatibility-widget glass-panel">
          <div className="blood-selector">
            {bloodTypes.map(type => (
              <button 
                key={type}
                className={`blood-type-btn ${activeBlood === type ? 'active' : ''}`}
                onClick={() => setActiveBlood(type)}
              >
                {type}
              </button>
            ))}
          </div>
          
          <div className="compatibility-results">
            <div className="result-card gives-card">
              <h4>Can Donate To</h4>
              <div className="result-badges">
                {bloodTypes.map(type => {
                  const canGive = compatibility[activeBlood].gives.includes(type);
                  return (
                    <span key={type} className={`comp-badge ${canGive ? 'highlight-give' : 'dim'}`}>
                      {type}
                    </span>
                  );
                })}
              </div>
            </div>
            
            <div className="result-card receives-card">
              <h4>Can Receive From</h4>
              <div className="result-badges">
                {bloodTypes.map(type => {
                  const canReceive = compatibility[activeBlood].receives.includes(type);
                  return (
                    <span key={type} className={`comp-badge ${canReceive ? 'highlight-receive' : 'dim'}`}>
                      {type}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cards-section">
        <div className="card glass-panel" onClick={() => handleClick("/donar")}> 
          <div className="card-image-container">
            <img src="/donation1.jpeg.jpg" alt="Register as Donor" className="card-img" />
            <div className="card-img-overlay"></div>
          </div>
          <div className="card-content">
            <div className="card-icon-circle"><FaPlus /></div>
            <h2>Register as Donor</h2>
            <p>Create your profile and join our community of life-savers.</p>
          </div>
        </div>

        <div className="card glass-panel" onClick={() => handleClick("/request")}> 
          <div className="card-image-container">
            <img src="/donation2.jpg" alt="Request Blood" className="card-img" />
            <div className="card-img-overlay"></div>
          </div>
          <div className="card-content">
            <div className="card-icon-circle pink"><FaHeartbeat /></div>
            <h2>Request Blood</h2>
            <p>Submit requests specifying blood type, quantity, and urgency.</p>
          </div>
        </div>

        <div className="card glass-panel">
          <div className="card-image-container">
            <img src="/donation3.jpg" alt="Safe & Secure" className="card-img" />
            <div className="card-img-overlay"></div>
          </div>
          <div className="card-content">
            <div className="card-icon-circle blue"><FaShieldAlt /></div>
            <h2>Safe & Secure</h2>
            <p>All your data is encrypted and protected on our secure platform.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
