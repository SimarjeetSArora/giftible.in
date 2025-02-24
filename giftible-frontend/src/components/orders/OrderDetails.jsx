import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Grid, Card, CardContent, Divider } from "@mui/material";
import { useParams } from "react-router-dom";
import { fetchOrderDetails } from "../../services/orderService";
import API_BASE_URL from "../../config";

function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const getOrderDetails = async () => {
      try {
        const data = await fetchOrderDetails(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order details:", err);
      }
    };

    getOrderDetails();
  }, [orderId]);

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5">Loading Order Details...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>🧾 Order Details</Typography>

      <Box mt={2}>
        <Typography variant="h6">Order ID: {order.id}</Typography>
        <Typography variant="body1">Status: {order.status}</Typography>
        <Typography variant="body1">Placed on: {new Date(order.created_at).toLocaleDateString()}</Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5">Products:</Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {order.order_items.map((item) => (
          <Grid item xs={12} sm={6} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{item.product.name}</Typography>
                {item.product.images?.length > 0 && (
                  <img
                    src={`${API_BASE_URL}/${item.product.images[0]?.image_url}`}
                    alt={item.product.name}
                    style={{ width: "100%", height: "150px", objectFit: "cover", marginTop: "8px" }}
                  />
                )}
                <Typography variant="body2" sx={{ mt: 1 }}>{item.product.description}</Typography>
                <Typography variant="subtitle1">Quantity: {item.quantity}</Typography>
                <Typography variant="subtitle2">Price per item: ₹{item.price.toFixed(2)}</Typography>
                <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: "bold" }}>
                  Total: ₹{(item.price * item.quantity).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="h5">Order Summary:</Typography>
        <Typography variant="body1">Total Amount: ₹{order.total_amount.toFixed(2)}</Typography>
      </Box>
    </Container>
  );
}

export default OrderDetails;
