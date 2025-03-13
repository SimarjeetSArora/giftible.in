import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Box,
  Snackbar,
  Button,  // ✅ Import Button
} from "@mui/material";
import { fetchCoupons, toggleCouponStatus } from "../../../services/couponService";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate

const getColors = (mode) => ({
  background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
  text: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
  accent: "#F5B800",
  secondary: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  cardBackground: mode === "dark" ? "#292929" : "#FFFFFF",
  tableHeader: "#6A4C93",
});

function CouponList() {
  const theme = useTheme();
  const colors = getColors(theme.palette.mode);
  const navigate = useNavigate(); // ✅ Hook for navigation

  const [coupons, setCoupons] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    const data = await fetchCoupons();
    setCoupons(data);
  };

  const handleToggle = async (couponId, currentStatus) => {
    try {
      setCoupons((prevCoupons) =>
        prevCoupons.map((coupon) =>
          coupon.id === couponId ? { ...coupon, is_active: !currentStatus } : coupon
        )
      );
      await toggleCouponStatus(couponId, !currentStatus);
      setSnackbar({ open: true, message: "✅ Coupon status updated!", severity: "success" });
    } catch (error) {
      setCoupons((prevCoupons) =>
        prevCoupons.map((coupon) =>
          coupon.id === couponId ? { ...coupon, is_active: currentStatus } : coupon
        )
      );
      setSnackbar({ open: true, message: `❌ ${error}`, severity: "error" });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, py: 3, background: colors.cardBackground, borderRadius: "12px" }}>
      
      {/* ✅ Header Section with Create Coupon Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h4" sx={{ color: colors.secondary, fontWeight: "bold", textAlign: { xs: "center", sm: "left" } }}>
          Coupon Management
        </Typography>

        {/* ✅ Create Coupon Button */}
        <Button
          variant="contained"
          sx={{
            background: colors.accent,
            color: "#1B1B1B",
            fontWeight: "bold",
            "&:hover": { background: "#F5A000" },
            mt: { xs: 2, sm: 0 },
          }}
          onClick={() => navigate("/admin/create-coupon")}
        >
          Create Coupon
        </Button>
      </Box>

      {/* Table with Responsive Scroll */}
      <TableContainer component={Paper} sx={{ background: colors.cardBackground, borderRadius: "12px", overflowX: "auto" }}>
        <Table>
          <TableHead sx={{ background: colors.tableHeader }}>
            <TableRow>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Code</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Discount (%)</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Usage Limit</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Min Order</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: colors.text, py: 3 }}>
                  No coupons available.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow
                  key={coupon.id}
                  sx={{
                    "&:hover": { backgroundColor: "#F5B800" },
                  }}
                >
                  <TableCell sx={{ color: colors.text, fontWeight: "bold" }}>{coupon.code}</TableCell>
                  <TableCell sx={{ color: colors.text }}>{coupon.discount_percentage}%</TableCell>
                  <TableCell sx={{ color: colors.text }}>{coupon.usage_limit}</TableCell>
                  <TableCell sx={{ color: colors.text }}>₹{coupon.minimum_order_amount}</TableCell>
                  <TableCell>
                    <Switch
                      checked={coupon.is_active}
                      onChange={() => handleToggle(coupon.id, coupon.is_active)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ✅ Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}

export default CouponList;
