import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LogoutButton() {
  const navigate = useNavigate();
  const { setAuthRole } = useAuth();

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setAuthRole(null);

    // Redirect to login or home
    navigate("/login");

    // Optional: Show alert or toast
    alert("Logged out successfully!");
  };

  return (
    <Button variant="contained" color="error" onClick={handleLogout}>
      Logout
    </Button>
  );
}

export default LogoutButton;
