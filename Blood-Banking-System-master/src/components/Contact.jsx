import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from "react-icons/fa";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-container">
      <div className="contact-grid">
        <div className="contact-info glass-panel animate-fade-in">
          <h2 className="text-gradient">Get in Touch</h2>
          <p className="contact-desc">
            Have questions about blood donation, matching, or requests? Reach out to our team. We're here to help 24/7.
          </p>

          <div className="info-items">
            <div className="info-item">
              <div className="info-icon-circle"><FaPhoneAlt /></div>
              <div>
                <h4>Call Us</h4>
                <p>+1 (555) 902-1243</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-circle"><FaEnvelope /></div>
              <div>
                <h4>Email Support</h4>
                <p>support@pulseshare.org</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-circle"><FaMapMarkerAlt /></div>
              <div>
                <h4>Main Center</h4>
                <p>102 Health Avenue, Suite 400, Chicago, IL</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-circle"><FaClock /></div>
              <div>
                <h4>Hours</h4>
                <p>Monday - Sunday: 24/7 Service</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-container glass-panel animate-fade-in">
          <h2>Send Message</h2>
          <p className="contact-desc">Fill out the form below and our support team will get back to you shortly.</p>
          
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <textarea name="message" placeholder="Type your message here..." value={formData.message} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn-primary contact-submit-btn">
              Send Message <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
