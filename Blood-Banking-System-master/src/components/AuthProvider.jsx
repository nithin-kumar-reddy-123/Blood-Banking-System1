import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("bloodbank_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (loggedIn && user) {
      localStorage.setItem("bloodbank_user", JSON.stringify(user));
      if (user.token) {
        localStorage.setItem("bloodbank_token", user.token);
      }
    } else {
      localStorage.removeItem("bloodbank_user");
      localStorage.removeItem("bloodbank_token");
    }
  }, [loggedIn, user]);

  const logout = () => {
    setLoggedIn(false);
    setUser(null);
    localStorage.removeItem("bloodbank_user");
    localStorage.removeItem("bloodbank_token");
  };

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
