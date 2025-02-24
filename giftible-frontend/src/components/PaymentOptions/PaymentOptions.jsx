import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
} from "@mui/material";
import axios from "axios";
import API_BASE_URL from "../../config";

function PaymentOptions({ orderId }) {
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [orderDetails, setOrderDetails] = useState(null);
  const [platformFee, setPlatformFee] = useState(20); // Nominal platform fee
  const [codCharge, setCodCharge] = useState(50); // Market norm COD charge
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  useEffect(() => {
    if (orderDetails) {
      calculateTotal();
    }
  }, [orderDetails, paymentMethod]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
      setOrderDetails(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    let baseAmount = orderDetails.total_amount;
    let total = baseAmount + platformFee;
    if (paymentMethod === "cod") {
      total += codCharge;
    }
    setTotalAmount(total);
  };

  const handlePaymentSelection = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handlePaymentProceed = () => {
    if (paymentMethod === "cod") {
      alert("Order placed successfully with COD!");
      // Call backend API to confirm order with COD
    } else {
      // Redirect to Razorpay payment flow
      window.location.href = `${API_BASE_URL}/payments/razorpay/${orderId}`;
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h6">Loading payment options...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Choose Payment Method
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="subtitle1">Order Summary</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>Subtotal: ₹{orderDetails.total_amount}</Typography>
            <Typography>Platform Fee: ₹{platformFee}</Typography>
            {paymentMethod === "cod" && <Typography>COD Charge: ₹{codCharge}</Typography>}
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6">Grand Total: ₹{totalAmount}</Typography>

            <RadioGroup value={paymentMethod} onChange={handlePaymentSelection}>
              <FormControlLabel value="razorpay" control={<Radio />} label="Pay via Razorpay" />
              <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery (COD)" />
            </RadioGroup>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handlePaymentProceed}
              sx={{ mt: 2 }}
            >
              Proceed to Pay
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default PaymentOptions;
