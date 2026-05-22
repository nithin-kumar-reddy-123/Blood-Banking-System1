import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { AuthContext } from "./AuthContext";
import api from "../api/client";

const Register = () => {
  const { setLoggedIn, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: "",
    bloodGroup: "",
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, location, phone, bloodGroup, username, email, password } = formData;
    if (!name || !location || !phone || !bloodGroup || !username || !email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await api.post("/donors", {
        name,
        location,
        phone,
        bloodGroup,
        username,
        email,
        password,
      });

      setLoggedIn(true);
      setUser({ name, email, username });
      alert("Registration Successful!");
      navigate("/donar");
    } catch (err) {
      console.error(err);
      const error = err.response?.data;
      alert(error?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form glass-panel" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p className="subtitle">Join the donor community and help save lives with your blood type.</p>
        
        <div className="form-group">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <input type="text" name="location" placeholder="Location / City" value={formData.location} onChange={handleChange} required />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
              <option value="">Select Blood Group</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        </div>

        <button type="submit" className="btn-primary auth-submit-btn">Register</button>
        
        <p className="auth-footer">
          Already have an account?{" "}
          <span className="auth-link" onClick={() => navigate("/login")}>
            Login here
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
