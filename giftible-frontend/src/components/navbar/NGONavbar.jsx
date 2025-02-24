// src/components/Navbar/NGONavbar.js

import React from "react";
import { AppBar, Toolbar, Box, IconButton } from "@mui/material";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { Logout } from "@mui/icons-material";

const NGONavbar = () => {
  const handleLogout = () => {
    localStorage.removeItem("authRole");
    window.location.reload();
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: "#6A4C93", boxShadow: "none" }}>
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "70px" }}>
        <NavLink to="/" style={{ display: "flex", alignItems: "center" }}>
          <Box component="img" src={logo} alt="Giftible Logo" sx={{ width: "auto", maxHeight: "40px" }} />
        </NavLink>
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          <NavLink to="/ngo/products" style={{ color: "#FFFFFF", fontWeight: "bold" }}>My Products</NavLink>
          <NavLink to="/ngo/orders" style={{ color: "#FFFFFF", fontWeight: "bold" }}>Orders</NavLink>
          <IconButton onClick={handleLogout} sx={{ color: "#F5B800" }}>
            <Logout />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NGONavbar;
