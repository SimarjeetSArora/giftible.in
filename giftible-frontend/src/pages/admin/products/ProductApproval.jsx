import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getPendingProducts, approveProduct, rejectProduct } from "../../../services/productService";
import API_BASE_URL from "../../../config";

// 🎨 Get Theme-Based Colors
const getColors = (mode) => ({
  background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
  text: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
  accent: "#F5B800",
  secondary: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  tableHeader: "#6A4C93",
  buttonHover: "#F5A000",
});


const ProductApproval = () => {
  const theme = useTheme();
  const colors = getColors(theme.palette.mode);

  const [products, setProducts] = useState([]);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  


  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      const data = await getPendingProducts();
      setProducts(data);
    } catch (err) {
      setSnackbar({ open: true, message: "Error fetching products", severity: "error" });
    }
  };

  const handleApprove = async (productId) => {
    try {
      await approveProduct(productId);
      setSnackbar({ open: true, message: "✅ Product approved!", severity: "success" });
      fetchPendingProducts();
    } catch (err) {
      setSnackbar({ open: true, message: "Error approving product", severity: "error" });
    }
  };

  const openRejectionDialog = (product) => {
    setSelectedProduct(product);
    setRejectionDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setSnackbar({ open: true, message: "⚠️ Please enter a rejection reason.", severity: "warning" });
      return;
    }

    try {
      await rejectProduct(selectedProduct.id, rejectionReason);
      setSnackbar({ open: true, message: `🚫 Product '${selectedProduct.name}' rejected.`, severity: "success" });
      setRejectionDialogOpen(false);
      setRejectionReason("");
      fetchPendingProducts();
    } catch (err) {
      setSnackbar({ open: true, message: "❌ Error rejecting product", severity: "error" });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ background: colors.background, minHeight: "100vh", py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ color: colors.text, mb: 2, fontWeight: "bold" }}>
                Approve Products
        </Typography>
      </Box>

      {products.length === 0 ? (
        <Typography align="center" sx={{ color: colors.secondary, fontWeight: "bold", mt: 5 }}>
          No pending products for approval.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: "12px" }}>
          <Table>
            <TableHead sx={{ background: colors.tableHeader }}>
              <TableRow>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Image</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Product Name</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Description</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Price (₹)</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Stock</TableCell>
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
                      "&:hover": {
                        transform: "scale(1.1)",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                      }
                    }}
                    onError={(e) => (e.target.src = "/placeholder.png")}
                    onClick={() => {
                      setSelectedImages(product.images.map(img => `${API_BASE_URL}/${img.image_url}`));
                      setSelectedImageIndex(0); // Ensure the first image is selected initially
                      setImageModalOpen(true);
                    }}
                    
                  />


</TableCell>



                  {/* Product Details */}
                  <TableCell sx={{ color: colors.text, fontWeight: "bold" }}>{product.name}</TableCell>
                  <TableCell sx={{ color: colors.secondary }}>{product.description}</TableCell>
                  <TableCell sx={{ color: colors.accent, fontWeight: "bold" }}>{product.price}</TableCell>
                  <TableCell sx={{ color: colors.secondary }}>{product.stock}</TableCell>

                  {/* Approve & Reject Buttons */}
                  <TableCell>
                    <Button
                      variant="contained"
                      sx={{
                        background: colors.accent,
                        color: "#1B1B1B",
                        "&:hover": { background: colors.buttonHover },
                        mr: 1,
                      }}
                      onClick={() => handleApprove(product.id)}
                    >
                      Approve
                    </Button>
                    <Button variant="contained" color="error" onClick={() => openRejectionDialog(product)}>
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectionDialogOpen} onClose={() => setRejectionDialogOpen(false)}>
        <DialogTitle>Reject Product - {selectedProduct?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="Rejection Reason"
            fullWidth
            margin="normal"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleReject} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Snackbar Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    
    

      <Dialog open={imageModalOpen} onClose={() => setImageModalOpen(false)} maxWidth="md" fullWidth>
  <DialogTitle sx={{ fontWeight: "bold", color: "#6A4C93", textAlign: "center" }}>
    Product Images
  </DialogTitle>

  <DialogContent>
    {/* Large Preview Image */}
    {selectedImages.length > 0 && (
      <Box textAlign="center" mb={3} p={2} sx={{ backgroundColor: "#F5B800", borderRadius: "12px" }}>
        <img
          src={selectedImages[selectedImageIndex]} // Show the selected image
          alt="Selected Product"
          style={{
            width: "100%",
            maxWidth: "400px",
            height: "300px", // Uniform size
            borderRadius: "12px",
            objectFit: "cover",
            border: "3px solid #6A4C93",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
          }}
        />
      </Box>
    )}

    {/* Thumbnail Selection */}
    <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
      {selectedImages.map((imgUrl, index) => (
        <Box
          key={index}
          sx={{
            cursor: "pointer",
            transition: "transform 0.3s ease-in-out",
            "&:hover": { transform: "scale(1.1)" },
          }}
          onClick={() => setSelectedImageIndex(index)} // Only update selected image index
        >
          <img
            src={imgUrl}
            alt={`Thumbnail ${index + 1}`}
            style={{
              width: "80px",
              height: "80px",
              objectFit: "cover",
              borderRadius: "8px",
              border: selectedImageIndex === index ? "3px solid #6A4C93" : "2px solid #F5B800",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
            }}
          />
        </Box>
      ))}
    </Box>
  </DialogContent>

  <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
    <Button
      onClick={() => setImageModalOpen(false)}
      sx={{
        backgroundColor: "#F5B800",
        color: "#1B1B1B",
        fontWeight: "bold",
        "&:hover": { backgroundColor: "#6A4C93", color: "#FFFFFF" },
      }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>





    </Container>
  );
};

export default ProductApproval;
