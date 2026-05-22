import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { FaTrash, FaCheck, FaTimes, FaUsers, FaTint } from "react-icons/fa";
import api from "../api/client";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { loggedIn, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("donors");
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donorsRes, requestsRes] = await Promise.all([
        api.get("/donors"),
        api.get("/requests")
      ]);
      setDonors(donorsRes.data);
      setRequests(requestsRes.data);
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent("show-toast", { detail: { type: "error", message: "Failed to load dashboard data" } }));
    } finally {
      setLoading(false);
    }
  };

  const deleteDonor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donor?")) return;
    try {
      await api.delete(`/donors/${id}`);
      setDonors(donors.filter(d => d.id !== id));
      window.dispatchEvent(new CustomEvent("show-toast", { detail: { type: "success", message: "Donor deleted" } }));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      await api.delete(`/requests/${id}`);
      setRequests(requests.filter(r => r.id !== id));
      window.dispatchEvent(new CustomEvent("show-toast", { detail: { type: "success", message: "Request deleted" } }));
    } catch (err) {
      console.error(err);
    }
  };

  const changeRequestStatus = async (id, status) => {
    try {
      const res = await api.put(`/requests/${id}/status`, { status });
      setRequests(requests.map(r => r.id === id ? res.data : r));
      window.dispatchEvent(new CustomEvent("show-toast", { detail: { type: "success", message: `Status updated to ${status}` } }));
    } catch (err) {
      console.error(err);
    }
  };

  if (!loggedIn || user?.role !== "ADMIN") {
    return (
      <div className="admin-container">
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center" }}>
          <h2>Access Denied</h2>
          <p>You must be an administrator to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-sidebar glass-panel">
        <h2 className="text-gradient">Admin Dashboard</h2>
        <div className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === "donors" ? "active" : ""}`}
            onClick={() => setActiveTab("donors")}
          >
            <FaUsers /> Manage Donors
          </button>
          <button 
            className={`admin-nav-item ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <FaTint /> Manage Requests
          </button>
        </div>
      </div>

      <div className="admin-content glass-panel">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <>
            {activeTab === "donors" && (
              <div>
                <h3>Registered Donors ({donors.length})</h3>
                <div className="table-container">
                  <table className="glass-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Blood Group</th>
                        <th>Location</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donors.map(donor => (
                        <tr key={donor.id}>
                          <td>{donor.id}</td>
                          <td>{donor.name}</td>
                          <td><span className="blood-badge">{donor.bloodGroup}</span></td>
                          <td>{donor.location}</td>
                          <td>{donor.role}</td>
                          <td>
                            {donor.id !== user.id && (
                              <button className="btn-icon danger" onClick={() => deleteDonor(donor.id)}>
                                <FaTrash />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "requests" && (
              <div>
                <h3>Blood Requests ({requests.length})</h3>
                <div className="table-container">
                  <table className="glass-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Patient</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(req => (
                        <tr key={req.id}>
                          <td>{req.id}</td>
                          <td>{req.name}</td>
                          <td><span className="blood-badge">{req.bloodGroup}</span></td>
                          <td>{req.location}</td>
                          <td>
                            <select 
                              className="status-dropdown" 
                              value={req.status || "PENDING"} 
                              onChange={(e) => changeRequestStatus(req.id, e.target.value)}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="ACCEPTED">ACCEPTED</option>
                              <option value="FULFILLED">FULFILLED</option>
                            </select>
                          </td>
                          <td>
                            <button className="btn-icon danger" onClick={() => deleteRequest(req.id)}>
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
