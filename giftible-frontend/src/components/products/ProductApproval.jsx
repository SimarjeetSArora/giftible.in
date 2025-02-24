import React, { useEffect, useState } from "react";
import { Container, Typography, Button, Box, Grid, Card, CardContent, CardActions, CardMedia, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { getPendingProducts, approveProduct, rejectProduct } from "../../services/productService";
import API_BASE_URL from "../../config";

function ProductApproval() {
  const [products, setProducts] = useState([]);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      const data = await getPendingProducts();
      setProducts(data);
    } catch (err) {
      setMessage(err);
    }
  };

  const handleApprove = async (productId) => {
    try {
      await approveProduct(productId);
      setMessage("Product approved successfully.");
      fetchPendingProducts();
    } catch (err) {
      setMessage(err);
    }
  };

  const openRejectionDialog = (product) => {
    setSelectedProduct(product);
    setRejectionDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      setMessage("Please provide a rejection reason.");
      return;
    }

    try {
      await rejectProduct(selectedProduct.id, rejectionReason);
      setMessage(`Product rejected. Reason: ${rejectionReason}`);
      setRejectionDialogOpen(false);
      setRejectionReason("");
      fetchPendingProducts();
    } catch (err) {
      setMessage(err);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Pending Product Approvals
        </Typography>
        {message && <Typography color={message.includes("error") ? "error" : "primary"}>{message}</Typography>}

        {products.length === 0 ? (
          <Typography>No pending products for approval.</Typography>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card>
                  {product.images?.length > 0 && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={`${API_BASE_URL}/${product.images[0]?.image_url}`}
                      alt={product.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6">{product.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{product.description}</Typography>
                    <Typography variant="subtitle1">Price: ₹{product.price}</Typography>
                    <Typography variant="subtitle2">Stock: {product.stock}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button variant="contained" color="success" onClick={() => handleApprove(product.id)}>Approve</Button>
                    <Button variant="contained" color="error" onClick={() => openRejectionDialog(product)}>Reject</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
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
            <Button onClick={() => setRejectionDialogOpen(false)} color="secondary">Cancel</Button>
            <Button onClick={handleReject} color="error" variant="contained">Reject</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default ProductApproval;
