import React, { useEffect, useState } from "react";
import { Container, Typography, Button, Box, Grid, TextField } from "@mui/material";
import { fetchCart, removeFromCart, clearCart } from "../../services/cartService";
import API_BASE_URL from "../../config";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const items = await fetchCart();
      setCart(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      loadCart();  // Refresh cart after removal
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  if (cart.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Typography variant="h5" align="center">Your cart is empty.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Shopping Cart</Typography>

      <Grid container spacing={3}>
        {cart.map((item) => (
          <Grid item xs={12} key={item.product_id}>
            <Box display="flex" alignItems="center" justifyContent="space-between" p={2} border="1px solid #ccc" borderRadius="8px">
              <Box display="flex" alignItems="center">
              <img
                src={item.image_url ? `${API_BASE_URL}/${item.image_url}` : "/placeholder.png"}
                alt={item.product_name}
                width="80"
                style={{ borderRadius: "4px" }}
                />

                <Box ml={2}>
                  <Typography variant="h6">{item.product_name}</Typography>
                  <Typography variant="body2">Price: ₹{item.price}</Typography>
                  <Typography variant="body2">Quantity: {item.quantity}</Typography>
                  <Typography variant="body2">Total: ₹{(item.price * item.quantity).toFixed(2)}</Typography>
                </Box>
              </Box>
              <Button variant="outlined" color="error" onClick={() => handleRemove(item.product_id)}>
                Remove
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Total: ₹{calculateTotal()}</Typography>
        <Box>
          <Button variant="contained" color="secondary" onClick={handleClearCart} sx={{ mr: 2 }}>
            Clear Cart
          </Button>
          <Button variant="contained" color="primary" onClick={() => navigate("/checkout", { state: { cart } })}>
            Proceed to Checkout
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Cart;
