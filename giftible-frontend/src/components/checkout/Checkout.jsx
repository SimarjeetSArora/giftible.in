import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  fetchAddresses,
  addAddress,
  applyCoupon,
  fetchCartSummary,
  initiateRazorpayPayment,
  verifyPayment,
  placeOrder,
} from "../../services/checkoutService";

function Checkout() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [newAddress, setNewAddress] = useState({
    address_line: "",
    city: "",
    state: "",
    postal_code: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [cartSummary, setCartSummary] = useState({
    total: 0,
    discount: 0,
    final_total: 0,
  });
  const [grandTotal, setGrandTotal] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const addressesData = await fetchAddresses();
        setAddresses(addressesData);
        const summary = await fetchCartSummary(couponCode);
        setCartSummary(summary);
        setGrandTotal(summary.final_total);
      } catch (error) {
        console.error("❌ Failed to load data:", error);
        alert("❌ Failed to load data.");
      }
    };
    loadInitialData();
  }, [couponCode]);

  const handleAddAddress = async () => {
    const { address_line, city, state, postal_code } = newAddress;
    if (!address_line || !city || !state || !postal_code) {
      return alert("⚠️ Please fill all address fields.");
    }

    try {
      const addedAddress = await addAddress(newAddress);
      setAddresses([...addresses, addedAddress.address]);
      setSelectedAddress(addedAddress.address.id);
      setNewAddress({ address_line: "", city: "", state: "", postal_code: "" });
      alert("✅ Address added successfully!");
    } catch (error) {
      console.error("❌ Error adding address:", error);
      alert("❌ Error adding address.");
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return alert("⚠️ Enter a coupon code.");

    try {
      await applyCoupon(couponCode);
      const summary = await fetchCartSummary(couponCode);
      setCartSummary(summary);
      setGrandTotal(summary.final_total);
      alert("✅ Coupon applied successfully!");
    } catch (error) {
      console.error("❌ Invalid coupon code:", error);
      alert("❌ Invalid coupon code.");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const existingScript = document.getElementById("razorpay-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      } else {
        resolve(true); // Script already loaded
      }
    });
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      alert("⚠️ Please select an address.");
      return;
    }

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("❌ Failed to load Razorpay SDK.");
      return;
    }

    try {
      setIsPlacingOrder(true);

      // 🔑 STEP 1: Create a Razorpay order from backend
      const { order_id, amount } = await initiateRazorpayPayment({ amount: grandTotal });

      if (!order_id) {
        alert("❌ Failed to initiate payment.");
        return;
      }

      // 🔑 STEP 2: Open Razorpay payment modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "Giftible",
        description: "Order Payment",
        order_id: order_id,
        handler: async (response) => {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

          if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            alert("❌ Missing payment details. Payment verification failed.");
            return;
          }

          try {
            // 🔑 STEP 3: Verify payment signature on backend
            const verifyResponse = await verifyPayment({
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            });
            
            console.log("📦 Placing order with payload:", {
              address_id: selectedAddress,
              coupon_code: couponCode,
              payment_id: razorpay_payment_id,
              order_id: razorpay_order_id,
              amount: grandTotal,
              signature: razorpay_signature,
            });

            if (verifyResponse.status === "success") {
              // 🔑 STEP 4: Place order after successful payment verification
              const placedOrder = await placeOrder({
                address_id: selectedAddress,
                coupon_code: couponCode,
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
                amount: grandTotal,
                signature: razorpay_signature,
              });

              alert("✅ Payment & Order placed successfully!");
              window.location.href = `/order-success`;
            } else {
              alert("❌ Payment verification failed.");
            }
          } catch (error) {
            console.error("❌ Payment Verification Error:", error.response?.data || error.message);
            alert("❌ Error verifying payment.");
          }
        },
        prefill: {
          name: loggedInUser?.name ?? "User",
          email: loggedInUser?.email ?? "user@example.com",
        },
        theme: { color: "#3399cc" },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("❌ Payment Error:", error);
      alert("❌ Payment failed. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Checkout</Typography>

      {/* Address Selection */}
      <Box mt={4}>
        <Typography variant="h6">Select Address</Typography>
        <Select
          fullWidth
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled>Select an address</MenuItem>
          {addresses.map((addr) => (
            <MenuItem key={addr.id} value={addr.id}>
              {`${addr.address_line}, ${addr.city}, ${addr.state} - ${addr.postal_code}`}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Add New Address */}
      <Box mt={4}>
        <Typography variant="subtitle1">Add New Address</Typography>
        {["address_line", "city", "state", "postal_code"].map((field) => (
          <TextField
            key={field}
            label={field.replace("_", " ").toUpperCase()}
            fullWidth
            margin="normal"
            value={newAddress[field]}
            onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
          />
        ))}
        <Button variant="contained" onClick={handleAddAddress}>Add Address</Button>
      </Box>

      {/* Coupon Application */}
      <Box mt={4}>
        <Typography variant="h6">Apply Coupon</Typography>
        <TextField
          label="Coupon Code"
          fullWidth
          margin="normal"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <Button variant="contained" color="secondary" onClick={handleApplyCoupon}>Apply Coupon</Button>
      </Box>

      {/* Cart Summary */}
      <Box mt={4}>
        <Typography variant="h6">Cart Summary</Typography>
        <Typography>Subtotal: ₹{cartSummary.total.toFixed(2)}</Typography>
        <Typography>Discount: ₹{cartSummary.discount.toFixed(2)}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5">Grand Total: ₹{grandTotal.toFixed(2)}</Typography>
      </Box>

      {/* Payment & Place Order */}
      <Box mt={4}>
        <Button
          variant="contained"
          color="success"
          fullWidth
          onClick={handlePayment}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? "Processing..." : `Pay ₹${grandTotal.toFixed(2)} & Place Order`}
        </Button>
      </Box>
    </Container>
  );
}

export default Checkout;
