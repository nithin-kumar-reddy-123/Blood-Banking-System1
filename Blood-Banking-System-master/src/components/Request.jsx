import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaUser, FaPlus, FaTimes, FaCheck, FaTrash } from "react-icons/fa";
import api from "../api/client";
import { AuthContext } from "./AuthContext";
import MapWrapper from "./MapWrapper";
import "./Request.css";

const Request = () => {
  const navigate = useNavigate();
  const { loggedIn, user } = useContext(AuthContext);
  const [requestData, setRequestData] = useState({
    name: "",
    bloodGroup: "",
    phone: "",
    email: "",
    location: "",
    reason: "",
  });

  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/requests");
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setRequestData({ ...requestData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!requestData.name || !requestData.bloodGroup || !requestData.phone || !requestData.email || !requestData.location || !requestData.reason) {
      alert("Please fill in all fields to submit the request.");
      return;
    }

    try {
      const res = await api.post("/requests", requestData);
      setRequests([...requests, res.data]);
      setRequestData({
        name: "",
        bloodGroup: "",
        phone: "",
        email: "",
        location: "",
        reason: "",
      });
      setShowModal(false);
      alert("Blood request submitted successfully!");
    } catch (err) {
      console.error(err);
      const error = err.response?.data;
      alert(error?.error || "Submission failed.");
    }
  };

  const handleAccept = async (requestId) => {
    if (!loggedIn || !user) {
      alert("You must be logged in as a donor to accept a request.");
      return;
    }

    try {
      const res = await api.put(`/requests/${requestId}/accept`, { donorId: user.id || 1 }); // Fallback ID if user object doesn't have ID yet
      
      // Update local state to reflect accepted status
      setRequests(requests.map(req => req.id === requestId ? res.data : req));
      alert("Request accepted successfully! The requester has been notified.");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Failed to accept request.";
      alert(errorMsg);
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      await api.delete(`/requests/${requestId}`);
      setRequests(requests.filter((req) => req.id !== requestId));
      alert("Request deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete request.");
    }
  };

  // Filter requests locally
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBloodGroup = selectedBloodGroup ? req.bloodGroup === selectedBloodGroup : true;
    
    return matchesSearch && matchesBloodGroup;
  });

  return (
    <div className="request-container">
      <div className="request-panel glass-panel">
        <div className="request-header">
          <div>
            <h2 className="text-gradient">Blood Requests</h2>
            <p>
              Patients, families, and hospitals can submit blood requests without registering.
              Registered donors can log in to accept and manage active requests.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            Request Blood <FaPlus />
          </button>
            {!loggedIn && (
              <p className="auth-info" style={{ marginTop: "1rem", color: "#fff" }}>
                If you are a donor, log in to accept requests.
                If you are requesting blood, you may submit a request directly here.
              </p>
            )}
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, location, reason..."
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
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        <MapWrapper items={filteredRequests} itemType="request" />

        <div className="table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Blood Group</th>
                <th>Location</th>
                <th>Contact details</th>
                <th>Reason</th>
                <th>Status</th>
                {loggedIn && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req, index) => (
                  <tr key={index}>
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
                        <div>
                          <FaPhoneAlt className="cell-icon" /> {req.phone}
                        </div>
                        <div className="email-row">
                          <FaEnvelope className="cell-icon" /> {req.email}
                        </div>
                      </div>
                    </td>
                    <td className="reason-cell">
                      <p className="reason-text" title={req.reason}>{req.reason}</p>
                    </td>
                    <td>
                      <span className={`status-badge ${req.status ? req.status.toLowerCase() : 'pending'}`}>
                        {req.status || 'PENDING'}
                      </span>
                    </td>
                    {loggedIn && (
                      <td>
                        {(!req.status || req.status.toUpperCase() === "PENDING") ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                              className="btn-primary" 
                              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                              onClick={() => handleAccept(req.id)}
                            >
                              <FaCheck /> Accept
                            </button>
                            <button 
                              className="btn-primary" 
                              style={{ padding: '8px 14px', fontSize: '0.8rem', backgroundColor: '#e74c3c' }}
                              onClick={() => handleDelete(req.id)}
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                              {req.status.toUpperCase() === "ACCEPTED" ? "Being Handled" : "Completed"}
                            </span>
                            <button 
                              className="btn-primary" 
                              style={{ padding: '8px 14px', fontSize: '0.8rem', backgroundColor: '#e74c3c' }}
                              onClick={() => handleDelete(req.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No active blood requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel">
            <span className="close-btn" onClick={() => setShowModal(false)}>
              <FaTimes />
            </span>
            <h2 className="text-gradient">Blood Request Form</h2>
            <p className="modal-subtitle">Provide details about the required blood type, location, and urgency.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Patient Name</label>
                <input type="text" name="name" value={requestData.name} onChange={handleChange} required placeholder="e.g. John Doe" />
              </div>

              <div className="form-group">
                <label>Blood Group Required</label>
                <select name="bloodGroup" value={requestData.bloodGroup} onChange={handleChange} required>
                  <option value="">Select Blood Group</option>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input type="text" name="phone" value={requestData.phone} onChange={handleChange} required placeholder="Phone number" />
                </div>

                <div className="form-group">
                  <label>Contact Email</label>
                  <input type="email" name="email" value={requestData.email} onChange={handleChange} required placeholder="Email address" />
                </div>
              </div>

              <div className="form-group">
                <label>Hospital Location / City</label>
                <input type="text" name="location" value={requestData.location} onChange={handleChange} required placeholder="e.g. City General Hospital, Ward 4" />
              </div>

              <div className="form-group">
                <label>Reason for Request</label>
                <textarea name="reason" value={requestData.reason} onChange={handleChange} required placeholder="Describe the urgency or medical condition..." />
              </div>

              <button type="submit" className="btn-primary form-submit-btn">Submit Request</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Request;
