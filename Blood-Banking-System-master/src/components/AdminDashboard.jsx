import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { FaTrash, FaCheck, FaTimes, FaUsers, FaTint } from "react-icons/fa";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/client";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { loggedIn, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("donors");
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartData = [
    { name: "Jan", donors: 10, requests: 5 },
    { name: "Feb", donors: 25, requests: 15 },
    { name: "Mar", donors: 45, requests: 35 },
    { name: "Apr", donors: 60, requests: 40 },
    { name: "May", donors: 85, requests: 60 },
    { name: "Jun", donors: 110, requests: 90 },
  ];

  const tableVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

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
            <div style={{ height: "300px", width: "100%", marginBottom: "40px" }}>
              <h3 style={{ marginBottom: "20px" }}>Growth Overview</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDonors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff3366" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff3366" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(7, 12, 25, 0.9)', borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Area type="monotone" dataKey="donors" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDonors)" />
                  <Area type="monotone" dataKey="requests" stroke="#ff3366" fillOpacity={1} fill="url(#colorRequests)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

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
                    <motion.tbody variants={tableVariants} initial="hidden" animate="show">
                      {donors.map(donor => (
                        <motion.tr key={donor.id} variants={rowVariants}>
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
                        </motion.tr>
                      ))}
                    </motion.tbody>
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
                    <motion.tbody variants={tableVariants} initial="hidden" animate="show">
                      {requests.map(req => (
                        <motion.tr key={req.id} variants={rowVariants}>
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
                        </motion.tr>
                      ))}
                    </motion.tbody>
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
