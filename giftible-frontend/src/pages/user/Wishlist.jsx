import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Card, CardMedia, CardContent, Button, CircularProgress, IconButton, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import API_BASE_URL from "../../config";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/wishlist`);
      setWishlist(response.data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
    setLoading(false);
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/wishlist/remove/${productId}`);
      setWishlist((prev) => prev.filter((item) => item.id !== productId));
      setSnackbar({ open: true, message: "Removed from wishlist", severity: "info" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      setSnackbar({ open: true, message: "Failed to remove", severity: "error" });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>My Wishlist</Typography>

      {loading ? (
        <CircularProgress />
      ) : wishlist.length === 0 ? (
        <Typography>No items in wishlist.</Typography>
      ) : (
        <Grid container spacing={3}>
          {wishlist.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={{ position: "relative", boxShadow: 3, cursor: "pointer" }} onClick={() => navigate(`/products/${product.id}`)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={`${API_BASE_URL}/${product.image_url}`}
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>{product.name}</Typography>
                  <Typography variant="body1" color="primary">₹{product.price}</Typography>
                  <Typography variant="body2" color={product.stock > 0 ? "green" : "red"}>
                    {product.stock > 0 ? `In stock: ${product.stock}` : "Out of stock"}
                  </Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(product.id);
                    }}
                    sx={{ position: "absolute", top: 10, right: 10 }}
                  >
                    <FavoriteIcon sx={{ color: "red" }} />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Snackbar Notification */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Wishlist;
