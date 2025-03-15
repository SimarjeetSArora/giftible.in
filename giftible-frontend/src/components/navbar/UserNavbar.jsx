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
  Typography,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  ShoppingCart,
  Home,
  ShoppingBag,
  LocalShipping,
  Category,
  AccountCircle,
  Logout,
  ArrowDropDown,
  Edit,
  CardGiftcard,
  FavoriteBorder,
} from "@mui/icons-material";
import { useNavigate, NavLink } from "react-router-dom";
import { useThemeContext } from "../../context/ThemeContext";
import SearchBar from "../SearchBar";
import LogoutButton from "../LogoutButton";
import { fetchCartCount } from "../../services/cartService";

const UserNavbar = () => {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [firstName, setFirstName] = useState("");

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.id;
    setFirstName(userData?.first_name || "User");

    if (!userId) {
      console.warn("User ID not found in localStorage.");
      return;
    }

    const fetchCart = async () => {
      try {
        const count = await fetchCartCount(userId);
        setCartItemCount(count);
      } catch (error) {
        console.error("❌ Error fetching cart count:", error);
      }
    };

    fetchCart();

    const handleCartUpdate = (event) => {
      setCartItemCount(event.detail?.count ?? 0);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const isMenuOpen = Boolean(anchorEl);

  const menuItems = [
    { text: "Categories", path: "/categories", icon: <Category /> },
    { text: "Products", path: "/products", icon: <ShoppingBag /> },
    { text: "Orders", path: "/user/orders", icon: <LocalShipping /> },
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
  <Box
    component="img"
    src="/assets/logo.png"
    alt="Giftible Logo"
    sx={{
      width: "auto",
      maxHeight: "40px",
      pr: 2, // ✅ Adds right padding
    }}
  />
</NavLink>


          {/* 🔍 Search */}
          <SearchBar />

          {/* 🌗 Right Section */}
          <Box display="flex" alignItems="center">
            {/* 🌙 Theme Toggle */}
            <IconButton onClick={toggleMode} sx={{ ml: 1, color: "#F5B800" }}>
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
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

                {/* 👤 Profile with Dropdown */}
                <Box
                  onClick={handleMenuOpen}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    color: "#FFFFFF",
                    ml: 2,
                    p: "5px 10px",
                    borderRadius: "20px",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.2)",
                    },
                  }}
                >
                  <AccountCircle fontSize="large" />
                  <Typography sx={{ ml: 1, fontWeight: "bold" }}>{firstName}</Typography>
                  <ArrowDropDown sx={{ ml: 0.5 }} />
                </Box>

                {/* Dropdown Menu */}
                <Menu
  anchorEl={anchorEl}
  open={isMenuOpen}
  onClose={handleMenuClose}
  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  transformOrigin={{ vertical: "top", horizontal: "right" }}
  sx={{
    "& .MuiPaper-root": {
      bgcolor: "#6A4C93", // Purple background
      color: "#FFFFFF", // White text
    },
  }}
>
  <MenuItem
    onClick={() => {
      navigate("/user/profile");
      handleMenuClose();
    }}
    sx={{ "&:hover": { bgcolor: "#7B5BA6" } }} // Lighter purple on hover
  >
    <ListItemIcon sx={{ color: "#FFFFFF" }}>
      <AccountCircle />
    </ListItemIcon>
    <ListItemText primary="My Profile" />
  </MenuItem>

  <MenuItem
    onClick={() => {
      navigate("/addresses");
      handleMenuClose();
    }}
    sx={{ "&:hover": { bgcolor: "#7B5BA6" } }}
  >
    <ListItemIcon sx={{ color: "#FFFFFF" }}>
      <Home />
    </ListItemIcon>
    <ListItemText primary="Addresses" />
  </MenuItem>

  <MenuItem
    onClick={() => {
      navigate("/coupons");
      handleMenuClose();
    }}
    sx={{ "&:hover": { bgcolor: "#7B5BA6" } }}
  >
    <ListItemIcon sx={{ color: "#FFFFFF" }}>
      <CardGiftcard />
    </ListItemIcon>
    <ListItemText primary="Coupons" />
  </MenuItem>

  <MenuItem
    onClick={() => {
      navigate("/wishlist");
      handleMenuClose();
    }}
    sx={{ "&:hover": { bgcolor: "#7B5BA6" } }}
  >
    <ListItemIcon sx={{ color: "#FFFFFF" }}>
      <FavoriteBorder />
    </ListItemIcon>
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
<Drawer
  anchor="right"
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  sx={{
    "& .MuiPaper-root": {
      bgcolor: "#6A4C93", // ✅ Purple background
      color: "#FFFFFF", // ✅ White text
    },
  }}
>
  <Box sx={{ width: 250, height: "100%" }}>
    <List>
      {menuItems.map(({ text, path, icon }) => (
        <ListItem
          button
          key={text}
          component={NavLink}
          to={path}
          onClick={() => setDrawerOpen(false)}
          sx={{ "&:hover": { bgcolor: "#7B5BA6" } }} // Lighter purple on hover
        >
          <ListItemIcon sx={{ color: "#FFFFFF" }}>{icon}</ListItemIcon>
          <ListItemText primary={text} />
        </ListItem>
      ))}

      {/* Additional Dropdown Options inside Drawer */}
      <ListItem
        button
        onClick={() => {
          navigate("/profile");
          setDrawerOpen(false);
        }}
        sx={{ "&:hover": { bgcolor: "#7B5BA6" } }}
      >
        <ListItemIcon sx={{ color: "#FFFFFF" }}><AccountCircle /></ListItemIcon>
        <ListItemText primary="My Profile" />
      </ListItem>

      <ListItem
        button
        onClick={() => {
          navigate("/addresses");
          setDrawerOpen(false);
        }}
        sx={{ "&:hover": { bgcolor: "#7B5BA6" } }}
      >
        <ListItemIcon sx={{ color: "#FFFFFF" }}><Home /></ListItemIcon>
        <ListItemText primary="Addresses" />
      </ListItem>

      <ListItem
        button
        onClick={() => {
          navigate("/coupons");
          setDrawerOpen(false);
        }}
        sx={{ "&:hover": { bgcolor: "#7B5BA6" } }}
      >
        <ListItemIcon sx={{ color: "#FFFFFF" }}><CardGiftcard /></ListItemIcon>
        <ListItemText primary="Coupons" />
      </ListItem>

      <ListItem
        button
        onClick={() => {
          navigate("/wishlist");
          setDrawerOpen(false);
        }}
        sx={{ "&:hover": { bgcolor: "#7B5BA6" } }}
      >
        <ListItemIcon sx={{ color: "#FFFFFF" }}><FavoriteBorder /></ListItemIcon>
        <ListItemText primary="Wishlist" />
      </ListItem>

      {/* 🚪 Logout Button - Styled Correctly */}
      <ListItem
        button
        sx={{ "&:hover": { bgcolor: "#7B5BA6" } }}
        onClick={() => setDrawerOpen(false)}
      >
        <ListItemIcon sx={{ color: "#FFFFFF" }}>
          <LogoutButton />
        </ListItemIcon>
        
      </ListItem>
    </List>
  </Box>
</Drawer>


      {/* 🛡️ Spacer */}
      <Box sx={{ height: "64px" }} />
    </>
  );
};

export default UserNavbar;
