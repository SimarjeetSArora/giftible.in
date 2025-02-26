import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
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
  Category,
  Groups,
  Info,
  Login as LoginIcon,
  PersonAdd,
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
    { text: "Categories", path: "/categories", icon: <Category /> },
    { text: "NGOs", path: "/ngos", icon: <Groups /> },
    { text: "About Us", path: "/about-us", icon: <Info /> },
    { text: "Login", path: "/login", icon: <LoginIcon /> },
    { text: "Register", path: "/register/user", icon: <PersonAdd /> },
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
            <Box component="img" src="/assets/logo.png" alt="Giftible Logo" sx={{ width: "auto", maxHeight: "40px" }} />
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
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, bgcolor: mode === "dark" ? "#1B1B1B" : "#FFFFFF", height: "100%" }}>
          <List>
            {menuItems.map(({ text, path, icon }) => (
              <ListItem
                button
                key={text}
                component={NavLink}
                to={path}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  color: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
                  fontWeight: "bold",
                  "&.active": { color: "#F5B800" },
                }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>{icon}</ListItemIcon>
                <ListItemText primary={text} />
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
