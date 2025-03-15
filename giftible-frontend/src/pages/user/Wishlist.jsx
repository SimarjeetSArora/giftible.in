import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import API_BASE_URL from "../../config";
import FavoriteIcon from "@mui/icons-material/Favorite";

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
      
      const updatedWishlist = wishlist.filter((item) => item.product_id !== productId);
      setWishlist(updatedWishlist);

      // ✅ If the wishlist is empty after removal, set an empty state
      if (updatedWishlist.length === 0) {
        setWishlist([]); 
      }

      setSnackbar({ open: true, message: "Removed from wishlist", severity: "info" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      setSnackbar({ open: true, message: "Failed to remove", severity: "error" });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#6A4C93" }}>
        ❤️ My Wishlist
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress sx={{ color: "#6A4C93" }} />
        </Box>
      ) : wishlist.length === 0 ? (
        <Typography sx={{ textAlign: "center", fontSize: "1.2rem", color: "#6A4C93", mt: 5 }}>
          No items in wishlist. Start adding your favorite products!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {wishlist.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.product_id}>
              <Card
                sx={{
                  position: "relative",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                  borderRadius: "12px",
                  transition: "0.3s",
                  overflow: "hidden",
                  "&:hover": { transform: "scale(1.02)", boxShadow: "0px 6px 16px rgba(0,0,0,0.2)" },
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/products/${product.product_id}`)}
              >
                <Box sx={{ position: "relative", overflow: "hidden" }}>
                  <CardMedia
                    component="img"
                    height="220"
                    image={`${API_BASE_URL}/${product.image}`}
                    alt={product.name}
                    sx={{
                      objectFit: "cover",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      transition: "0.3s",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  />
                  {/* Wishlist Remove Button */}
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(product.product_id);
                    }}
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      bgcolor: "rgba(255,255,255,0.8)",
                      borderRadius: "50%",
                      transition: "0.2s",
                      "&:hover": { transform: "scale(1.1)", bgcolor: "rgba(255,255,255,1)" },
                    }}
                  >
                    <FavoriteIcon sx={{ color: "#F5B800" }} />
                  </IconButton>
                </Box>

                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1B1B1B" }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#6A4C93", fontWeight: "bold", fontSize: "1.1rem" }}>
                    ₹{product.price}
                  </Typography>
                  <Typography variant="body2" sx={{ color: product.stock > 0 ? "green" : "red" }}>
                    {product.stock > 0 ? `In stock: ${product.stock}` : "Out of stock"}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: "#F5B800",
                      color: "#6A4C93",
                      fontWeight: "bold",
                      mt: 2,
                      "&:hover": { bgcolor: "#E0A000" },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product.product_id}`);
                    }}
                  >
                    View Product
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Snackbar Notification */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%", fontWeight: "bold" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Wishlist;
