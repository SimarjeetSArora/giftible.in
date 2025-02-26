import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box, CircularProgress } from "@mui/material";

function OrderSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/user/orders"); // ✅ Redirect to the "My Orders" page after 5 seconds
    }, 5000);

    return () => clearTimeout(timer); // Cleanup to avoid memory leaks
  }, [navigate]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom color="success.main">
        🎉 Order Placed Successfully!
      </Typography>
      <Typography variant="body1" gutterBottom>
        You will be redirected to <strong>My Orders</strong> page in 5 seconds...
      </Typography>
      <Box mt={4}>
        <CircularProgress color="success" />
      </Box>
    </Container>
  );
}

export default OrderSuccess;
