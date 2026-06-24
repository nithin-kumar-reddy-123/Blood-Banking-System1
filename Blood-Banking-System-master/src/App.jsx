import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";
import Home from "./components/Home";
import Donar from "./components/Donar";
import Request from "./components/Request";
import DonorDirectory from "./components/DonorDirectory";
import Login from "./components/Login";
import Register from "./components/Register";
import VerifyEmail from "./components/VerifyEmail";
import AIHelp from "./components/AIHelp";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import AdminDashboard from "./components/AdminDashboard";

const App = () => {
  const [toast, setToast] = useState(null);
  const location = useLocation();

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

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/donors" element={<PageTransition><DonorDirectory /></PageTransition>} />

          {/* Protected Routes */}
          <Route
            path="/donar"
            element={
              <ProtectedRoute>
                <PageTransition><Donar /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route path="/request" element={<PageTransition><Request /></PageTransition>} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PageTransition><Profile /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <PageTransition><AdminDashboard /></PageTransition>
              </ProtectedRoute>
            } 
          />

          {/* Auth Routes */}
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
          <Route path="/ai-assistant" element={<PageTransition><AIHelp /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

export default App;
