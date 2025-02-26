import React, { useState } from "react";
import { MenuItem, ListItemIcon, ListItemText, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logout } from "@mui/icons-material";
import axiosInstance from "../services/axiosInstance";
import API_BASE_URL from "../config";

function LogoutButton({ closeMenu }) {
  const navigate = useNavigate();
  const { setAuthRole } = useAuth();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");  // ✅ Match the key used in Login.jsx
      console.log("Using refresh token:", refreshToken);
      console.log("Stored keys:", Object.keys(localStorage));
      if (refreshToken) {
        // ✅ Send JSON payload with proper headers
        await axiosInstance.post(
          `${API_BASE_URL}/logout`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );
      }
  
      // 🧹 Clear authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("refresh_token");  // ✅ Updated key
      localStorage.removeItem("user");           // ✅ Correct key (not userId)
      setAuthRole(null);
  
      setOpenSnackbar(true); // 🎉 Show success snackbar
      if (closeMenu) closeMenu();
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message); // 🔎 Better error logging
      alert("Failed to log out. Please try again.");
    }
  };
  

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
    navigate("/login", { replace: true }); // 🚀 Redirect to login without back navigation
  };

  return (
    <>
      {/* 🚪 Logout Menu Item */}
      <MenuItem onClick={handleLogout}>
        <ListItemIcon><Logout /></ListItemIcon>
        <ListItemText primary="Logout" />
      </MenuItem>

      {/* ✅ Snackbar Notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={1500}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Logged out successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

export default LogoutButton;
