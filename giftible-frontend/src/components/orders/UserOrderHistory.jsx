import React, { useEffect, useState } from "react";
import { getUserOrders } from "../../services/orderService";
import { Container, Typography, Paper, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      const fetchedOrders = await getUserOrders();
      // 🔽 Sort orders in descending order based on order ID
      const sortedOrders = fetchedOrders.sort((a, b) => b.id - a.id);
      setOrders(sortedOrders);
    };
    loadOrders();
  }, []);

  const handleOrderClick = (orderId) => {
    navigate(`/order-details/${orderId}`); // 🔑 Navigate to order details page
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Your Orders</Typography>
      {orders.map((order) => (
        <Paper
          key={order.id}
          sx={{ p: 2, mt: 2, cursor: "pointer", "&:hover": { backgroundColor: "#f0f0f0" } }}
          onClick={() => handleOrderClick(order.id)}
        >
          <Typography>Order ID: {order.id}</Typography>
          <Typography>Total: ₹{order.total_amount}</Typography>
          <Typography>Status: {order.status}</Typography>
        </Paper>
      ))}
    </Container>
  );
}

export default OrderHistory;
