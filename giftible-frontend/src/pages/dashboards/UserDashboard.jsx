import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";



function UserDashboard() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          User Dashboard
        </Typography>
        <Button component={Link} to="/cart" variant="contained" color="secondary">
        View Cart
        </Button>

        <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }} onClick={() => navigate("/products")}>
          Browse Products
        </Button>
        <Button component={Link} to="/dashboard/user/orders" variant="contained">
  My Orders
</Button>
        <LogoutButton /> 
      </Box>
    </Container>
  );
}

export default UserDashboard;
