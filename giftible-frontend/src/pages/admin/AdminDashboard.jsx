import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Paper, Box } from "@mui/material";
import { People, Category, Storefront, ShoppingCart } from "@mui/icons-material";
import { fetchAdminDashboardStats } from "../../services/adminService"; // API Call

const AdminDashboard = () => {
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
    const fetchStats = async () => {
      try {
        const data = await fetchAdminDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  // Function to render a visually appealing tile
  const renderTile = (title, data, bgColor, icon) => (
    <Grid item xs={12} sm={6} md={4}>
      <Paper
        elevation={5}
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: bgColor,
          color: "#FFFFFF",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {icon}
        <Typography variant="h6" sx={{ mt: 1, fontWeight: "bold" }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          {data}
        </Typography>
      </Paper>
    </Grid>
  );

  // Function to render a tile with two values (side-by-side)
  const renderCombinedTile = (title, data1, label1, data2, label2, bgColor, icon) => (
    <Grid item xs={12} sm={6} md={4}>
      <Paper
        elevation={5}
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: bgColor,
          color: "#FFFFFF",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {icon}
        <Typography variant="h6" sx={{ mt: 1, fontWeight: "bold" }}>
          {title}
        </Typography>
        <Box display="flex" justifyContent="space-between" width="100%" mt={1}>
          <Box flex={1} textAlign="center">
            <Typography variant="body1">{label1}</Typography>
            <Typography variant="h5" fontWeight="bold">{data1}</Typography>
          </Box>
          <Box flex={1} textAlign="center">
            <Typography variant="body1">{label2}</Typography>
            <Typography variant="h5" fontWeight="bold">{data2}</Typography>
          </Box>
        </Box>
      </Paper>
    </Grid>
  );

  // Function to render a tile with four values (grid format)
  const renderProductTile = (title, data1, label1, data2, label2, data3, label3, data4, label4, bgColor, icon) => (
    <Grid item xs={12} sm={6} md={4}>
      <Paper
        elevation={5}
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: bgColor,
          color: "#FFFFFF",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {icon}
        <Typography variant="h6" sx={{ mt: 1, fontWeight: "bold" }}>
          {title}
        </Typography>
        <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} width="100%" mt={1}>
          <Box textAlign="center">
            <Typography variant="body1">{label1}</Typography>
            <Typography variant="h5" fontWeight="bold">{data1}</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body1">{label2}</Typography>
            <Typography variant="h5" fontWeight="bold">{data2}</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body1">{label3}</Typography>
            <Typography variant="h5" fontWeight="bold">{data3}</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body1">{label4}</Typography>
            <Typography variant="h5" fontWeight="bold">{data4}</Typography>
          </Box>
        </Box>
      </Paper>
    </Grid>
  );

  return (
    <Container maxWidth="lg">
      

      <Grid container spacing={3}>
        {/* NGOs */}
        {renderCombinedTile("NGOs", stats.pendingNGOs, "Pending", stats.totalNGOs, "Total", "#6A4C93", <People sx={{ fontSize: 50, color: "#FFFFFF" }} />)}

        {/* Users */}
        {renderCombinedTile("Users", stats.unverifiedUsers, "Unverified", stats.totalUsers, "Total", "#FF5733", <People sx={{ fontSize: 50, color: "#FFFFFF" }} />)}

        {/* Products */}
        {renderProductTile(
          "Products",
          stats.approvedProducts, "Approved",
          stats.liveProducts, "Live",
          stats.unliveProducts, "Unlive",
          stats.totalProducts, "Total",
          "#FFC300", <Storefront sx={{ fontSize: 50, color: "#FFFFFF" }} />
        )}

        {/* Categories */}
        {renderCombinedTile("Categories", stats.approvedCategories, "Approved", stats.totalCategories, "Total", "#007BFF", <Category sx={{ fontSize: 50, color: "#FFFFFF" }} />)}

        {/* Orders */}
        {renderTile("Undelivered Orders", stats.undeliveredOrders, "#DC3545", <ShoppingCart sx={{ fontSize: 50, color: "#FFFFFF" }} />)}
      </Grid>

     </Container>
  );
};

export default AdminDashboard;
