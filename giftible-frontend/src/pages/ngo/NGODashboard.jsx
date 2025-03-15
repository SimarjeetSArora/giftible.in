import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import API_BASE_URL from "../../config";

const NGODashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    liveProducts: 0,
    approvedProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    shippedOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0,
    totalReceived: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      const ngoId = loggedInUser?.ngo_id;

      if (!ngoId) {
        console.error("❌ NGO ID not found for the logged-in user.");
        return;
      }

      const response = await axiosInstance.get(`${API_BASE_URL}/ngo/dashboard-stats`, {
        params: { ngo_id: ngoId },
      });

      setStats(response.data);
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const tileStyles = {
    cursor: "pointer",
    borderRadius: "16px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)",
    transition: "0.3s",
    height: 160, // ✅ Ensuring uniform height
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
    },
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" mb={3}>
        NGO Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* 📦 Product Statistics */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={tileStyles} onClick={() => navigate("/ngo/products")}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="primary">Products</Typography>
              <Typography variant="h4" fontWeight="bold">{stats.totalProducts}</Typography>
              <Typography color="textSecondary" fontSize={14}>
                Live: {stats.liveProducts} | Approved: {stats.approvedProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 📦 Order Statistics */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={tileStyles} onClick={() => navigate("/ngo/orders")}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="primary">Orders</Typography>
              <Typography variant="h4" fontWeight="bold">
                {stats.pendingOrders + stats.completedOrders + stats.shippedOrders + stats.confirmedOrders}
              </Typography>
              <Typography color="textSecondary" fontSize={14}>
                Pending: {stats.pendingOrders} | Shipped: {stats.shippedOrders}
              </Typography>
              <Typography color="textSecondary" fontSize={14}>
                Confirmed: {stats.confirmedOrders} | Completed: {stats.completedOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 💰 Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={tileStyles}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="primary">Total Revenue</Typography>
              <Typography variant="h4" fontWeight="bold">₹{stats.totalRevenue.toLocaleString()}</Typography>
              <Typography color="textSecondary" fontSize={14}>This Month</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 💵 Amount Received */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={tileStyles}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="primary">Total Received</Typography>
              <Typography variant="h4" fontWeight="bold">₹{stats.totalReceived.toLocaleString()}</Typography>
              <Typography color="textSecondary" fontSize={14}>This Month</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NGODashboard;
