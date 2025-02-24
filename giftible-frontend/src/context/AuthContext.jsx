import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authRole, setAuthRole] = useState(localStorage.getItem("authRole") || null);

  useEffect(() => {
    if (authRole) {
      localStorage.setItem("authRole", authRole);
    } else {
      localStorage.removeItem("authRole");
    }
  }, [authRole]);

  return (
    <AuthContext.Provider value={{ authRole, setAuthRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
