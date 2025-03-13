import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authRole, setAuthRole] = useState(() => sessionStorage.getItem("authRole") || null);

  useEffect(() => {
    if (authRole) {
      sessionStorage.setItem("authRole", authRole); // ✅ Store role properly
    } else {
      sessionStorage.removeItem("authRole");
    }
  }, [authRole]);

  return (
    <AuthContext.Provider value={{ authRole, setAuthRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
