import React, { useEffect, useState } from "react";
import {
  Container, Typography, Button, Box, Grid, Card, CardContent, IconButton, Divider,
  Modal, Paper, Snackbar, Alert
} from "@mui/material";
import { AddCircle, LocationOn } from "@mui/icons-material";
import {
  fetchAddresses, addAddress, fetchCartSummary,
  initiateRazorpayPayment, verifyPayment, placeOrder
} from "../../services/checkoutService";
import AddressForm from "./address/AddressForm";
import CouponSelector from "./coupons/CouponSelector";

function Checkout() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [cartSummary, setCartSummary] = useState({ total: 0, discount: 0, final_total: 0 });
  const [platformFee] = useState(50);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    const loadData = async () => {
      try {
        const addressesData = await fetchAddresses();
        setAddresses(addressesData);
  
        // ✅ Auto-select the default address when addresses are loaded
        const defaultAddress = addressesData.find((address) => address.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
        } else if (addressesData.length > 0) {
          // If no default address, select the first address as fallback
          setSelectedAddress(addressesData[0].id);
        }
  
        // ✅ Fetch cart summary
        const summary = await fetchCartSummary(appliedCoupon?.code);
        setCartSummary(summary);
        setGrandTotal(summary.final_total + platformFee);
      } catch (error) {
        console.error("❌ Error loading data:", error);
      }
    };
  
    loadData();
  }, [appliedCoupon, platformFee]);
  

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  const handleAddressSubmit = async (address) => {
    try {
      const response = await addAddress(address);
      setAddresses((prev) => [...prev, response.address]);
      setSelectedAddress(response.address.id);
      setShowAddressForm(false);
    } catch (error) {
      console.error("❌ Error adding address:", error);
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) return resolve(true);
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    if (!selectedAddress) {
      setSnackbar({ open: true, message: "⚠️ Please select an address.", severity: "warning" });
      return;
    }

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setSnackbar({ open: true, message: "❌ Failed to load Razorpay SDK.", severity: "error" });
      return;
    }

    try {
      setIsPlacingOrder(true);
      const { order_id, amount } = await initiateRazorpayPayment({ amount: grandTotal });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "Giftible",
        description: "Order Payment",
        order_id: order_id,
        handler: async (response) => {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
          const verifyResponse = await verifyPayment({ razorpay_payment_id, razorpay_order_id, razorpay_signature });

          if (verifyResponse.status === "success") {
            await placeOrder({
              address_id: selectedAddress,
              coupon_code: appliedCoupon?.code ?? null,
              payment_id: razorpay_payment_id,
              order_id: razorpay_order_id,
              amount: grandTotal,
              signature: razorpay_signature,
            });
            setSnackbar({ open: true, message: "✅ Order placed successfully!", severity: "success" });
            window.location.href = "/user/orders";
          } else {
            setSnackbar({ open: true, message: "❌ Payment verification failed.", severity: "error" });
          }
        },
        theme: { color: "#6A4C93" },
      };

      new window.Razorpay(options).open();
    } catch (error) {
      console.error("❌ Payment Error:", error);
      setSnackbar({ open: true, message: "❌ Payment failed.", severity: "error" });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ color: "#6A4C93", fontWeight: "bold" }}>Checkout</Typography>

      {/* 🏠 Address Selection */}
      <Box mt={4}>
  <Typography variant="h6" sx={{ color: "#1B1B1B" }}>Select Address</Typography>
  <Grid container spacing={3} mt={2}>
    {addresses.map((address) => (
      <Grid item xs={12} sm={6} key={address.id}>
        <Card
          sx={{
            border: selectedAddress === address.id ? "2px solid #F5B800" : "1px solid #ccc",
            bgcolor: selectedAddress === address.id ? "#F5F5F5" : "#FFFFFF",
            height: "190px",
            cursor: "pointer",
            position: "relative"
          }}
          onClick={() => setSelectedAddress(address.id)}
        >
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <LocationOn sx={{ color: "#6A4C93" }} />
              <Typography variant="subtitle1" ml={1} fontWeight="bold">{address.full_name}</Typography>
            </Box>
            <Typography variant="body2">{address.contact_number}</Typography>
            <Typography variant="body2">{address.address_line}</Typography>
            <Typography variant="body2">{`${address.city}, ${address.state} - ${address.pincode}`}</Typography>
            {address.landmark && <Typography variant="body2">Landmark: {address.landmark}</Typography>}

            {/* ⭐ Default Address Tag at the Bottom Right */}
            {address.is_default && (
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  bottom: 5,
                  right: 10,
                  bgcolor: "#F5B800",
                  color: "#1B1B1B",
                  px: 1,
                  py: 0.5,
                  fontWeight: "bold",
                  borderRadius: "5px",
                }}
              >
                Default Address
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    ))}

    {/* ➕ Add New Address */}
    <Grid item xs={12} sm={6}>
      <Card
        sx={{
          border: "2px dashed #6A4C93",
          height: "190px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setShowAddressForm(true)}
      >
        <CardContent sx={{ textAlign: "center" }}>
          <IconButton sx={{ color: "#6A4C93" }}>
            <AddCircle fontSize="large" />
          </IconButton>
          <Typography>Add New Address</Typography>
        </CardContent>
      </Card>
    </Grid>
  </Grid>

  {/* Address Form Modal */}
  <Modal open={showAddressForm} onClose={() => setShowAddressForm(false)}>
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        bgcolor: "background.paper",
        borderRadius: "12px",
        p: 3,
      }}
    >
      <AddressForm onSubmit={handleAddressSubmit} onCancel={() => setShowAddressForm(false)} />
    </Box>
  </Modal>
</Box>

<Divider sx={{ my: 4 }} />


      {/* 🎟️ Coupon Section */}
      <CouponSelector
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
        setCartSummary={setCartSummary}
        setGrandTotal={setGrandTotal}
        platformFee={platformFee}
      />

      {/* 🧾 Cart Summary */}
      <Box mt={4}>
        <Typography variant="h6" sx={{ color: "#1B1B1B" }}>Cart Summary</Typography>
        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: "#F9F9F9" }}>
          <Typography>Subtotal: ₹{cartSummary.total.toFixed(2)}</Typography>
          <Typography>Discount: ₹{cartSummary.discount.toFixed(2)}</Typography>
          <Typography>Platform Fee: ₹{platformFee.toFixed(2)}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Grand Total: ₹{grandTotal.toFixed(2)}
          </Typography>
        </Paper>
      </Box>

      {/* 💳 Payment Button */}
      <Box mt={4}>
        <Button
          variant="contained"
          fullWidth
          sx={{ bgcolor: "#F5B800", color: "#6A4C93", fontWeight: "bold" }}
          onClick={handlePayment}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? "Processing..." : `Pay ₹${grandTotal.toFixed(2)} & Place Order`}
        </Button>
      </Box>

 {/* ✅ Snackbar Component */}
 <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity={snackbar.severity} onClose={handleSnackbarClose}>
        {snackbar.message}
      </Alert>
    </Snackbar>


    </Container>
  );
}

export default Checkout;
