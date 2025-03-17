import React, { useEffect, useState } from "react";
import {
  Container, Typography, Button, Box, Grid, IconButton, Paper, Divider, Snackbar, Alert 
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { fetchCart, removeFromCart, clearCart, addToCart } from "../../services/cartService";
import API_BASE_URL from "../../config";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  

  const loadCart = async () => {
    try {
      const items = await fetchCart();
      setCart(items);
      updateCartBadge(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const updateCartBadge = (cartItems) => {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { count: totalItems } }));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity <= 0) {
      await handleRemove(item.product_id);
      return;
    }

    try {
      await addToCart(item.product_id, newQuantity - item.quantity);
      loadCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      const updatedCart = cart.filter(item => item.product_id !== productId);
      setCart(updatedCart);
      updateCartBadge(updatedCart);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setCart([]);
      updateCartBadge([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (cart.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="h5" sx={{ color: "#6A4C93" }}>Your cart is empty.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: "#6A4C93", fontWeight: "bold" }}>
        Shopping Cart
      </Typography>

      <Grid container spacing={3}>
        {cart.map((item) => (
          <Grid item xs={12} key={item.product_id}>
            <Paper elevation={3} sx={{ borderRadius: "12px", p: 2, display: "flex", alignItems: "center" }}>
              <Box
                display="flex"
                alignItems="center"
                sx={{ cursor: "pointer" }}
                onClick={() => handleProductClick(item.product_id)}
              >
                <img
                  src={item.image_url ? `${API_BASE_URL}/${item.image_url}` : "/placeholder.png"}
                  alt={item.product_name}
                  width="80"
                  style={{ borderRadius: "8px", marginRight: "16px" }}
                />
                <Box>
                  <Typography variant="h6" sx={{ color: "#1B1B1B" }}>
                    {item.product_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6A4C93" }}>Price: ₹{item.price}</Typography>
                  <Typography variant="body2" sx={{ color: "#6A4C93" }}>
                    Total: ₹{(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Box ml="auto" display="flex" alignItems="center">
                <IconButton
                  onClick={() => handleQuantityChange(item, item.quantity - 1)}
                  sx={{ color: "#F5B800" }}
                >
                  <Remove />
                </IconButton>

                <Typography variant="body1" sx={{ mx: 1, width: "30px", textAlign: "center" }}>
                  {item.quantity}
                </Typography>

                <IconButton
                  onClick={() => handleQuantityChange(item, item.quantity + 1)}
                  sx={{ color: "#F5B800" }}
                >
                  <Add />
                </IconButton>

                <IconButton
                  onClick={() => handleRemove(item.product_id)}
                  sx={{ ml: 2, color: "#FF4C4C" }}
                >
                  <Delete />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1B1B1B" }}>
          Total: ₹{calculateTotal()}
        </Typography>

        <Box>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearCart}
            sx={{ borderColor: "#FF4C4C", color: "#FF4C4C", mr: 2 }}
          >
            Clear Cart
          </Button>
          <Button
  variant="contained"
  sx={{
    bgcolor: "#F5B800",
    color: "#6A4C93",
    "&:hover": { bgcolor: "#E0A700" },
  }}
  disabled={cart.some(item => item.outOfStock)} // ✅ Disable if out-of-stock items exist
  onClick={() => {
    if (cart.some(item => item.outOfStock)) {
      setSnackbar({ open: true, message: "Some items are out of stock. Please update your cart.", severity: "error" });
      return;
    }
    navigate("/checkout", { state: { cart } });
  }}
>
  Proceed to Checkout
</Button>

{/* ✅ Snackbar Notification */}
<Snackbar
  open={snackbar.open}
  autoHideDuration={3000}
  onClose={() => setSnackbar({ open: false })}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
  <Alert severity={snackbar.severity} onClose={() => setSnackbar({ open: false })}>
    {snackbar.message}
  </Alert>
</Snackbar>

        </Box>
      </Box>
    </Container>
  );
}

export default Cart;
