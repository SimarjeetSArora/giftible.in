import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel } from "@mui/material";
import { createCoupon } from "../../services/couponService";

function CreateCoupon() {
  const [couponData, setCouponData] = useState({
    code: "",
    discount_percentage: "",
    usage_limit: "one_time",
    minimum_order_amount: "",
    is_active: true,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setCouponData({ ...couponData, [e.target.name]: e.target.value });
  };

  const handleToggle = () => {
    setCouponData({ ...couponData, is_active: !couponData.is_active });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!couponData.code || !couponData.discount_percentage || !couponData.minimum_order_amount) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      const response = await createCoupon({
        code: couponData.code,
        discount_percentage: parseFloat(couponData.discount_percentage),
        usage_limit: couponData.usage_limit,
        minimum_order_amount: parseFloat(couponData.minimum_order_amount),
        is_active: couponData.is_active,
      });

      setMessage(response.message || "Coupon created successfully!");
      setCouponData({ code: "", discount_percentage: "", usage_limit: "one_time", minimum_order_amount: "", is_active: true });
    } catch (err) {
      setMessage(err.response?.data?.detail || "Error creating coupon.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Create Coupon</Typography>
      {message && <Typography color={message.includes("Error") ? "error" : "primary"}>{message}</Typography>}

      <Box component="form" onSubmit={handleSubmit} mt={3}>
        <TextField
          label="Coupon Code"
          name="code"
          value={couponData.code}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Discount Percentage"
          name="discount_percentage"
          type="number"
          value={couponData.discount_percentage}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Usage Limit</InputLabel>
          <Select
            name="usage_limit"
            value={couponData.usage_limit}
            onChange={handleChange}
            label="Usage Limit"
          >
            <MenuItem value="one_time">One Time Use</MenuItem>
            <MenuItem value="one_per_day">One Per Day</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Minimum Order Amount"
          name="minimum_order_amount"
          type="number"
          value={couponData.minimum_order_amount}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <FormControlLabel
          control={<Switch checked={couponData.is_active} onChange={handleToggle} />}
          label={couponData.is_active ? "Active" : "Inactive"}
        />

        <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
          Create Coupon
        </Button>
      </Box>
    </Container>
  );
}

export default CreateCoupon;
