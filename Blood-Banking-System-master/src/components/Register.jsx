import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import api from "../api/client";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: "",
    bloodGroup: "",
    username: "",
    email: "",
    password: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
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

      setSuccessMessage(`Registration successful. A verification email has been sent to ${email}. Please verify your email before logging in.`);
      setRegistrationComplete(true);
    } catch (err) {
      console.error(err);
      const error = err.response?.data;
      alert(error?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form glass-panel">
        <h2>{registrationComplete ? "Verify Your Email" : "Create Account"}</h2>
        <p className="subtitle">
          {registrationComplete
            ? "A verification email has been sent. Please verify before logging in."
            : "Join the donor community and help save lives with your blood type."}
        </p>

        {registrationComplete ? (
          <>
            <p className="auth-info" style={{ marginBottom: "1rem" }}>{successMessage}</p>
            <button type="button" className="btn-primary auth-submit-btn" onClick={() => navigate("/login?registered=true") }>
              Go to Login
            </button>
            <p className="auth-info" style={{ marginTop: "1rem" }}>
              If you don’t receive the email, check your spam folder or use the resend option on the login page.
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
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
          </form>
        )}

        <p className="auth-footer">
          Already have an account?{" "}
          <span className="auth-link" onClick={() => navigate("/login") }>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
