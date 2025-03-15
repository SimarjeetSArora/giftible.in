import React, { useEffect, useState } from "react";
import { fetchApprovedCategories } from "../services/categoryService";
import { Box, Grid, Typography, Card, CardContent } from "@mui/material";
import { Link } from "react-router-dom";
import { useThemeContext } from "../context/ThemeContext"; // ✅ Import Theme Context

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const { mode } = useThemeContext(); // ✅ Get current theme mode

  useEffect(() => {
    fetchApprovedCategories().then(setCategories);
  }, []);

  // 🎨 Define colors dynamically based on theme
  const colors = {
    background: mode === "dark" ? "#1B1B1B" : "#F5F5F5",
    cardBg: mode === "dark" ? "#292929" : "#FFFFFF",
    textPrimary: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
    textSecondary: mode === "dark" ? "#F5B800" : "#6A4C93",
    boxShadow: mode === "dark" ? "0px 6px 16px rgba(255, 255, 255, 0.1)" : "0px 6px 16px rgba(0, 0, 0, 0.12)",
    hoverShadow: mode === "dark" ? "0px 8px 20px rgba(255, 255, 255, 0.15)" : "0px 8px 20px rgba(0, 0, 0, 0.2)",
  };

  return (
    <Box
      sx={{
        py: 6,
        bgcolor: colors.background, // ✅ Dynamic background color
        minHeight: "100vh",
        transition: "background 0.3s ease",
      }}
    >
      {/* 🔹 Header */}
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        mb={4}
        sx={{
          color: colors.textSecondary, // ✅ Adaptive color
          letterSpacing: 1.2,
        }}
      >
        Product Categories
      </Typography>

      {/* 🔹 Categories Grid */}
      <Grid container spacing={4} justifyContent="center">
        {categories.map((cat) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
            <Card
              component={Link}
              to={`/products?category_ids=${cat.id}`}
              sx={{
                textDecoration: "none",
                bgcolor: colors.cardBg, // ✅ Adaptive card background
                textAlign: "center",
                borderRadius: "16px",
                boxShadow: colors.boxShadow,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: colors.hoverShadow,
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    color: colors.textPrimary, // ✅ Adaptive text color
                    textTransform: "capitalize",
                    letterSpacing: "0.5px",
                  }}
                >
                  {cat.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.textSecondary, // ✅ Adaptive secondary color
                    mt: 1,
                  }}
                >
                  {cat.description || "Explore amazing products in this category."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoriesPage;
