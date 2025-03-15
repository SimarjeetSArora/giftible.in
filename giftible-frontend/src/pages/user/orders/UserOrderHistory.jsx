import React, { useEffect, useState } from "react";
import { getUserOrders } from "../../../services/orderService";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  Chip,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const fetchedOrders = await getUserOrders();
        const sortedOrders = fetchedOrders.sort((a, b) => b.id - a.id);
        setOrders(sortedOrders);
      } catch (error) {
        console.error("❌ Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleOrderClick = (orderId) => {
    navigate(`/order-details/${orderId}`);
  };

 
  

  return (
    <Container maxWidth="md" sx={{ mt: 5, minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: "bold", color: "#6A4C93", textAlign: "center" }}
      >
        📦 Your Orders
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress sx={{ color: "#6A4C93" }} />
        </Box>
      ) : orders.length === 0 ? (
        <Typography
          sx={{ textAlign: "center", fontSize: "1.2rem", color: "#6A4C93", mt: 5 }}
        >
          No orders found. Start shopping now! 🛍️
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: "12px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.02)", boxShadow: "0px 6px 16px rgba(0,0,0,0.2)" },
                  cursor: "pointer",
                  backgroundColor: "#FFFFFF",
                }}
                onClick={() => handleOrderClick(order.id)}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={8}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1B1B1B" }}>
                      Order ID: #{order.id}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#6A4C93", fontWeight: "bold" }}>
                      Total: ₹{order.total_amount}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
                      Placed on: {new Date(order.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} textAlign="right">
                    
                    <Button
                      variant="outlined"
                      sx={{
                        mt: 2,
                        color: "#6A4C93",
                        borderColor: "#6A4C93",
                        "&:hover": { bgcolor: "#F5B800", color: "#6A4C93" },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/order-details/${order.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default OrderHistory;
