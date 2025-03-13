import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";
import { Link } from "react-router-dom";

function NGODashboard() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          NGO Dashboard
        </Typography>

        {/* Product Management Section */}
        <Typography variant="h6" mt={2} gutterBottom>
          Product Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mb: 2 }}
          onClick={() => navigate("/ngo/products/add")}
        >
          Add Product
        </Button>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          sx={{ mb: 2 }}
          onClick={() => navigate("/ngo/products/manage")}
        >
          Manage Products
        </Button>

        {/* Order Management */}
        <Typography variant="h6" mt={2} gutterBottom>
          Order Management
        </Typography>
        <Button component={Link} to="/dashboard/ngo/orders" variant="contained" fullWidth sx={{ mb: 2 }}>
          Manage Orders
        </Button>

        {/* Category Management Section */}
        <Typography variant="h6" mt={2} gutterBottom>
          Category Management
        </Typography>
        <Button
          variant="contained"
          color="success"
          fullWidth
          sx={{ mb: 2 }}
          onClick={() => navigate("/ngo/categories")}
        >
          Add Category
        </Button>
        <Button
          variant="contained"
          color="info"
          fullWidth
          onClick={() => navigate("/ngo/categories/manage")}
        >
          Manage Categories
        </Button>

        {/* Logout Button */}
        <LogoutButton />
      </Box>
    </Container>
  );
}

export default NGODashboard;
