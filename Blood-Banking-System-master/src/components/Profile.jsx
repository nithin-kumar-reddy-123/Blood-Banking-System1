import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import api from "../api/client";
import "./Auth.css";

const Profile = () => {
  const { user, loggedIn, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: "",
    bloodGroup: "",
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!loggedIn || !user) {
      navigate("/login");
      return;
    }
    setFormData({
      name: user.name || "",
      location: user.location || "",
      phone: user.phone || "",
      bloodGroup: user.bloodGroup || "",
      username: user.username || "",
      email: user.email || "",
      password: "",
    });
  }, [loggedIn, navigate, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }
      const res = await api.put(`/donors/${user.id}`, payload);
      setUser(res.data);
      alert("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      const error = err.response?.data;
      alert(error?.error || "Profile update failed.");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form glass-panel" onSubmit={handleSubmit}>
        <h2>Edit Profile</h2>
        <p className="subtitle">Update your donor information and password.</p>

        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Blood Group</label>
            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
              <option value="">Select Blood Group</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current password" />
        </div>

        <button type="submit" className="btn-primary auth-submit-btn">Save Changes</button>
      </form>
    </div>
  );
};

export default Profile;
