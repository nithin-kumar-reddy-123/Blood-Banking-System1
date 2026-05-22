import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Donar from "./components/Donar";
import Request from "./components/Request";
import Contact from "./components/Contact";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import AdminDashboard from "./components/AdminDashboard";

const App = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timer;
    const handleToast = (e) => {
      setToast(null); // Clear previous if exists
      // Small timeout to allow re-animation
      setTimeout(() => {
        setToast(e.detail);
      }, 50);

      // Auto dismiss after 4 seconds
      clearTimeout(timer);
      timer = setTimeout(() => {
        setToast(null);
      }, 4000);
    };

    window.addEventListener("show-toast", handleToast);
    return () => {
      window.removeEventListener("show-toast", handleToast);
      clearTimeout(timer);
    };
  }, []);

  const closeToast = () => setToast(null);

  return (
    <>
      <div className="ambient-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <Navbar />

      {toast && (
        <div className={`toast-message toast-${toast.type} glass-panel`} onClick={closeToast}>
          <div className="toast-indicator"></div>
          <span className="toast-text">{toast.message}</span>
          <span className="toast-close">&times;</span>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected Routes */}
        <Route
          path="/donar"
          element={
            <ProtectedRoute>
              <Donar />
            </ProtectedRoute>
          }
        />
        <Route path="/request" element={<Request />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
};

export default App;
