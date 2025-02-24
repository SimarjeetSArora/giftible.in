import React, { useEffect, useState } from "react";
import { fetchApprovedCategories } from "../services/categoryService";
import { Box, Grid, Typography, Paper } from "@mui/material";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchApprovedCategories().then(setCategories);
  }, []);

  return (
    <Box sx={{ py: 6 }}>
      <Typography variant="h4" textAlign="center" mb={4}>Product Categories</Typography>
      <Grid container spacing={4} justifyContent="center">
        {categories.map((cat) => (
          <Grid item xs={12} sm={6} md={4} key={cat.id}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">{cat.name}</Typography>
              <Typography variant="body2">{cat.description}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoriesPage;
