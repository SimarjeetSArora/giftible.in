import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { People, Category, Storefront, ShoppingCart } from "@mui/icons-material";
import { fetchAdminDashboardStats } from "../../services/adminService";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingNGOs: 0,
    totalNGOs: 0,
    unverifiedUsers: 0,
    totalUsers: 0,
    approvedProducts: 0,
    liveProducts: 0,
    unliveProducts: 0,
    totalProducts: 0,
    approvedCategories: 0,
    totalCategories: 0,
    undeliveredOrders: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await fetchAdminDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("❌ Error fetching admin dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const tileStyles = {
    cursor: "pointer",
    borderRadius: "16px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)",
    transition: "0.3s",
    height: 160,
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
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* NGOs */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={tileStyles} onClick={() => navigate("/admin/ngos")}> 
            <CardContent>
              <People sx={{ fontSize: 50, color: "#6A4C93" }} />
              <Typography variant="h6" fontWeight="bold" color="primary">NGOs</Typography>
              <Typography variant="h4" fontWeight="bold">{stats.totalNGOs}</Typography>
              <Typography color="textSecondary" fontSize={14}>
                Pending: {stats.pendingNGOs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={tileStyles} onClick={() => navigate("/admin/users")}> 
            <CardContent>
              <People sx={{ fontSize: 50, color: "#FF5733" }} />
              <Typography variant="h6" fontWeight="bold" color="primary">Users</Typography>
              <Typography variant="h4" fontWeight="bold">{stats.totalUsers}</Typography>
              <Typography color="textSecondary" fontSize={14}>
                Unverified: {stats.unverifiedUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Products */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={tileStyles} onClick={() => navigate("/admin/products")}> 
            <CardContent>
              <Storefront sx={{ fontSize: 50, color: "#FFC300" }} />
              <Typography variant="h6" fontWeight="bold" color="primary">Products</Typography>
              <Typography variant="h4" fontWeight="bold">{stats.totalProducts}</Typography>
              <Typography color="textSecondary" fontSize={14}>
                Approved: {stats.approvedProducts} | Live: {stats.liveProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Categories */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={tileStyles} onClick={() => navigate("/admin/categories")}> 
            <CardContent>
              <Category sx={{ fontSize: 50, color: "#007BFF" }} />
              <Typography variant="h6" fontWeight="bold" color="primary">Categories</Typography>
              <Typography variant="h4" fontWeight="bold">{stats.totalCategories}</Typography>
              <Typography color="textSecondary" fontSize={14}>
                Approved: {stats.approvedCategories}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={tileStyles} onClick={() => navigate("/admin/orders")}> 
            <CardContent>
              <ShoppingCart sx={{ fontSize: 50, color: "#DC3545" }} />
              <Typography variant="h6" fontWeight="bold" color="primary">Orders</Typography>
              <Typography variant="h4" fontWeight="bold">{stats.undeliveredOrders}</Typography>
              <Typography color="textSecondary" fontSize={14}>Undelivered Orders</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
