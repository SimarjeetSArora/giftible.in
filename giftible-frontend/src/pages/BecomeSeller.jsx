import React from "react";
import { Box, Typography, Button, Grid, Card, CardContent } from "@mui/material";
import { Link } from "react-router-dom";
import StoreIcon from "@mui/icons-material/Store";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import { useThemeContext } from "../context/ThemeContext";

const benefits = [
  { icon: <PeopleIcon fontSize="large" />, title: "Reach a Wider Audience", description: "Showcase your products to a vast community of socially conscious buyers." },
  { icon: <TrendingUpIcon fontSize="large" />, title: "Increase Your Impact", description: "Every purchase supports your NGO’s mission and creates positive change." },
  { icon: <StoreIcon fontSize="large" />, title: "Easy Management", description: "Manage your products, orders, and sales seamlessly through our platform." },
  { icon: <EmojiObjectsIcon fontSize="large" />, title: "Support & Guidance", description: "Get assistance whenever you need it to maximize your sales." },
];

const steps = [
  "Register as a Seller",
  "Upload Your Products",
  "Start Receiving Orders",
  "Make an Impact!",
];

const BecomeSeller = () => {
  const { mode } = useThemeContext();

  // 🎨 Color Scheme with White Text on Purple Background
  const colors = {
    textPrimary: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
    textSecondary: mode === "dark" ? "#A8A8A8" : "#1B1B1B",
    background: mode === "dark" ? "#1B1B1B" : "#F5F5F5",
    cardBackground: mode === "dark" ? "#2A2A2A" : "#FFFFFF",
    cardBorder: "#6A4C93",
    heroBackground: "#6A4C93", // Always purple
    heroText: "#FFFFFF", // Text on purple always white
    accent: "#F5B800",
    accentHover: "#E0A700",
  };

  return (
    <Box sx={{ bgcolor: colors.background, pb: 6 }}>
      {/* 🚀 Hero Section */}
      <Box
        sx={{
          bgcolor: colors.heroBackground,
          color: colors.heroText,
          py: 8,
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Join Giftible and Make a Difference!
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: "700px", mx: "auto", mb: 3 }}>
          Become a seller today and connect your products with people who care.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/register/ngo"
          sx={{
            bgcolor: colors.accent,
            color: "#1B1B1B",
            fontWeight: "bold",
            px: 4,
            py: 1.5,
            "&:hover": { bgcolor: colors.accentHover },
          }}
        >
          Get Started Now
        </Button>
      </Box>

      {/* 💡 Why Sell on Giftible */}
      <Box sx={{ maxWidth: "1200px", mx: "auto", py: 6, px: 3 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={4}
          sx={{ color: colors.textPrimary }}
        >
          Why Sell on Giftible?
        </Typography>
        <Grid container spacing={4}>
          {benefits.map(({ icon, title, description }) => (
            <Grid item xs={12} sm={6} md={3} key={title}>
              <Card
                sx={{
                  textAlign: "center",
                  py: 3,
                  bgcolor: colors.cardBackground,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <CardContent>
                  <Box sx={{ color: colors.accent, mb: 2 }}>{icon}</Box>
                  <Typography variant="h6" fontWeight="bold" mb={1} sx={{ color: colors.textPrimary }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 🪜 How It Works */}
      <Box sx={{ bgcolor: colors.heroBackground, py: 6, color: colors.heroText }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={4}
        >
          How It Works
        </Typography>
        <Grid container spacing={4} padding={5} justifyContent="center">
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  textAlign: "center",
                  py: 4,
                  px: 2,
                  borderRadius: 2,
                  bgcolor: colors.heroBackground,
                  color: colors.heroText,
                  fontWeight: "bold",
                  border: `1px solid ${colors.accent}`,
                }}
              >
                <Typography variant="h2" fontWeight="bold" color={colors.accent} mb={1}>
                  {index + 1}
                </Typography>
                <Typography variant="h6">{step}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 🚀 Call to Action */}
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Button
          variant="contained"
          component={Link}
          to="/register/ngo"
          sx={{
            bgcolor: colors.accent,
            color: "#1B1B1B",
            fontWeight: "bold",
            px: 6,
            py: 2,
            fontSize: "1.2rem",
            "&:hover": { bgcolor: colors.accentHover },
          }}
        >
          Register NGO
        </Button>
      </Box>
    </Box>
  );
};

export default BecomeSeller;
