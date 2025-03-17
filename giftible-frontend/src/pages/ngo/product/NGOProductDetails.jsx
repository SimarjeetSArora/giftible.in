import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../services/axiosInstance";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Avatar,
  Rating,
} from "@mui/material";
import API_BASE_URL from "../../config";

const NGOProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [newStock, setNewStock] = useState(product?.product.stock || "");  // Default stock
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(5); // Default 5 for unrated products
  

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
        setLoading(false);

         // ✅ Store average rating (Set default 5 if no rating exists)
        setAverageRating(response.data.product.average_rating ?? 5);
        // ✅ Store reviews in state
        setReviews(response.data.reviews.review_list || []);

      } catch (error) {
        console.error("Error fetching product details:", error);
        setSnackbar({ open: true, message: "Failed to fetch product details", severity: "error" });
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleEditProduct = () => navigate(`/ngo/edit/product/${productId}`);

  const handleUpdateInventory = async () => {
    if (newStock < 0) {
      setSnackbar({ open: true, message: "Stock cannot be negative.", severity: "warning" });
      return;
    }
  
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/inventory/${productId}`, { stock: parseInt(newStock) });
  
      if (response.status === 200) {
        setSnackbar({ open: true, message: "Stock updated successfully!", severity: "success" });
  
        // Close dialog and wait for snackbar to show before redirecting
        setInventoryDialogOpen(false);
  
        // Wait for 1.5 seconds to show success message, then redirect
        setTimeout(() => {
          navigate("/ngo/products");
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      setSnackbar({ open: true, message: "Failed to update inventory.", severity: "error" });
    }
  };
  
  


  const handleDeleteProduct = async () => {
    try {
      const response = await axiosInstance.delete(`${API_BASE_URL}/products/delete/${productId}`);
  
      if (response.status === 200) {
        const data = response.data;
        console.log("Delete Response:", data); // Debugging Log
  
        if (data.message.includes("Cannot delete this product")) {
          // ⚠️ Product has orders → Show warning message & DO NOT redirect
          setSnackbar({ open: true, message: data.message, severity: "warning" });
        } else {
          // ✅ Product deleted successfully → Show success message & Redirect
          setSnackbar({ open: true, message: "Product deleted successfully", severity: "success" });
          setTimeout(() => navigate("/ngo/products"), 1500); // Redirect after delay
        }
      } else {
        throw new Error("Unexpected response");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setSnackbar({ open: true, message: "Failed to delete product", severity: "error" });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5, color: "#F5B800" }} />;
  if (!product) return <Typography align="center" mt={5}>Product Not Found</Typography>;

  return (
    <Container maxWidth="md">
      <Box mt={4} sx={{ backgroundColor: "#6A4C93", borderRadius: 2, p: 3, color: "#FFFFFF" }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: "bold", mb: 2, color: "#FFFFFF" }}>
          {product.product.name}
        </Typography>

        <Grid container spacing={4}>
          {/* 🖼️ Product Images */}
          <Grid item xs={12} md={6}>
            <Box sx={{ borderRadius: "12px", overflow: "hidden", border: "2px solid #F5B800" }}>
              {selectedImage ? (
                <img
                  src={`${API_BASE_URL}/${selectedImage}`}
                  alt={product.product.name}
                  width="100%"
                  height="280px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <Typography align="center" color="error">No Image Available</Typography>
              )}
            </Box>

            <Grid container spacing={1} mt={2}>
              {product.product.images.map((img, index) => (
                <Grid item xs={4} key={index}>
                  <Box
                    component="img"
                    src={`${API_BASE_URL}/${img.image_url}`}
                    alt={`Product ${index + 1}`}
                    width="100%"
                    height="70px"
                    sx={{
                      objectFit: "cover",
                      borderRadius: "6px",
                      cursor: "pointer",
                      border: selectedImage === img.image_url ? "3px solid #F5B800" : "1px solid #ccc",
                      transition: "0.3s",
                      "&:hover": { transform: "scale(1.05)" }
                    }}
                    onClick={() => setSelectedImage(img.image_url)}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* 📝 Product Details + Category */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, backgroundColor: "#FFFFFF", borderRadius: 2 }}>

              {/* ⭐ Product Rating */}
              <Box 
  display="flex" 
  alignItems="center" 
  gap={1} 
  mb={1}
  sx={{
    border: "2px solid #6A4C93", // ✅ Purple Border
    borderRadius: "8px", // ✅ Rounded corners
    padding: "4px 8px", // ✅ Padding inside the box
    bgcolor: "background.paper", // ✅ Light background
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)", // ✅ Subtle shadow
  }}
>
  <Rating value={averageRating} precision={0.1} readOnly />
  <Typography variant="body2" fontWeight="bold" color="text.secondary">
    ({averageRating?.toFixed(1)})
  </Typography>
</Box>



              <Typography variant="h6" sx={{ color: "#6A4C93" }}>
                Price: ₹{product.product.price}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Stock: {product.product.stock}
              </Typography>
              <Typography variant="h6" sx={{ color: product.product.is_live ? "#4CAF50" : "#D32F2F" }}>
                Status: {product.product.is_live ? "Live" : "Unlive"}
              </Typography>
              {/* ✅ Approved Section */}
              <Typography variant="h6" sx={{ color: product.product.is_approved ? "#4CAF50" : "#D32F2F" }}>
                Approved: {product.product.is_approved ? "Yes" : "No"}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold", color: "#6A4C93" }}>
                Category: {product.category ? product.category.name : "Not specified"}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {product.product.description}
              </Typography>

              {/* 🛠️ Edit & Delete Buttons */}
              <Box mt={3} display="flex" flexDirection="column" gap={2}>
              <Button
  variant="contained"
  fullWidth
  sx={{
    backgroundColor: "#6A4C93", // Green for inventory updates
    color: "#FFFFFF",
    "&:hover": { backgroundColor: "#F5B800", color:"#6A4C93" },
  }}
  onClick={() => setInventoryDialogOpen(true)}
>
  Update Inventory
</Button>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: "#F5B800",
                    color: "#6A4C93",
                    "&:hover": { backgroundColor: "#6A4C93", color: "#FFFFFF" },
                  }}
                  onClick={handleEditProduct}
                >
                  Edit Product
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Product
                </Button>
              </Box>
            </Paper>
            
          </Grid>
          
        </Grid>
        {/* 📝 User Reviews Section */}
{reviews.length > 0 ? (
  <Box mt={4}>
    <Typography variant="h5" fontWeight="bold">User Reviews</Typography>

    {reviews.map((review, index) => (
      <Paper key={index} sx={{ p: 2, mt: 2, borderRadius: "12px", boxShadow: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar>{review.user.first_name[0]}</Avatar>
          <Box>
            <Typography fontWeight="bold">
              {review.user.first_name} {review.user.last_name}
            </Typography>
            <Rating value={review.rating} precision={0.1} readOnly />
          </Box>
        </Box>
        <Typography mt={1} color="text.secondary">{review.comment || "No Comment"}</Typography>
      </Paper>
    ))}
  </Box>
) : (
  <Typography mt={4} color="text.secondary">No reviews yet.</Typography>
)}

      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProduct} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={inventoryDialogOpen} onClose={() => setInventoryDialogOpen(false)}>
  <DialogTitle>Update Inventory</DialogTitle>
  <DialogContent>
    <Typography>Enter new stock quantity:</Typography>
    <input
      type="number"
      value={newStock}
      onChange={(e) => setNewStock(e.target.value)}
      style={{
        width: "100%",
        padding: "10px",
        fontSize: "16px",
        marginTop: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc"
      }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setInventoryDialogOpen(false)}>Cancel</Button>
    <Button onClick={handleUpdateInventory} color="primary">Update</Button>
  </DialogActions>
</Dialog>



    </Container>
  );
};

export default NGOProductDetails;
