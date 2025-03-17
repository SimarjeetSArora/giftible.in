import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  Snackbar,
  Rating,
  TextField, 
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOrderDetails } from "../../../services/orderService";
import axiosInstance from "../../../services/axiosInstance";
import API_BASE_URL from "../../../config";

function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 🛑 Cancel Order State
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewingOrderItemId, setReviewingOrderItemId] = useState(null);

  const cancellationReasons = [
    "Ordered by mistake",
    "Product no longer needed",
    "Better price available",
    "Delay in shipping",
    "Other",
  ];

  useEffect(() => {
    const getOrderDetails = async () => {
      try {
        const data = await fetchOrderDetails(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getOrderDetails();
  }, [orderId]);

  const handleSubmitReview = async () => {
    console.log("📢 Submitting review...");

    // ✅ Ensure valid order item
    if (!reviewingOrderItemId) {
        console.error("❌ Invalid order item! Order Item ID:", reviewingOrderItemId);
        setSnackbar({ open: true, message: "Invalid order item!", severity: "error" });
        return;
    }

    // ✅ Ensure rating is at least 1
    if (!rating || rating < 1) {
        console.warn("⚠️ Invalid rating selected:", rating);
        setSnackbar({ open: true, message: "Please select a valid rating!", severity: "warning" });
        return;
    }

    console.log("✅ Review Details:", {
        order_item_id: reviewingOrderItemId,
        item_id: reviewingOrderItemId, // Fetching item ID for reference
        rating,
        comment: reviewComment || "(No comment provided)",
    });

    try {
        console.log("🔄 Sending API request to:", `${API_BASE_URL}/reviews/`);
        
        const response = await axiosInstance.post(`${API_BASE_URL}/reviews/`, {
            order_item_id: reviewingOrderItemId,
            rating,
            comment: reviewComment || "", // ✅ Allow empty comment
        });

        console.log("✅ Review submitted successfully! Response:", response.data);
        console.log("📌 Submitted for Order Item ID:", reviewingOrderItemId);

        // ✅ Update order state only if API succeeds
        setOrder((prevOrder) => {
            console.log("🔄 Updating state for order_items...");
            return {
                ...prevOrder,
                order_items: prevOrder.order_items.map((item) =>
                    item.id === reviewingOrderItemId ? { ...item, has_review: true } : item
                ),
            };
        });

        setSnackbar({ open: true, message: "Review submitted successfully!", severity: "success" });
        
        console.log("✅ Closing rating dialog...");
        setRateDialogOpen(false); // ✅ Close dialog only on success

    } catch (error) {
        console.error("❌ Error submitting review:", error);
        console.log("⚠️ Order Item ID:", reviewingOrderItemId); // Log item ID even if an error occurs
        setSnackbar({ open: true, message: "Failed to submit review.", severity: "error" });
    }
};

  
  


  // ❌ Handle Cancel Order API Call
  const handleCancelOrder = async () => {
    if (!selectedOrderItemId || !cancelReason) {
      setSnackbar({ open: true, message: "Please select a reason for cancellation.", severity: "warning" });
      return;
    }

    try {
      await axiosInstance.put(`${API_BASE_URL}/orders/cancel/${selectedOrderItemId}`, {
        reason: cancelReason,
      });

      // ✅ Update UI after cancellation
      setOrder((prevOrder) => ({
        ...prevOrder,
        order_items: prevOrder.order_items.map((item) =>
          item.id === selectedOrderItemId ? { ...item, status: "Cancelled", cancellation_reason: cancelReason } : item
        ),
      }));

      setSnackbar({ open: true, message: "Order item cancelled successfully!", severity: "success" });
    } catch (error) {
      console.error("Error cancelling order:", error);
      setSnackbar({ open: true, message: "Failed to cancel order.", severity: "error" });
    }

    setCancelDialogOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#6A4C93" }} />
        <Typography sx={{ mt: 2, color: "#6A4C93" }}>Loading Order Details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!order || !order.order_items || order.order_items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <Alert severity="warning">No order details found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* 🧾 Order Info */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#6A4C93", textAlign: "center" }}>
          Order Details
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6"><strong>Order ID: #{order.id}</strong></Typography>
        <Typography variant="body1">
          Placed on: {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
        </Typography>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* 📦 Products List */}
      <Typography variant="h5" sx={{ color: "#6A4C93", fontWeight: "bold", mb: 2 }}>
        Products in Order:
      </Typography>
      <Grid container spacing={3}>
        {order.order_items.map((item) => (
          <Grid item xs={12} sm={6} key={item.id}>
            <Card
              sx={{
                boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                borderRadius: "12px",
                transition: "0.3s",
                cursor: "pointer",
                "&:hover": { transform: "scale(1.02)", boxShadow: "0px 6px 16px rgba(0,0,0,0.2)" },
              }}
              onClick={() => navigate(`/products/${item.product?.id}`)}
            >
              {/* Product Image */}
              {item.product?.images && item.product.images.length > 0 ? (
                <CardMedia
                  component="img"
                  height="180"
                  image={`${API_BASE_URL}/${item.product.images[0]?.image_url}`}
                  alt={item.product.name}
                  sx={{ objectFit: "cover", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}
                />
              ) : (
                <Typography variant="body2" sx={{ p: 2, textAlign: "center" }} color="textSecondary">
                  No Image Available
                </Typography>
              )}

              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1B1B1B" }}>
                  {item.product?.name || "Unknown Product"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6A4C93" }}>
                  {item.product?.description || "No description available."}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 1 }}>
                  Quantity: {item.quantity}
                </Typography>
                <Typography variant="subtitle2">Price per item: ₹{item.price?.toFixed(2) || "0.00"}</Typography>

                {/* ✅ Product Status */}
                <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: "bold", color: item.status === "Cancelled" ? "red" : "#F5B800" }}>
                  Status: {item.status || "Pending"}
                </Typography>
                <Box display="flex" justifyContent="space-between" width="100%">
  {/* 🚀 Cancel Order Button (Left) */}
  {item.status !== "Cancelled" && item.status !== "Shipped" && item.status !== "Delivered" && (
  <Button
    variant="contained"
    color="error"
    sx={{ mt: 2 }}
    onClick={(e) => {
      e.stopPropagation();
      setSelectedOrderItemId(item.id);
      setCancelDialogOpen(true);
    }}
  >
    Cancel Order
  </Button>
)}


  {/* ⭐ Rate Now Button (Right) */}
  {item.status === "Delivered" && !item.has_review && (
    <Button
      variant="contained"
      color="primary"
      sx={{ mt: 2 }}
      onClick={(e) => {
        e.stopPropagation();
        setReviewingOrderItemId(item.id);
        setRateDialogOpen(true);
      }}
    >
      Rate Now
    </Button>
  )}
</Box>


              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

       
 
      <Dialog open={rateDialogOpen} onClose={() => setRateDialogOpen(false)}>
  <DialogTitle>Rate This Product</DialogTitle>
  <DialogContent>
    <Typography>Select a Rating:</Typography>
    <Rating value={rating} onChange={(e, newValue) => setRating(newValue)} precision={1} size="large" />
    <TextField
      label="Write a Review (Optional)"
      multiline
      rows={3}
      fullWidth
      variant="outlined"
      sx={{ mt: 2 }}
      value={reviewComment}
      onChange={(e) => setReviewComment(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setRateDialogOpen(false)}>Close</Button>
    <Button onClick={handleSubmitReview} color="primary">Submit</Button>
  </DialogActions>
</Dialog>


      {/* ❌ Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography>Select a reason for cancellation:</Typography>
          <Select fullWidth value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} sx={{ mt: 2 }}>
            {cancellationReasons.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {reason}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Close</Button>
          <Button onClick={handleCancelOrder} color="error">Cancel Order</Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Snackbar Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} severity={snackbar.severity} />
    
      
      <Divider sx={{ my: 4 }} />

      
      {/* 📍 Delivery Address */}
{order.address && (
  <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}>
    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6A4C93" }}>
      Delivery Address:
    </Typography>
    <Divider sx={{ my: 2 }} />
    <Typography variant="h6"><strong>{order.address.full_name}</strong></Typography>
    <Typography variant="body1">📞 {order.address.contact_number}</Typography>
    <Typography variant="body1">{order.address.address_line}</Typography>
    {order.address.landmark && <Typography variant="body2">🛑 Landmark: {order.address.landmark}</Typography>}
    <Typography variant="body1">{order.address.city}, {order.address.state} - {order.address.pincode}</Typography>
  </Paper>
)}

      
      
      <Divider sx={{ my: 4 }} />




        {/* 💰 Order Summary */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#6A4C93" }}>
          Order Summary:
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">
          <strong>Total Amount: </strong>₹{order.total_amount?.toFixed(2) || "0.00"}
        </Typography>
      </Paper>
    

     

    </Container>
    
  );
}

export default OrderDetails;
