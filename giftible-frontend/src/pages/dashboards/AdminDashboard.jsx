import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";

const AdminDashboard = () => {
  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" gutterBottom>
          Manage NGOs and product approvals.
        </Typography>

        <Button
          component={Link}
          to="/dashboard/admin/ngos"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mb: 2 }}
        >
          Approve NGOs
        </Button>

        <Button
          component={Link}
          to="/admin/products/approve"
          variant="contained"
          color="secondary"
          fullWidth
        >
          Approve Products
        </Button>
        
        <Button component={Link} to="/admin/create-coupon" variant="contained" color="secondary">
  Create Coupon
</Button>
<Button component={Link} to="/admin/coupons" variant="contained" color="primary" fullWidth>
          Manage Coupons
        </Button>
        <LogoutButton />  {/* ✅ Add here */}
      </Box>
    </Container>
  );
};

export default AdminDashboard;
