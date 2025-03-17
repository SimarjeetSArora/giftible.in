import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import {
  Container,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import StatsOverview from "../../components/charts/admin/StatsOverview";
import OrderStatusChart from "../../components/charts/admin/OrderStatusChart";
import RevenueChart from "../../components/charts/admin/RevenueChart";
import TopSellingProducts from "../../components/charts/admin/TopSellingProducts";
import CategoryChart from "../../components/charts/admin/CategoryChart";
import PayoutChart from "../../components/charts/admin/PayoutChart";
import RemainingPayouts from "../../components/charts/admin/RemainingPayouts";

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axiosInstance.get("/analytics/admin");
        setAnalyticsData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setSnackbar({ open: true, message: "Failed to fetch analytics", severity: "error" });
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5, color: "#F5B800" }} />;
  if (!analyticsData) return <Typography align="center" mt={5}>No Analytics Data Available</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: "bold", mb: 3, color: "#6A4C93" }}>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12}>
          <StatsOverview data={analyticsData} />
        </Grid>

        {/* Order Status Distribution */}
        <Grid item xs={12} md={6}>
          <OrderStatusChart data={analyticsData.order_status_distribution} />
        </Grid>

        {/* Revenue Growth */}
        <Grid item xs={12} md={6}>
          <RevenueChart data={analyticsData.revenue_growth} />
        </Grid>

        {/* Top Selling Products */}
        <Grid item xs={12} md={6}>
          <TopSellingProducts data={analyticsData.top_selling_products} />
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <CategoryChart data={analyticsData.category_distribution} />
        </Grid>

        {/* Payout Trends */}
        <Grid item xs={12} md={6}>
          <PayoutChart data={analyticsData.payout_trends} />
        </Grid>

        {/* Remaining Payouts */}
        <Grid item xs={12} md={6}>
          <RemainingPayouts data={analyticsData.remaining_payouts} />
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminAnalytics;
