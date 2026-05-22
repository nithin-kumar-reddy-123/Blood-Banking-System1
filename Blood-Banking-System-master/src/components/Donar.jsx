import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { FaSearch, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaUser, FaHeartbeat, FaLock } from "react-icons/fa";
import api from "../api/client";
import "./Donar.css";

const Donar = () => {
  const { loggedIn, setLoggedIn, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState("register");
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

  // Filter donors list locally
  const filteredDonors = donors.filter((d) => {
    const matchesSearch =
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBloodGroup = selectedBloodGroup ? d.bloodGroup === selectedBloodGroup : true;
    
    return matchesSearch && matchesBloodGroup;
  });

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
        <div className="donor-panel glass-panel">
          <div className="dashboard-header">
            <div>
              <h2 className="dashboard-title text-gradient">Donor Dashboard</h2>
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
      </div>
    );
  }

  return null;
};

export default Donar;
