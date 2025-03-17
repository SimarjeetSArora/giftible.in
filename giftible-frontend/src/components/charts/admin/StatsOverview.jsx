import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom"; // ✅ Import Navigate

const StatsOverview = ({ data }) => {
  const navigate = useNavigate(); // ✅ Initialize navigation

  const stats = [
    { label: "Total Users", value: data.total_users, key: "users", path: "/admin/manage-users" },
    { label: "Total NGOs", value: data.total_ngos, key: "ngos", path: "/admin/manage-ngos" },
    { label: "Total Products", value: data.total_products, key: "products", path: "/admin/products" },
    { label: "Total Orders", value: data.total_orders, key: "orders", path: "/admin/orders/manage" },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            onClick={() => navigate(stat.path)} // ✅ Click to navigate
            sx={{
              p: 3,
              textAlign: "center",
              backgroundColor: "#6A4C93",
              color: "#FFFFFF",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)", // ✅ Hover Animation
                boxShadow: "0px 8px 16px rgba(106, 76, 147, 0.4)", // ✅ Glow Effect
              },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "#F5B800" }}>
              {stat.value.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsOverview;
