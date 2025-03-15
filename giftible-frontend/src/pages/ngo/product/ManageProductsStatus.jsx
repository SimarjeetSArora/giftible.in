import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { ToggleOn, ToggleOff } from "@mui/icons-material";
import { makeProductLive, makeProductUnlive } from "../../../services/productService";
import API_BASE_URL from "../../../config";
import axiosInstance from "../../../services/axiosInstance";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });
  const [loading, setLoading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const effectiveUserId = loggedInUser?.id;

  useEffect(() => {
    fetchProducts();
  }, [effectiveUserId]);

  const fetchProducts = async () => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_BASE_URL}/products/my-products`);
      setProducts(Array.isArray(response.data.products) ? response.data.products : []);
    } catch (err) {
      showSnackbar("❌ Failed to load products.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const toggleLiveStatus = async (productId, currentStatus) => {
    try {
      currentStatus
        ? await makeProductUnlive(productId)
        : await makeProductLive(productId);

      showSnackbar(`✅ Product is now ${currentStatus ? "unlive" : "live"}.`, "success");

      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? { ...product, is_live: !currentStatus } : product
        )
      );
    } catch (err) {
      showSnackbar("❌ Failed to change product status.", "error");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" mb={3}>
        Update Product Status
      </Typography>

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
          <Typography mt={2}>Loading products...</Typography>
        </Box>
      ) : products.length === 0 ? (
        <Typography align="center" color="textSecondary" fontWeight="bold">
          No products found. Add some to manage them here.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: "12px", overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#6A4C93" }}>
              <TableRow>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Image</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Product Name</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Price (₹)</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Stock</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  {/* Product Image */}
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={
                        product.images && product.images.length > 0
                          ? `${API_BASE_URL}/${product.images[0].image_url}`
                          : "/placeholder.png"
                      }
                      alt={product.name}
                      sx={{
                        width: 70,
                        height: 70,
                        border: "2px solid #F5B800",
                        cursor: "pointer",
                        transition: "0.3s ease-in-out",
                        "&:hover": { transform: "scale(1.1)", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" },
                      }}
                      onClick={() => {
                        setSelectedImages(product.images.map((img) => `${API_BASE_URL}/${img.image_url}`));
                        setSelectedImageIndex(0);
                        setImageModalOpen(true);
                      }}
                    />
                  </TableCell>

                  {/* Product Details */}
                  <TableCell fontWeight="bold">{product.name}</TableCell>
                  <TableCell fontWeight="bold" color="primary">₹{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>

                  {/* Live Status */}
                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color: product.is_live ? "green" : "red",
                      }}
                    >
                      {product.is_live ? "Live" : "Not Live"}
                    </Typography>
                  </TableCell>

                  {/* Toggle Button */}
                  <TableCell>
                    <IconButton
                      onClick={() => toggleLiveStatus(product.id, product.is_live)}
                      sx={{
                        bgcolor: product.is_live ? "primary.main" : "secondary.main",
                        color: "white",
                        "&:hover": { bgcolor: product.is_live ? "primary.dark" : "secondary.dark" },
                      }}
                    >
                      {product.is_live ? <ToggleOn /> : <ToggleOff />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Image Preview Modal */}
      <Dialog open={imageModalOpen} onClose={() => setImageModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: "#6A4C93", textAlign: "center" }}>
          Product Images
        </DialogTitle>
        <DialogContent>
          {selectedImages.length > 0 && (
            <Box textAlign="center" mb={3} p={2} sx={{ backgroundColor: "#F5B800", borderRadius: "12px" }}>
              <img
                src={selectedImages[selectedImageIndex]}
                alt="Selected Product"
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  border: "3px solid #6A4C93",
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={() => setImageModalOpen(false)} sx={{ backgroundColor: "#F5B800", fontWeight: "bold" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageProducts;
