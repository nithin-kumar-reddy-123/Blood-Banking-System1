import React, { useContext } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="user-menu">
      <div className="user-badge" onClick={() => navigate("/donar")} title="Go to Dashboard">
        <div className="user-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <span className="user-name">{user?.name || "Profile"}</span>
      </div>
      {user?.role === "ADMIN" && (
        <button type="button" className="nav-link" onClick={() => navigate("/admin")} style={{background: 'none', border: 'none', color: '#ff4757', fontWeight: 'bold'}}>
          Admin Panel
        </button>
      )}
      <button type="button" className="logout-button" onClick={handleLogout}>
        <FaSignOutAlt className="logout-icon" /> <span>Logout</span>
      </button>
    </div>
  );
};

export default UserMenu;
