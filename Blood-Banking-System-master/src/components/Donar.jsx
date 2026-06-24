import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaUser, 
  FaHeartbeat, 
  FaLock, 
  FaRegClock, 
  FaCheckCircle, 
  FaInfoCircle, 
  FaAward, 
  FaHistory, 
  FaRegSmile,
  FaWallet,
  FaCoins,
  FaCertificate,
  FaDownload,
  FaMicrochip,
  FaPrint
} from "react-icons/fa";
import api from "../api/client";
import "./Donar.css";
import "./DonarPremium.css";

const Donar = () => {
  const { loggedIn, setLoggedIn, setUser, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState("register");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: "",
    bloodGroup: "",
    username: "",
    password: "",
    email: "",
  });

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [donors, setDonors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const [showCertModal, setShowCertModal] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState("");
  const [redeemErrorMsg, setRedeemErrorMsg] = useState("");

  const handleRedeemReward = async (rewardType) => {
    setIsRedeeming(true);
    setRedeemSuccessMsg("");
    setRedeemErrorMsg("");
    try {
      const res = await api.post("/donors/redeem", { rewardType });
      if (res.data && res.data.success) {
        setRedeemSuccessMsg(res.data.message || `Successfully redeemed ${rewardType}!`);
        // Refresh dashboard stats to get updated credits and balance
        fetchDashboardStats();
        // If it's a certificate, show the certificate modal!
        if (rewardType === "CERTIFICATE") {
          setShowCertModal(true);
        }
      }
    } catch (err) {
      console.error("Redemption error:", err);
      const errMsg = err.response?.data?.error || `Failed to redeem ${rewardType}. Please try again.`;
      setRedeemErrorMsg(errMsg);
    } finally {
      setIsRedeeming(false);
    }
  };

  useEffect(() => {
    if (!loggedIn) {
      navigate("/login");
    } else {
      setStep("list");
    }
  }, [loggedIn, navigate]);

  useEffect(() => {
    if (step === "list") {
      fetchDonors();
    }
  }, [step]);

  useEffect(() => {
    if (loggedIn && step === "list" && activeTab === "dashboard") {
      fetchDashboardStats();
    }
  }, [loggedIn, step, activeTab]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/donors", formData);

      if (res.status === 201 || res.status === 200) {
        alert("Donor registered successfully. Please log in.");
        setStep("login");
      } else {
        alert("Registration failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error during registration.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/donors/login", loginData);

      setUser(res.data);
      setLoggedIn(true);
      setStep("list");
    } catch (err) {
      console.error(err);
      alert("Server error during login");
    }
  };

  const fetchDonors = async () => {
    try {
      const res = await api.get("/donors");
      setDonors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await api.get("/donors/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setStatsError("Failed to load your dashboard statistics. Please try again later.");
    } finally {
      setLoadingStats(false);
    }
  };

  // Filter donors list locally
  const filteredDonors = donors.filter((d) => {
    const matchesSearch =
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBloodGroup = selectedBloodGroup ? d.bloodGroup === selectedBloodGroup : true;
    
    return matchesSearch && matchesBloodGroup;
  });

  const renderDashboard = () => {
    if (loadingStats && !stats) {
      return (
        <div className="dashboard-loading glass-panel">
          <div className="spinner"></div>
          <p>Loading your dashboard details...</p>
        </div>
      );
    }

    if (statsError) {
      return (
        <div className="dashboard-error glass-panel">
          <FaInfoCircle className="error-icon" />
          <p>{statsError}</p>
          <button className="btn-primary" onClick={fetchDashboardStats}>Retry</button>
        </div>
      );
    }

    if (!stats) return null;

    const { 
      totalDonations, 
      livesSaved, 
      isEligible, 
      daysRemaining, 
      nextEligibleDate, 
      badges, 
      donationHistory,
      credits,
      walletBalance
    } = stats;

    const displayCredits = credits ?? 0;
    const displayWalletBalance = walletBalance ?? 0.0;

    return (
      <div className="dashboard-tab-content">
        {/* Welcome Section */}
        <div className="donor-panel glass-panel welcome-panel">
          <div className="dashboard-header">
            <div>
              <h2 className="dashboard-title text-gradient">Welcome back, {user?.name || "Donor"}!</h2>
              <p className="dashboard-description">
                Your profile is active. Thank you for contributing to our life-saving community.
              </p>
            </div>
            <button type="button" className="btn-primary" onClick={() => navigate("/request")}>
              Active Requests <FaHeartbeat />
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Card 1: Eligibility Tracker */}
          <div className="dashboard-card glass-panel eligibility-card">
            <h3>Donation Eligibility</h3>
            <div className="eligibility-content">
              {isEligible ? (
                <div className="eligible-status">
                  <div className="eligible-shield">
                    <FaCheckCircle className="shield-icon pulse-green" />
                  </div>
                  <span className="eligible-badge">Eligible to Donate</span>
                  <p className="eligible-desc">You are fully eligible to donate whole blood. Your contribution makes a direct impact!</p>
                </div>
              ) : (
                <div className="ineligible-status">
                  <div className="radial-countdown">
                    <svg className="progress-ring" width="120" height="120">
                      <circle className="progress-ring-bg" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="6" fill="transparent" r="50" cx="60" cy="60"/>
                      <circle className="progress-ring-fill animate-draw" stroke="var(--primary)" strokeWidth="6" fill="transparent" r="50" cx="60" cy="60"
                              strokeDasharray="314.159"
                              strokeDashoffset={314.159 * (1 - (56 - Math.min(56, daysRemaining)) / 56)}
                              strokeLinecap="round"/>
                    </svg>
                    <div className="progress-ring-text">
                      <span className="days-number">{daysRemaining}</span>
                      <span className="days-label">Days Left</span>
                    </div>
                  </div>
                  <span className="eligible-badge recovery">Recovery Period</span>
                  <p className="eligible-desc">
                    Next Eligible: {nextEligibleDate ? new Date(nextEligibleDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Total Donations */}
          <div className="dashboard-card glass-panel donation-stat-card">
            <h3>Your Donations</h3>
            <div className="stat-value-container">
              <div className="stat-circle-bg">
                <span className="stat-value">{totalDonations}</span>
              </div>
              <div className="heartbeat-container">
                <FaHeartbeat className="heartbeat-icon" />
              </div>
            </div>
            <p className="stat-desc">Requests Accepted & Handled</p>
          </div>

          {/* Card 3: Lives Saved */}
          <div className="dashboard-card glass-panel lives-saved-card">
            <h3>Estimated Impact</h3>
            <div className="lives-value-container">
              <span className="lives-value text-gradient">{livesSaved}</span>
              <p className="lives-title">Lives Saved</p>
            </div>
            <div className="impact-description">
              <FaRegSmile className="smile-icon" />
              <p>Each donation has the potential to save up to three lives.</p>
            </div>
          </div>
        </div>

        {/* Rewards & Wallet System */}
        <div className="donor-panel glass-panel rewards-panel">
          <div className="section-header">
            <FaWallet className="section-icon text-pink animate-pulse" />
            <div>
              <h2>Rewards & Wallet</h2>
              <p>Earn credits from your life-saving donations and redeem them for cash or certificates.</p>
            </div>
          </div>

          <div className="rewards-dashboard-grid">
            {/* Luxury PulseShare Black Card */}
            <div className="pulse-card">
              <div className="pulse-card-bg"></div>
              <div className="pulse-card-content">
                <div className="pulse-card-top">
                  <div className="pulse-card-brand">
                    <FaHeartbeat className="pulse-card-logo" />
                    <span>PulseShare</span>
                  </div>
                  <span className="pulse-card-tier">PLATINUM</span>
                </div>
                <div className="pulse-card-chip">
                  <FaMicrochip className="chip-icon" />
                </div>
                <div className="pulse-card-balance">
                  <span className="balance-label">WALLET BALANCE</span>
                  <span className="balance-amount">${displayWalletBalance.toFixed(2)}</span>
                </div>
                <div className="pulse-card-bottom">
                  <div className="pulse-card-number">
                    •••• •••• •••• {user?.id ? String(user.id).padStart(4, '0') : '0000'}
                  </div>
                  <div className="pulse-card-holder">
                    <span className="holder-label">CARD HOLDER</span>
                    <span className="holder-name">{(user?.name || 'Donor').toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div className="pulse-card-shine"></div>
            </div>

            {/* Credits Card */}
            <div className="rewards-stat-card glass-panel credits-card">
              <div className="rewards-card-header">
                <FaCoins className="reward-icon-large text-yellow animate-shine" />
                <h4>Available Credits</h4>
              </div>
              <div className="credits-balance-container">
                <span className="credits-balance-value">{displayCredits}</span>
                <span className="credits-balance-label">Points</span>
              </div>
              
              {/* Progress bar towards next target */}
              {(() => {
                const nextTarget = displayCredits < 100 ? 100 : displayCredits < 300 ? 300 : 300;
                const progressPct = Math.min(100, (displayCredits / nextTarget) * 100);
                return (
                  <div className="credits-progress-wrapper">
                    <div className="progress-labels">
                      <span>Progression</span>
                      <span>{displayCredits}/{nextTarget} Points</span>
                    </div>
                    <div className="credits-progress-bar">
                      <div className="credits-progress-fill" style={{ width: `${progressPct}%` }}></div>
                    </div>
                    <p className="progress-subtext">
                      {displayCredits < 100 
                        ? `Need ${100 - displayCredits} more points to redeem Certificate!` 
                        : displayCredits < 300 
                          ? `Need ${300 - displayCredits} more points for $15.00 Cash Payout!`
                          : "You have enough points to redeem any reward!"}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Redemption Cards Grid */}
          <div className="redemption-options-header">
            <h3>Redeem Available Rewards</h3>
          </div>
          
          {redeemErrorMsg && (
            <div className="redemption-message error glass-panel">
              <FaInfoCircle /> {redeemErrorMsg}
            </div>
          )}
          {redeemSuccessMsg && (
            <div className="redemption-message success glass-panel">
              <FaCheckCircle /> {redeemSuccessMsg}
            </div>
          )}

          <div className="redemption-grid">
            {/* Reward 1: Certificate */}
            <div className={`redemption-card glass-panel ${displayCredits >= 100 ? "eligible" : "locked"}`}>
              <div className="redemption-badge-tag">100 PTS</div>
              <div className="redemption-card-body">
                <FaCertificate className="reward-card-illustration text-pink" />
                <h4>Certificate of Appreciation</h4>
                <p>Get a premium, high-quality, printable digital Certificate of Appreciation with your name and blood type.</p>
                <button 
                  type="button" 
                  className={`btn-redeem ${displayCredits >= 100 ? "btn-primary" : "btn-disabled"}`}
                  disabled={displayCredits < 100 || isRedeeming}
                  onClick={() => handleRedeemReward("CERTIFICATE")}
                >
                  {isRedeeming ? "Redeeming..." : "Redeem Certificate"}
                </button>
              </div>
            </div>

            {/* Reward 2: Cash Payout */}
            <div className={`redemption-card glass-panel ${displayCredits >= 300 ? "eligible" : "locked"}`}>
              <div className="redemption-badge-tag">300 PTS</div>
              <div className="redemption-card-body">
                <FaCoins className="reward-card-illustration text-yellow" />
                <h4>$15.00 Cash Payout</h4>
                <p>Transfer $15.00 cash directly into your wallet balance. Can be used for payouts or donations.</p>
                <button 
                  type="button" 
                  className={`btn-redeem ${displayCredits >= 300 ? "btn-primary" : "btn-disabled"}`}
                  disabled={displayCredits < 300 || isRedeeming}
                  onClick={() => handleRedeemReward("CASH")}
                >
                  {isRedeeming ? "Redeeming..." : "Redeem Cash"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="donor-panel glass-panel badges-panel">
          <div className="section-header">
            <FaAward className="section-icon text-pink" />
            <div>
              <h2>Milestone Badges</h2>
              <p>Achievements unlocked through your life-saving donations.</p>
            </div>
          </div>
          <div className="badges-grid">
            {badges && badges.map((badge, idx) => {
              const badgeColors = [
                { glow: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)" },
                { glow: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.3)" },
                { glow: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)" },
                { glow: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)" }
              ];
              const color = badgeColors[idx % badgeColors.length];

              return (
                <div 
                  key={idx} 
                  className={`badge-card ${badge.unlocked ? "unlocked" : "locked"}`}
                  style={badge.unlocked ? {
                    "--badge-glow": color.glow,
                    "--badge-border": color.border
                  } : {}}
                >
                  <div className="badge-icon-wrapper">
                    <div className="badge-glow-effect"></div>
                    <div className="badge-icon">
                      {badge.unlocked ? <FaAward className="icon-gold animate-bounce" /> : <FaLock className="icon-locked" />}
                    </div>
                  </div>
                  <div className="badge-details">
                    <h4>{badge.title}</h4>
                    <p>{badge.description}</p>
                    <span className="badge-status-label">
                      {badge.unlocked ? "UNLOCKED" : "LOCKED"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donation History */}
        <div className="donor-panel glass-panel history-panel">
          <div className="section-header">
            <FaHistory className="section-icon text-pink" />
            <div>
              <h2>My Donation History</h2>
              <p>Track your accepted and completed blood request donations.</p>
            </div>
          </div>

          <div className="table-container history-table-container">
            {donationHistory && donationHistory.length > 0 ? (
              <table className="glass-table history-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Blood Group</th>
                    <th>Location</th>
                    <th>Contact Info</th>
                    <th>Accepted On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donationHistory.map((req, idx) => (
                    <tr key={idx}>
                      <td className="donor-name-cell">
                        <div className="donor-avatar-small">
                          {req.name ? req.name.charAt(0).toUpperCase() : <FaUser />}
                        </div>
                        <span>{req.name}</span>
                      </td>
                      <td>
                        <span className={`blood-badge group-${req.bloodGroup ? req.bloodGroup.replace("+", "pos").replace("-", "neg") : "unknown"}`}>
                          {req.bloodGroup}
                        </span>
                      </td>
                      <td className="location-cell">
                        <FaMapMarkerAlt className="cell-icon text-pink" />
                        <span>{req.location}</span>
                      </td>
                      <td>
                        <div className="contact-info-cell">
                          <div className="phone-row" style={{ display: 'flex', alignItems: 'center' }}>
                            <FaPhoneAlt className="cell-icon text-muted" style={{ marginRight: '6px' }} /> {req.phone}
                          </div>
                          <div className="email-row" style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                            <FaEnvelope className="cell-icon text-muted" style={{ marginRight: '6px' }} /> {req.email}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="date-tag">
                          {req.acceptedAt ? new Date(req.acceptedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge-custom ${req.status ? req.status.toLowerCase() : "pending"}`}>
                          {req.status === "PENDING" ? "Pending" : req.status === "ACCEPTED" ? "Being Handled" : "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-history">
                <FaRegClock className="empty-icon" />
                <h3>No Accepted Donations Yet</h3>
                <p>Browse active blood requests in the system and help save lives today.</p>
                <button className="btn-primary animate-pulse" onClick={() => navigate("/request")}>
                  Browse Requests
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (step === "register") {
    return (
      <div className="auth-container">
        <form className="auth-form glass-panel" onSubmit={handleRegister}>
          <h2>Donor Registration</h2>
          <p className="subtitle">Add your profile to the donor network and make it easier for hospitals to reach you.</p>
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          <input type="text" name="username" placeholder="Donor Username" value={formData.username} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <button type="submit" className="btn-primary">Register as Donor</button>
        </form>
      </div>
    );
  }

  if (step === "login") {
    return (
      <div className="auth-container">
        <form className="auth-form glass-panel" onSubmit={handleLogin}>
          <h2>Donor Login</h2>
          <p className="subtitle">Log in to manage your donor profile and view the current donor list.</p>
          <input type="text" name="username" placeholder="Username" value={loginData.username} onChange={handleLoginChange} required />
          <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} required />
          <button type="submit" className="btn-primary">Login</button>
        </form>
      </div>
    );
  }

  if (step === "list") {
    return (
      <div className="donor-container">
        {/* Navigation Tabs */}
        <div className="tabs-header-panel glass-panel">
          <div className="tabs-navigation">
            <button 
              className={`tab-link ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <FaHeartbeat className="tab-icon" /> My Dashboard
            </button>
            <button 
              className={`tab-link ${activeTab === "directory" ? "active" : ""}`}
              onClick={() => setActiveTab("directory")}
            >
              <FaUser className="tab-icon" /> Donor Directory
            </button>
          </div>
        </div>

        {activeTab === "dashboard" ? (
          renderDashboard()
        ) : (
          <>
            <div className="donor-panel glass-panel">
              <div className="dashboard-header">
                <div>
                  <h2 className="dashboard-title text-gradient">Donor Directory</h2>
                  <p className="dashboard-description">
                    Browse registered donors and access verified contact information.
                  </p>
                </div>
                <button type="button" className="btn-primary" onClick={() => navigate("/request")}>
                  Submit Request <FaHeartbeat />
                </button>
              </div>

              <div className="overview-cards">
                <div className="overview-card active-donors">
                  <div className="overview-card-glow"></div>
                  <span>{donors.length}</span>
                  <p>Active Donors</p>
                </div>
                <div className="overview-card uptime">
                  <div className="overview-card-glow"></div>
                  <span>24/7</span>
                  <p>Network Availability</p>
                </div>
                <div className="overview-card response">
                  <div className="overview-card-glow"></div>
                  <span>Instant</span>
                  <p>Connection Rate</p>
                </div>
              </div>
            </div>

            <div className="donor-list glass-panel">
              <div className="list-header">
                <div>
                  <h2>Available Donors</h2>
                  <p>Find donors in your area and filter by blood type.</p>
                </div>
              </div>

              <div className="search-filter-section">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="filter-box">
                  <select
                    value={selectedBloodGroup}
                    onChange={(e) => setSelectedBloodGroup(e.target.value)}
                  >
                    <option value="">All Blood Groups</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="table-container">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Blood Group</th>
                      <th>Location</th>
                      <th>Contact Info</th>
                      <th>Username</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonors.length > 0 ? (
                      filteredDonors.map((d, i) => (
                        <tr key={i}>
                          <td className="donor-name-cell">
                            <div className="donor-avatar-small">
                              {d.name ? d.name.charAt(0).toUpperCase() : <FaUser />}
                            </div>
                            <span>{d.name}</span>
                          </td>
                          <td>
                            <span className={`blood-badge group-${d.bloodGroup ? d.bloodGroup.replace("+", "pos").replace("-", "neg") : "unknown"}`}>
                              {d.bloodGroup}
                            </span>
                          </td>
                          <td className="location-cell">
                            <FaMapMarkerAlt className="cell-icon text-pink" />
                            <span>{d.location}</span>
                          </td>
                          <td>
                            <div className="contact-info-cell text-muted" style={{ fontSize: "0.85rem", fontStyle: "italic" }}>
                              <FaLock className="cell-icon" style={{ marginRight: "4px" }}/> Hidden for Privacy
                              <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>
                                Shared when request is accepted
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="username-tag">@{d.username}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="empty-cell">
                          No matching donors found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Certificate Modal — Classical Diploma */}
        {showCertModal && (
          <div className="certificate-modal-overlay">
            <div className="certificate-modal">
              <div className="certificate-print-area" id="certificate-print-content">
                <div className="diploma-frame">
                  <div className="diploma-corner diploma-corner-tl"></div>
                  <div className="diploma-corner diploma-corner-tr"></div>
                  <div className="diploma-corner diploma-corner-bl"></div>
                  <div className="diploma-corner diploma-corner-br"></div>
                  
                  <div className="diploma-inner">
                    <div className="diploma-header">
                      <div className="diploma-crest">
                        <FaHeartbeat className="crest-icon" />
                      </div>
                      <p className="diploma-org">PulseShare Life-Saving Network</p>
                      <div className="diploma-rule"></div>
                      <h1 className="diploma-title">Certificate of Appreciation</h1>
                    </div>
                    
                    <div className="diploma-body">
                      <p className="diploma-preamble">This certificate is proudly presented to</p>
                      <h2 className="diploma-recipient">{user?.name || "Life-Saving Hero"}</h2>
                      <div className="diploma-underline"></div>
                      <p className="diploma-citation">
                        In recognition of their extraordinary generosity and selfless commitment 
                        as a registered blood donor. Through their heroic contributions, they have 
                        directly saved lives and brought renewed hope to patients and families 
                        in critical need.
                      </p>
                    </div>

                    <div className="diploma-meta">
                      <div className="diploma-detail">
                        <span className="diploma-detail-value">{user?.bloodGroup || "N/A"}</span>
                        <span className="diploma-detail-label">Blood Group</span>
                      </div>
                      <div className="diploma-seal">
                        <div className="seal-ring">
                          <div className="seal-center">
                            <FaAward className="seal-award-icon" />
                            <span className="seal-verified">VERIFIED</span>
                          </div>
                        </div>
                      </div>
                      <div className="diploma-detail">
                        <span className="diploma-detail-value">
                          {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="diploma-detail-label">Date Issued</span>
                      </div>
                    </div>

                    <div className="diploma-signatures">
                      <div className="diploma-sig">
                        <div className="sig-line"></div>
                        <span className="sig-name">Director, PulseShare</span>
                      </div>
                      <div className="diploma-sig">
                        <div className="sig-line"></div>
                        <span className="sig-name">Board of Recognition</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="certificate-modal-actions no-print">
                <button type="button" className="btn-primary" onClick={() => window.print()}>
                  <FaPrint /> Print / Download PDF
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowCertModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Donar;
