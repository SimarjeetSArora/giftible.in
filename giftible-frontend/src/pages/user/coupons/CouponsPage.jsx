import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import { CardGiftcard } from "@mui/icons-material";
import axiosInstance from "../../../services/axiosInstance";

const CouponsPage = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axiosInstance.get("/checkout/coupons/live"); // ✅ Fetch only active coupons
      setCoupons(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: "❌ Failed to load available coupons.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto", mt: 5, p: 3 }}>
      <Typography variant="h5" sx={{ color: isDarkMode ? "#F5B800" : "#6A4C93", fontWeight: "bold", mb: 3 }}>
        Available Coupons
      </Typography>

      {loading && <CircularProgress sx={{ display: "block", mx: "auto", mt: 3 }} />}

      {/* 🏷️ Available Coupon Cards */}
      <Grid container spacing={3} mt={2}>
        {coupons.length === 0 && !loading ? (
          <Typography variant="h6" sx={{ textAlign: "center", color: isDarkMode ? "#A8A8A8" : "#1B1B1B", width: "100%" }}>
            No available coupons at the moment.
          </Typography>
        ) : (
          coupons.map((coupon) => (
            <Grid item xs={12} sm={6} key={coupon.id}>
              <Card
                sx={{
                  border: "1px solid #ccc",
                  bgcolor: isDarkMode ? "#292929" : "#FFFFFF",
                  height: "160px",
                  position: "relative",
                  color: isDarkMode ? "#FFFFFF" : "#1B1B1B",
                  cursor: "pointer",
                  "&:hover": { border: "2px solid #F5B800", transform: "scale(1.03)", transition: "0.2s ease-in-out" },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <CardGiftcard sx={{ color: "#6A4C93" }} />
                    <Typography variant="subtitle1" ml={1} fontWeight="bold">
                      {coupon.code}
                    </Typography>
                  </Box>
                  <Typography variant="body2">Discount: {coupon.discount_percentage}%</Typography>
                  <Typography variant="body2">Max Discount: ₹{coupon.max_discount}</Typography>
                  <Typography variant="body2">Min Order: ₹{coupon.minimum_order_amount}</Typography>
                  <Typography variant="body2">
                    Usage: {coupon.usage_limit === "one_time" ? "One-time" : "One per day"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* 🔔 Snackbar Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CouponsPage;
