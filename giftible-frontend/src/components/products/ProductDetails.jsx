// src/pages/ProductDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import API_BASE_URL from "../../config";
import { addToCart, fetchCartCount  } from "../../services/cartService";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // ✅ Snackbar visibility state

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`${API_BASE_URL}/products/${productId}`);
        setProduct(response.data);
        setSelectedImage(response.data.images[0]?.image_url);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProduct();

    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // ✅ Check login status
  }, [productId]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleLoginPrompt = () => {
    setSnackbarOpen(true); // Show Snackbar
  };



  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      handleLoginPrompt();
      return;
    }
  
    try {
      await addToCart(product.id, 1); // ✅ Add item to server-side cart
      setSnackbarOpen(true); // 🎉 Show success message
  
      const userId = JSON.parse(localStorage.getItem("user"))?.id;
      if (userId) {
        const updatedCount = await fetchCartCount(userId);
        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { count: updatedCount } }));
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  };


  const handleBuyNow = () => {
    if (!isLoggedIn) {
      handleLoginPrompt();
      return;
    }

    navigate("/checkout", { state: { product, quantity: 1 } });
  };

  if (!product) return <Typography>Loading product details...</Typography>;

  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Grid container spacing={4}>
          {/* 🖼️ Product Images */}
          <Grid item xs={12} md={6}>
            <img
              src={`${API_BASE_URL}/${selectedImage}`}
              alt={product.name}
              width="100%"
              style={{ borderRadius: "8px" }}
            />
            <Grid container spacing={2} mt={2}>
              {product.images.map((img, index) => (
                <Grid item xs={4} key={index}>
                  <img
                    src={`${API_BASE_URL}/${img.image_url}`}
                    alt={`Product ${index + 1}`}
                    width="100%"
                    style={{
                      border: selectedImage === img.image_url ? "2px solid #1976d2" : "1px solid #ccc",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                    onClick={() => setSelectedImage(img.image_url)}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* 📝 Product & NGO Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>{product.name}</Typography>
            <Typography variant="h6" color="primary" gutterBottom>₹{product.price}</Typography>
            <Typography variant="body1" gutterBottom>{product.description}</Typography>
            <Typography variant="body2" color={product.stock > 0 ? "green" : "red"}>
              {product.stock > 0 ? `In stock: ${product.stock}` : "Out of stock"}
            </Typography>

            {/* 🛒 Action Buttons */}
            <Box mt={3}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mb: 2 }}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                Add to Cart
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
              >
                Buy Now
              </Button>
            </Box>

            {/* 🏢 NGO Information */}
            {product.ngo && (
              <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
                <Typography variant="h6" gutterBottom>Sold by: {product.ngo.ngo_name}</Typography>
                {product.ngo.logo && (
                  <Avatar
                    src={`${API_BASE_URL}/${product.ngo.logo}`}
                    alt={product.ngo.ngo_name}
                    sx={{ width: 80, height: 80, mb: 2 }}
                  />
                )}
                <Typography variant="body2">Email: {product.ngo.email}</Typography>
                <Typography variant="body2">Contact: {product.ngo.contact_number}</Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* ✅ Snackbar for Login Prompt */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          sx={{ width: "100%", fontWeight: "bold" }}
          onClose={handleSnackbarClose}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate("/login")}
              sx={{ fontWeight: "bold" }}
            >
              Login
            </Button>
          }
        >
          Please login first to perform this action.
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProductDetails;
