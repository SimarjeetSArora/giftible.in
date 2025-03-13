import React from "react";
import { Box, Container, Typography, Divider } from "@mui/material";
import { useThemeContext } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const AdminFooter = () => {
  const { mode } = useThemeContext();
  const navigate = useNavigate();

  // Colors for Dark & Light Mode
  const textColor = "#FFFFFF";
  const backgroundColor = mode === "dark" ? "#1B1B1B" : "#6A4C93";
  const mutedColor = mode === "dark" ? "#A8A8A8" : "#D3D3D3";

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: backgroundColor,
        color: textColor,
        py: 2,
        mt: 6,
      }}
    >
      <Container maxWidth="lg" sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Logo */}
        <Box/>

        <Divider sx={{ width: "100%", borderColor: mutedColor, opacity: 0.5, mb: 1.5 }} />

        {/* Copyright */}
        <Typography variant="body2" sx={{ color: mutedColor, textAlign: "center" }}>
          © {new Date().getFullYear()} Giftible. All Rights Reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default AdminFooter;
