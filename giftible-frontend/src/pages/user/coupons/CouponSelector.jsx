import React, { useState } from "react";
import { Modal, Box, Typography, List, ListItem, ListItemText, IconButton, Button } from "@mui/material";
import { LocalOffer, Close } from "@mui/icons-material";
import { fetchAvailableCoupons, applyCoupon, fetchCartSummary } from "../../../services/checkoutService";

const CouponSelector = ({ appliedCoupon, setAppliedCoupon, setCartSummary, setGrandTotal, platformFee }) => {
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);

  const handleFetchCoupons = async () => {
    try {
      const couponsData = await fetchAvailableCoupons();
      setCoupons(couponsData);
      setShowCouponModal(true);
    } catch (error) {
      console.error("❌ Failed to fetch coupons:", error);
    }
  };

  const handleApplyCoupon = async (coupon) => {
    try {
      const { discount, max_discount } = await applyCoupon(coupon.code);
      setAppliedCoupon({ ...coupon, discount, max_discount });

      const updatedSummary = await fetchCartSummary(coupon.code);
      setCartSummary(updatedSummary);
      setGrandTotal(updatedSummary.final_total + platformFee);
      setShowCouponModal(false);
    } catch (error) {
      console.error("❌ Failed to apply coupon:", error);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<LocalOffer />}
        onClick={handleFetchCoupons}
        sx={{ color: "#6A4C93", borderColor: "#6A4C93", mb: 2 }}
      >
        {appliedCoupon ? `Applied: ${appliedCoupon.code}` : "Apply Coupon"}
      </Button>

      <Modal open={showCouponModal} onClose={() => setShowCouponModal(false)}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", width: 400,
          bgcolor: "background.paper", borderRadius: "12px", p: 3,
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Available Coupons</Typography>
            <IconButton onClick={() => setShowCouponModal(false)}><Close /></IconButton>
          </Box>

          {coupons.length ? (
            <List>
              {coupons.map((coupon) => (
                <ListItem
                  key={coupon.id}
                  button
                  onClick={() => handleApplyCoupon(coupon)}
                  sx={{
                    bgcolor: appliedCoupon?.code === coupon.code ? "#F5F5F5" : "#FFFFFF",
                    border: "1px solid #6A4C93", borderRadius: "8px", mb: 1,
                  }}
                >
                  <ListItemText
                    primary={<Typography fontWeight="bold">{coupon.code}</Typography>}
                    secondary={`Discount: ${coupon.discount_percentage}% (Max ₹${coupon.max_discount}) | Min Order: ₹${coupon.minimum_order_amount}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No coupons available.</Typography>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default CouponSelector;
