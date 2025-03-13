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
import { addToCart, fetchCartCount } from "../../services/cartService";

import { addToWishlist, removeFromWishlist, fetchWishlist } from "../../services/wishlistService";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";


function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [userId, setUserId] = useState(null); // ✅ Use userId for login check
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false); // ✅ Wishlist state


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`${API_BASE_URL}/products/${productId}`);
        const productData = response.data;
  
        if (!productData || !productData.product) {
          throw new Error("Invalid product response from server.");
        }
  
        setProduct(productData);
        setSelectedImage(productData.product.images?.[0]?.image_url || "");
      } catch (error) {
        console.error("Error fetching product details:", error);
        setProduct(null);
      }
    };
  
    const checkWishlist = async (userId) => {
      if (!userId) return; // ✅ Skip wishlist check if user is not logged in
  
      try {
        const wishlist = await fetchWishlist();
        setIsWishlisted(wishlist.some((item) => item.product_id === parseInt(productId)));
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };
  
    fetchProduct();
  
    // ✅ Fetch userId from localStorage to check login status
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUserId(storedUser?.id || null);
  
    if (storedUser?.id) {
      checkWishlist(storedUser.id);
    }
  }, [productId]);
  

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleLoginPrompt = () => {
    setSnackbarOpen(true);
  };

  const handleAddToCart = async () => {
    if (!userId) {
      handleLoginPrompt();
      return;
    }

    try {
      await addToCart(product.product.id, 1);
      
      if (userId) {
        const updatedCount = await fetchCartCount(userId);
        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { count: updatedCount } }));
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  };

  const handleBuyNow = () => {
    if (!userId) {
      handleLoginPrompt();
      return;
    }

    navigate("/checkout", { state: { product, quantity: 1 } });
  };

  const handleWishlistToggle = async () => {
    if (!userId) return handleLoginPrompt(); // ✅ Ask user to log in if not logged in
  
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.product.id);
        setIsWishlisted(false);
        setSnackbar({ open: true, message: "Removed from wishlist", severity: "info" });
      } else {
        await addToWishlist(product.product.id);
        setIsWishlisted(true);
        setSnackbar({ open: true, message: "Added to wishlist", severity: "success" });
      }
    } catch (error) {
      console.error("Wishlist action failed:", error);
      setSnackbar({ open: true, message: "Error updating wishlist", severity: "error" });
    }
  };
  

  if (!product) return <Typography>Loading product details...</Typography>;

  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Grid container spacing={4}>
          {/* 🖼️ Product Images */}
          <Grid item xs={12} md={6}>
            {selectedImage ? (
              <img
                src={`${API_BASE_URL}/${selectedImage}`}
                alt={product.product.name}
                width="100%"
                style={{ borderRadius: "8px" }}
              />
            ) : (
              <Typography>No Image Available</Typography>
            )}

            <Grid container spacing={2} mt={2}>
              {Array.isArray(product.product.images) && product.product.images.length > 0 ? (
                product.product.images.map((img, index) => (
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
                ))
              ) : (
                <Typography>No images available</Typography>
              )}
            </Grid>
          </Grid>

          {/* 📝 Product, Category & NGO Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>{product.product.name}</Typography>
            <Typography variant="h6" color="primary" gutterBottom>₹{product.product.price}</Typography>
            <Typography variant="body1" gutterBottom>{product.product.description}</Typography>
            <Typography variant="body2" color={product.product.stock > 0 ? "green" : "red"}>
              {product.product.stock > 0 ? `In stock: ${product.product.stock}` : "Out of stock"}
            </Typography>

            {/* 🛒 Action Buttons */}
            <Box mt={3}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mb: 2 }}
                onClick={handleAddToCart}
                disabled={product.product.stock <= 0}
              >
                Add to Cart
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleBuyNow}
                disabled={product.product.stock <= 0}
              >
                Buy Now
              </Button>
              {/* ❤️ Wishlist Button */}
<Button
  variant="text"
  color="error"
  fullWidth
  onClick={handleWishlistToggle}
  sx={{ mt: 2 }}
  startIcon={isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
>
  {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
</Button>

            </Box>

            {/* 📂 Category Information */}
            {product.category && (
              <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
                <Typography variant="h6" gutterBottom>Category: {product.category.name}</Typography>
                <Typography variant="body2">{product.category.description || "No description available"}</Typography>
              </Paper>
            )}

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

      {/* ✅ Snackbar for Login Prompt (Shows Only When Not Logged In) */}
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
