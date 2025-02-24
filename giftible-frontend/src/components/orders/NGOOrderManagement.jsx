import React, { useEffect, useState } from "react";
import { getNGOOrders, updateOrderStatus } from "../../services/orderService";
import { Container, Typography, Paper, Button, Select, MenuItem } from "@mui/material";

function NGOOrderManagement() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => setOrders(await getNGOOrders());
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    await updateOrderStatus(orderId, status);
    alert("Status updated!");
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>NGO Orders</Typography>
      {orders.map((order) => (
        <Paper key={order.id} sx={{ p: 2, mt: 2 }}>
          <Typography>Order ID: {order.id}</Typography>
          <Typography>Total: ₹{order.total_amount}</Typography>
          <Select
            value={order.status}
            onChange={(e) => handleStatusChange(order.id, e.target.value)}
            fullWidth
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
          </Select>
        </Paper>
      ))}
    </Container>
  );
}

export default NGOOrderManagement;
