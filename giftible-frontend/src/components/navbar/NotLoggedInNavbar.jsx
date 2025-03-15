import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search,
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  ShoppingBag,
  VolunteerActivism, // ✅ Updated for NGOs
  InfoOutlined, // ✅ Updated for About Us
  LoginOutlined, // ✅ Updated for Login
  PersonAddAlt1, // ✅ Updated for Register
} from "@mui/icons-material";
import { useThemeContext } from "../../context/ThemeContext";
import { NavLink } from "react-router-dom";
import SearchBar from "../SearchBar";

const NotLoggedInNavbar = () => {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const menuItems = [
    { text: "Products", path: "/products", icon: <ShoppingBag /> },
    { text: "NGOs", path: "/ngos", icon: <VolunteerActivism /> }, // ✅ Updated
    { text: "About Us", path: "/about-us", icon: <InfoOutlined /> }, // ✅ Updated
    { text: "Login", path: "/login", icon: <LoginOutlined /> }, // ✅ Updated
    { text: "Register", path: "/register/user", icon: <PersonAddAlt1 /> }, // ✅ Updated
  ];

  return (
    <>
      {/* 🔝 Sticky Navbar */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: "#6A4C93",
          boxShadow: "none",
          zIndex: theme.zIndex.drawer + 1, // Ensure navbar stays above other elements
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: "70px", padding: "0 16px" }}>
          {/* 🔗 Left: Logo */}
          <NavLink to="/" style={{ display: "flex", alignItems: "center" }}>
            <Box
              component="img"
              src="/assets/logo.png"
              alt="Giftible Logo"
              sx={{ width: "auto", maxHeight: "40px", pr: 2 }} // ✅ Added right padding
            />
          </NavLink>

          {/* 🔍 Center: Search Bar */}
          <SearchBar />

          {/* 🌗 Right: Theme Toggle & Menu */}
          <Box display="flex" alignItems="center">
            {/* 🌙 Light/Dark Mode */}
            <IconButton onClick={toggleMode} sx={{ ml: 1, color: "#F5B800" }}>
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* 📱 Mobile Menu */}
            {isMobile ? (
              <IconButton edge="end" sx={{ ml: 1, color: "#FFFFFF" }} onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ ml: 2, display: "flex" }}>
                {menuItems.map(({ text, path, icon }) => (
                  <NavLink
                    key={text}
                    to={path}
                    style={({ isActive }) => ({
                      color: isActive ? "#F5B800" : "#FFFFFF",
                      textDecoration: "none",
                      fontWeight: "bold",
                      margin: "0 10px",
                      paddingBottom: "4px",
                      display: "flex",
                      alignItems: "center",
                      borderBottom: isActive ? "2px solid #F5B800" : "none",
                      transition: "color 0.3s ease, border-bottom 0.3s ease",
                    })}
                  >
                    <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>{icon}</Box>
                    {text}
                  </NavLink>
                ))}
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* 📱 Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiPaper-root": {
            bgcolor: "#6A4C93", // ✅ Purple background
            color: "#FFFFFF", // ✅ White text
            height: "calc(100vh - 40px)", // ✅ Adjust height to account for navbar
            marginTop: "40px", // ✅ Push Drawer below the navbar
            overflowY: "auto", // ✅ Enable scrolling
          },
        }}
      >
        <Box sx={{ width: 250, py: 2 }}> {/* ✅ Added padding to the drawer content */}
          <List>
            {menuItems.map(({ text, path, icon }) => (
              <ListItem
                button
                key={text}
                component={NavLink}
                to={path}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  "&:hover": { bgcolor: "#7B5BA6" }, // ✅ Smooth hover effect
                  py: 1.5, // ✅ Ensure proper spacing
                }}
              >
                <ListItemIcon sx={{ color: "#FFFFFF", minWidth: "40px" }}>{icon}</ListItemIcon>
                <ListItemText primary={text} sx={{ color: "#FFFFFF", fontWeight: "bold" }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* 🛡️ Spacer to prevent content overlap */}
      <Box sx={{ height: "64px" }} />
    </>
  );
};

export default NotLoggedInNavbar;
