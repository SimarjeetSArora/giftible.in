import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import { Container, Typography, Grid, CircularProgress, Snackbar, Alert } from "@mui/material";
import OrdersPerMonthChart from "../../components/charts/ngo/OrdersPerMonthChart";
import StockTrendsChart from "../../components/charts/ngo/StockTrendsChart";
import ProductsPerCategoryChart from "../../components/charts/ngo/ProductsPerCategoryChart";
import TopSellingProductsChart from "../../components/charts/ngo/TopSellingProductsChart";
import RevenueGrowthChart from "../../components/charts/ngo/RevenueGrowthChart";
import OrderStatusDistributionChart from "../../components/charts/ngo/OrderStatusDistributionChart";
import PayoutTrendsChart from "../../components/charts/ngo/PayoutTrendsChart";
import API_BASE_URL from "../../config";

const NGOAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axiosInstance.get(`${API_BASE_URL}/analytics/ngo`);
        setAnalytics(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setSnackbar({ open: true, message: "Failed to fetch analytics data.", severity: "error" });
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5, color: "#F5B800" }} />;
  if (!analytics) return <Typography align="center" mt={5}>No Analytics Data Found</Typography>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" align="center" sx={{ fontWeight: "bold", mt: 3, color: "#6A4C93" }}>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={4} mt={2}>
        <Grid item xs={12} md={6}><OrdersPerMonthChart data={analytics.orders_per_month} /></Grid>
        <Grid item xs={12} md={6}><StockTrendsChart data={analytics.stock_trends} /></Grid>
        <Grid item xs={12} md={6}><ProductsPerCategoryChart data={analytics.products_per_category} /></Grid>
        <Grid item xs={12} md={6}><TopSellingProductsChart data={analytics.top_selling_products} /></Grid>
        <Grid item xs={12} md={6}><RevenueGrowthChart data={analytics.revenue_growth} /></Grid>
        <Grid item xs={12} md={6}><OrderStatusDistributionChart data={analytics.order_status_distribution} /></Grid>
        <Grid item xs={12} md={12}><PayoutTrendsChart data={analytics.payout_trends} /></Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default NGOAnalytics;
