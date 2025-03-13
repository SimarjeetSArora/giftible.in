import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createCoupon } from "../../../services/couponService"; // ✅ Use coupon service

const getColors = (mode) => ({
  background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
  text: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
  accent: "#F5B800",
  secondary: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  cardBackground: mode === "dark" ? "#292929" : "#FFFFFF",
});

function CreateCoupon() {
  const theme = useTheme();
  const colors = getColors(theme.palette.mode);
  const navigate = useNavigate(); // ✅ Navigation for redirection

  const [couponData, setCouponData] = useState({
    code: "",
    discount_percentage: "",
    max_discount: "",
    usage_limit: "one_time",
    minimum_order_amount: "",
    is_active: true,
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Prevent negative values in numeric fields
    if ((name === "discount_percentage" || name === "minimum_order_amount" || name === "max_discount") && value < 0) return;

    setCouponData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setCouponData((prev) => ({ ...prev, is_active: !prev.is_active }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!couponData.code || !couponData.discount_percentage || !couponData.minimum_order_amount || !couponData.max_discount) {
      return setSnackbar({ open: true, message: "⚠️ Please fill all required fields.", severity: "warning" });
    }

    try {
      await createCoupon(couponData); // ✅ Use coupon service

      setSnackbar({ open: true, message: "✅ Coupon created successfully!", severity: "success" });

      setTimeout(() => {
        navigate("/admin/coupons"); // ✅ Redirect after success
      }, 1500);

    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.detail || "❌ Error creating coupon.", severity: "error" });
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 4,
        p: 3,
        background: colors.cardBackground,
        borderRadius: "12px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: colors.secondary, textAlign: "center", fontWeight: "bold" }}>
        🎟️ Create Coupon
      </Typography>

      <Box component="form" onSubmit={handleSubmit} mt={3} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Coupon Code"
          name="code"
          value={couponData.code}
          onChange={handleChange}
          fullWidth
          required
          sx={{
            bgcolor: colors.background,
            borderRadius: "8px",
            input: { color: colors.text },
          }}
        />

        <TextField
          label="Discount Percentage (%)"
          name="discount_percentage"
          type="number"
          value={couponData.discount_percentage}
          onChange={handleChange}
          fullWidth
          required
          sx={{
            bgcolor: colors.background,
            borderRadius: "8px",
            input: { color: colors.text },
          }}
        />

        <TextField
          label="Maximum Discount (₹)"
          name="max_discount"
          type="number"
          value={couponData.max_discount}
          onChange={handleChange}
          fullWidth
          required
          sx={{
            bgcolor: colors.background,
            borderRadius: "8px",
            input: { color: colors.text },
          }}
        />

        <FormControl fullWidth>
          <InputLabel>Usage Limit</InputLabel>
          <Select
            name="usage_limit"
            value={couponData.usage_limit}
            onChange={handleChange}
            label="Usage Limit"
            sx={{
              bgcolor: colors.background,
              borderRadius: "8px",
              color: colors.text,
            }}
          >
            <MenuItem value="one_time">One Time Use</MenuItem>
            <MenuItem value="one_per_day">One Per Day</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Minimum Order Amount (₹)"
          name="minimum_order_amount"
          type="number"
          value={couponData.minimum_order_amount}
          onChange={handleChange}
          fullWidth
          required
          sx={{
            bgcolor: colors.background,
            borderRadius: "8px",
            input: { color: colors.text },
          }}
        />

        <FormControlLabel
          control={<Switch checked={couponData.is_active} onChange={handleToggle} />}
          label={couponData.is_active ? "✅ Active" : "❌ Inactive"}
          sx={{ mt: 2, color: colors.text }}
        />

        <Button
          variant="contained"
          sx={{
            bgcolor: colors.secondary,
            color: "#FFFFFF",
            borderRadius: "8px",
            py: 1.5,
            fontWeight: "bold",
            "&:hover": { background: "#F5A000" },
          }}
          type="submit"
          fullWidth
        >
          🎟️ Create Coupon
        </Button>
      </Box>

      {/* ✅ Snackbar Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CreateCoupon;
