import React, { useEffect, useState } from "react";
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Switch } from "@mui/material";
import { fetchCoupons, toggleCouponStatus } from "../../services/couponService";

function CouponList() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    const data = await fetchCoupons();
    setCoupons(data);
  };

  const handleToggle = async (id, currentStatus) => {
    await toggleCouponStatus(id, !currentStatus);
    loadCoupons();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Coupon Management</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Discount (%)</TableCell>
            <TableCell>Usage Limit</TableCell>
            <TableCell>Min Order</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell>{coupon.code}</TableCell>
              <TableCell>{coupon.discount_percentage}</TableCell>
              <TableCell>{coupon.usage_limit}</TableCell>
              <TableCell>₹{coupon.minimum_order_amount}</TableCell>
              <TableCell>
                <Switch
                  checked={coupon.is_active}
                  onChange={() => handleToggle(coupon.id, coupon.is_active)}
                />
              </TableCell>
              <TableCell>
                <Button variant="contained" color="primary" onClick={() => alert(`Coupon ID: ${coupon.id}`)}>View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default CouponList;
