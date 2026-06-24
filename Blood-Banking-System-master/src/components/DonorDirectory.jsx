import React, { useState, useEffect, useContext } from "react";
import { FaTrash, FaUser, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import api from "../api/client";
import { motion } from "framer-motion";
import { AuthContext } from "./AuthContext";
import MapWrapper from "./MapWrapper";
import "./Request.css"; // Reuse table styling

const DonorDirectory = () => {
  const { loggedIn, user } = useContext(AuthContext);
  const [donors, setDonors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const res = await api.get("/donors");
      setDonors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (donorId) => {
    if (!window.confirm("Are you sure you want to delete this donor?")) return;
    try {
      await api.delete(`/donors/${donorId}`);
      setDonors(donors.filter((d) => d.id !== donorId));
      alert("Donor deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete donor.");
    }
  };

  const obfuscateEmail = (email) => {
    if (!email) return "N/A";
    const [name, domain] = email.split("@");
    if (!domain) return email;
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.substring(0, 3)}****@${domain}`;
  };

  const obfuscatePhone = (phone) => {
    if (!phone) return "N/A";
    const str = String(phone);
    if (str.length < 6) return str;
    return `${str.substring(0, 2)}****${str.substring(str.length - 2)}`;
  };

  const filteredDonors = donors.filter(
    (d) =>
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bloodGroup?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="request-container">
      <div className="request-panel glass-panel">
        <div className="request-header">
          <div>
            <h2 className="text-gradient">Donor Directory</h2>
            <p>View registered donors. Contact details are securely obfuscated.</p>
          </div>
        </div>

        <div className="search-filter-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, location, or blood group..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <MapWrapper items={filteredDonors} itemType="donor" />

        <div className="table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Blood Group</th>
                <th>Location</th>
                <th>Phone (Protected)</th>
                <th>Email (Protected)</th>
                {loggedIn && <th>Actions</th>}
              </tr>
            </thead>
            <motion.tbody variants={tableVariants} initial="hidden" animate="show">
              {filteredDonors.length > 0 ? (
                filteredDonors.map((donor, index) => (
                  <motion.tr key={index} variants={rowVariants}>
                    <td className="donor-name-cell">
                      <div className="donor-avatar-small">
                        {donor.name ? donor.name.charAt(0).toUpperCase() : <FaUser />}
                      </div>
                      <span>{donor.name}</span>
                    </td>
                    <td>
                      <span
                        className={`blood-badge group-${
                          donor.bloodGroup
                            ? donor.bloodGroup.replace("+", "pos").replace("-", "neg")
                            : "unknown"
                        }`}
                      >
                        {donor.bloodGroup}
                      </span>
                    </td>
                    <td className="location-cell">
                      <FaMapMarkerAlt className="cell-icon text-pink" />
                      <span>{donor.location}</span>
                    </td>
                    <td>{obfuscatePhone(donor.phone)}</td>
                    <td>{obfuscateEmail(donor.email)}</td>
                    {loggedIn && (
                      <td>
                        {(user?.id === donor.id || user?.role === 'ADMIN') && (
                          <button
                            className="btn-primary"
                            style={{ padding: "8px 14px", fontSize: "0.8rem", backgroundColor: "#e74c3c" }}
                            onClick={() => handleDelete(donor.id)}
                          >
                            <FaTrash /> Delete
                          </button>
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))
              ) : (
                <motion.tr variants={rowVariants}>
                  <td colSpan={loggedIn ? "6" : "5"} className="empty-cell">
                    No donors found.
                  </td>
                </motion.tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonorDirectory;
