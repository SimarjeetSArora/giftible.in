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
        <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }} onClick={() => navigate("/ngo/products/add")}>
          Add Product
        </Button>
        <Button variant="contained" color="secondary" fullWidth onClick={() => navigate("/ngo/products/manage")}>
          Manage Products
        </Button>
        <Button component={Link} to="/dashboard/ngo/orders" variant="contained">
  Manage Orders
</Button>

        <LogoutButton />
      </Box>
    </Container>
  );
}

export default NGODashboard;
