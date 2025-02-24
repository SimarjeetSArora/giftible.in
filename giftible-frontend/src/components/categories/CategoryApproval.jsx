import React, { useEffect, useState } from "react";
import { fetchAllCategories, approveCategory } from "../../services/categoryService";
import { Box, Button, Typography, Grid, Paper } from "@mui/material";

const CategoryApproval = () => {
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    try {
      const data = await fetchAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("❌ Failed to load categories:", err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleApproval = async (id, is_approved) => {
    try {
      await approveCategory(id, is_approved);
      alert(`✅ Category ${is_approved ? "approved" : "rejected"} successfully!`);
      loadCategories();
    } catch (err) {
      console.error("❌ Approval failed:", err);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" mb={3}>Manage Categories</Typography>
      <Grid container spacing={2}>
        {categories.map((cat) => (
          <Grid item xs={12} md={6} key={cat.id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">{cat.name}</Typography>
              <Typography variant="body2">{cat.description}</Typography>
              <Typography variant="caption" color={cat.is_approved ? "green" : "orange"}>
                Status: {cat.is_approved ? "Approved" : "Pending"}
              </Typography>
              {!cat.is_approved && (
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <Button variant="contained" color="success" onClick={() => handleApproval(cat.id, true)}>
                    Approve
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleApproval(cat.id, false)}>
                    Reject
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryApproval;
