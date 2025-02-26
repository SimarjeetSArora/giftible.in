import React, { useState, useEffect } from "react";
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
  Badge,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  ShoppingCart,
  Inventory2,
  ListAlt,
  AccountCircle,
  Person,
  Edit,
  Logout,
  FavoriteBorder,
  CardGiftcard,
  Notifications,
  Home,
  ArrowDropDown,
} from "@mui/icons-material";
import { useNavigate, NavLink } from "react-router-dom";
import { useThemeContext } from "../../context/ThemeContext";
import SearchBar from "../SearchBar";
import LogoutButton from "../LogoutButton";
import API_BASE_URL from "../../config"; // Ensure you have this configured
import { fetchCartCount } from "../../services/cartService";

const UserNavbar = () => {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0); // Accurate cart count
  const [notificationCount, setNotificationCount] = useState(3); // Notifications
  const [firstName, setFirstName] = useState(""); // User name

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.id;
  
    if (!userId) {
      console.warn("User ID not found in localStorage.");
      return;
    }
  
    const handleCartUpdate = async (event) => {
    const updatedCount = event.detail?.count ?? (await fetchCartCount(userId));
      setCartItemCount(updatedCount);
    };
  
    // Initial fetch on navbar load
    handleCartUpdate();
  
    // Listen for cart updates
    window.addEventListener("cartUpdated", handleCartUpdate);
  
    return () => window.removeEventListener("cartUpdated", handleCartUpdate); // Cleanup
  }, []);
  
  
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const isMenuOpen = Boolean(anchorEl);

  const menuItems = [
    { text: "Products", path: "/products", icon: <Inventory2 /> },
    { text: "Orders", path: "/user/orders", icon: <ListAlt /> },
  ];

  return (
    <>
      {/* 🔝 Navbar */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: "#6A4C93",
          boxShadow: "none",
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: "70px", padding: "0 16px" }}>
          {/* 🔗 Logo */}
          <NavLink to="/" style={{ display: "flex", alignItems: "center" }}>
            <Box component="img" src="/assets/logo.png" alt="Giftible Logo" sx={{ width: "auto", maxHeight: "40px" }} />
          </NavLink>

          {/* 🔍 Search */}
          <SearchBar />

          {/* 🌗 Right Section */}
          <Box display="flex" alignItems="center">
            {/* 🌙 Theme Toggle */}
            <IconButton onClick={toggleMode} sx={{ ml: 1, color: "#F5B800" }}>
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* 🔔 Notifications */}
            <IconButton onClick={() => navigate("/notifications")} sx={{ ml: 1, color: "#FFFFFF" }}>
              <Badge badgeContent={notificationCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* 🛒 Cart */}
            <IconButton onClick={() => navigate("/cart")} sx={{ ml: 1, color: "#FFFFFF" }}>
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* 📱 Mobile Drawer */}
            {isMobile ? (
              <IconButton edge="end" sx={{ ml: 1, color: "#FFFFFF" }} onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
                {/* Navbar Links */}
                {menuItems.map(({ text, path, icon }) => (
                  <NavLink
                    key={text}
                    to={path}
                    style={({ isActive }) => ({
                      color: isActive ? "#F5B800" : "#FFFFFF",
                      textDecoration: "none",
                      fontWeight: "bold",
                      margin: "0 10px",
                      display: "flex",
                      alignItems: "center",
                      paddingBottom: "4px",
                      borderBottom: isActive ? "2px solid #F5B800" : "none",
                      transition: "color 0.3s ease, border-bottom 0.3s ease",
                    })}
                  >
                    <Box sx={{ mr: 1 }}>{icon}</Box>
                    {text}
                  </NavLink>
                ))}

                {/* 👤 Profile with Hover Dropdown & Arrow */}
                <Box
                  onMouseEnter={handleMenuOpen}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    color: "#FFFFFF",
                    ml: 2,
                  }}
                >
                  <AccountCircle fontSize="large" />
                  <Box sx={{ ml: 1, fontWeight: "bold" }}>
                    {firstName || "User"}
                  </Box>
                  <ArrowDropDown
                    sx={{
                      ml: 0.5,
                      transition: "transform 0.3s ease",
                      transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </Box>

                <Menu
                  anchorEl={anchorEl}
                  open={isMenuOpen}
                  onClose={handleMenuClose}
                  MenuListProps={{
                    onMouseLeave: handleMenuClose,
                  }}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem onClick={() => { navigate("/profile"); handleMenuClose(); }}>
                    <ListItemIcon><Person /></ListItemIcon>
                    <ListItemText primary="My Profile" />
                  </MenuItem>

                  <MenuItem onClick={() => { navigate("/edit-profile"); handleMenuClose(); }}>
                    <ListItemIcon><Edit /></ListItemIcon>
                    <ListItemText primary="Edit Profile" />
                  </MenuItem>

                  <MenuItem onClick={() => { navigate("/addresses"); handleMenuClose(); }}>
                    <ListItemIcon><Home /></ListItemIcon>
                    <ListItemText primary="Addresses" />
                  </MenuItem>

                  <MenuItem onClick={() => { navigate("/coupons"); handleMenuClose(); }}>
                    <ListItemIcon><CardGiftcard /></ListItemIcon>
                    <ListItemText primary="Coupons" />
                  </MenuItem>

                  <MenuItem onClick={() => { navigate("/wishlist"); handleMenuClose(); }}>
                    <ListItemIcon><FavoriteBorder /></ListItemIcon>
                    <ListItemText primary="Wishlist" />
                  </MenuItem>

                  {/* 🚪 Logout */}
                  <LogoutButton closeMenu={handleMenuClose} />
                </Menu>
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

      {/* 🛡️ Spacer */}
      <Box sx={{ height: "64px" }} />
    </>
  );
};

export default UserNavbar;
