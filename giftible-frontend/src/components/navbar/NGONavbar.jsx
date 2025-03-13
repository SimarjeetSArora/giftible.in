import React, { useState, useEffect } from "react";
import {
  AppBar, Toolbar, Box, IconButton, Menu, MenuItem, Typography, Avatar, ListItemIcon, Button
} from "@mui/material";
import { AccountCircle, Logout, Menu as MenuIcon, Brightness4, Brightness7 } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../LogoutButton";
import { useThemeContext } from "../../context/ThemeContext"; // Dark Mode Context

const NGONavbar = ({ toggleSidebar }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userName, setUserName] = useState("Admin");
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeContext(); // Dark Mode Logic

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUserName(userData.first_name || "Admin");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: "#6A4C93",
        boxShadow: "none",
        zIndex: 1300,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "70px", px: 2 }}>
        {/* Sidebar Toggle Button */}
        <IconButton onClick={toggleSidebar} sx={{ color: "#F5B800", mr: 2 }}>
          <MenuIcon />
        </IconButton>

        {/* Centered Logo with Link */}
        <Box
          sx={{ display: "flex", justifyContent: "center", flexGrow: 1, cursor: "pointer" }}
          onClick={() => navigate("/admin/dashboard")}
        >
          <Box
            component="img"
            src="/assets/logo-ngo.png"
            alt="NGO Logo"
            sx={{ maxHeight: "40px", transition: "opacity 0.2s", "&:hover": { opacity: 0.8 } }}
          />
        </Box>

        {/* Right: Dark Mode Toggle, User Dropdown */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* 🌗 Dark Mode Toggle */}
          <IconButton onClick={toggleMode} sx={{ color: "#FFFFFF" }}>
            {mode === "dark" ? <Brightness7 sx={{ color: "#F5B800" }} /> : <Brightness4 sx={{ color: "#F5B800" }} />}
          </IconButton>

          {/* User Dropdown */}
          <Button
            onClick={handleMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#FFFFFF",
              bgcolor: "transparent",
              textTransform: "none",
              "&:hover": { bgcolor: "transparent" },
            }}
          >
            <Avatar sx={{ bgcolor: "#F5B800", width: 32, height: 32 }}>
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <Typography sx={{ fontWeight: "bold" }}>{userName}</Typography>
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ mt: 1 }}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <AccountCircle sx={{ color: "#6A4C93" }} />
              </ListItemIcon>
              <Typography>Manage Profile</Typography>
            </MenuItem>

            <LogoutButton />
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NGONavbar;
