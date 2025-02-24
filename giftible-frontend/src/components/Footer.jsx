import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Link as MuiLink,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../context/ThemeContext";
import logo from "../assets/logo.png";

const Footer = () => {
  const { mode } = useThemeContext();
  const navigate = useNavigate();

  const textColor = mode === "dark" ? "#FFFFFF" : "#FFFFFF";
  const backgroundColor = mode === "dark" ? "#1B1B1B" : "#6A4C93";
  const accentColor = "#F5B800";
  const secondaryColor = mode === "dark" ? "#A8A8A8" : "#FFFFFF";

  const accessibilityFeatures = [
    "High Contrast Mode",
    "Screen Reader Support",
    "Keyboard Navigation",
    "Text Size Adjustment",
    "Color Blind Friendly Palette",
  ];

  const quickLinks = [
    { text: "Categories", path: "/categories" },
    { text: "NGOs", path: "/ngos" },
    { text: "About Us", path: "/about-us" },
    { text: "Login", path: "/login" },
    { text: "Register", path: "/register/user" },
  ];

  // Scroll to top and navigate
  const handleNavigation = (path) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(path);
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: backgroundColor,
        color: textColor,
        pt: 4,
        pb: 2,
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          {/* Logo & Tagline */}
          <Grid item xs={12} md={3}>
            <Box display="flex" alignItems="center" mb={2}>
              <Box
                component="img"
                src={logo}
                alt="Giftible Logo"
                sx={{ width: "auto", height: "60px", mr: 1 }}
              />
            </Box>
            <Typography variant="body2">
              Empowering donations with ease. Find NGOs, explore categories, and make a difference.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ color: accentColor }}>
              Quick Links
            </Typography>
            {quickLinks.map(({ text, path }) => (
              <MuiLink
                key={text}
                onClick={() => handleNavigation(path)}
                underline="hover"
                sx={{
                  cursor: "pointer",
                  color: textColor,
                  display: "block",
                  mb: 0.5,
                  "&:hover": { color: accentColor },
                }}
              >
                {text}
              </MuiLink>
            ))}
          </Grid>

          {/* Accessibility Features */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ color: accentColor }}>
              Accessibility Features
            </Typography>
            <List dense>
              {accessibilityFeatures.map((feature) => (
                <ListItem key={feature} disablePadding>
                  <ListItemText
                    primary={feature}
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: {
                        color: textColor,
                        "&:hover": { color: accentColor },
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Contact & Become a Seller */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom sx={{ color: accentColor }}>
              Contact Us
            </Typography>
            <Typography variant="body2" mb={1}>📧 simar.content@gmail.com</Typography>
            <Typography variant="body2" mb={2}>📞 +91 75662 62222</Typography>

            <Button
              variant="contained"
              sx={{
                bgcolor: accentColor,
                color: backgroundColor,
                fontWeight: "bold",
                width: "100%",
                mb: 2,
                "&:hover": { bgcolor: "#FFD700", color: "#1B1B1B" },
              }}
              onClick={() => handleNavigation("/become-seller")}
            >
              Become a Seller
            </Button>

            <Box display="flex" gap={1} justifyContent="center">
              {[
                { icon: <Facebook />, link: "https://facebook.com" },
                { icon: <Twitter />, link: "https://twitter.com" },
                { icon: <Instagram />, link: "https://instagram.com" },
                { icon: <LinkedIn />, link: "https://linkedin.com" },
              ].map(({ icon, link }) => (
                <IconButton
                  key={link}
                  component="a"
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: textColor, "&:hover": { color: accentColor } }}
                >
                  {icon}
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: secondaryColor }} />

        <Box textAlign="center">
          <Typography variant="body2" sx={{ color: textColor }}>
            © {new Date().getFullYear()} Giftible. All Rights Reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
