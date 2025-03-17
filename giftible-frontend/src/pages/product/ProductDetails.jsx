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
  IconButton,
  Rating,
} from "@mui/material";
import API_BASE_URL from "../../config";
import { addToCart, fetchCartCount } from "../../services/cartService";
import { addToWishlist, removeFromWishlist, fetchWishlist } from "../../services/wishlistService";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CreditCardIcon from "@mui/icons-material/CreditCard";


const getFullImageUrl = (path) => {
  if (!path) {
    console.log("⚠️ No image path provided, using default image.");
    return "/assets/default-ngo-logo.png";
  }

  const formattedUrl = `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  return formattedUrl;
};


function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [userId, setUserId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(5); // Default 5 for unrated products


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`${API_BASE_URL}/products/${productId}`);

        console.log("📌 Product API Response:", response.data);
        if (!response.data || !response.data.product) {
          throw new Error("Invalid product response from server.");
        }


        const productData = response.data;


        if (!productData || !productData.product) {
          throw new Error("Invalid product response from server.");
        }

        setProduct(productData);
        setSelectedImage(productData.product.images?.[0]?.image_url || "");

        // ✅ Store average rating (Set default 5 if no rating exists)
        setAverageRating(response.data.product.average_rating ?? 5);
        // ✅ Store reviews in state
        setReviews(response.data.reviews.review_list || []);

      } catch (error) {
        console.error("Error fetching product details:", error);
        setProduct(null);
      }
    };

    const checkWishlist = async (userId) => {
      if (!userId) return;
      try {
        const wishlist = await fetchWishlist();
        setIsWishlisted(wishlist.some((item) => item.product_id === parseInt(productId)));
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchProduct();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUserId(storedUser?.id || null);

    if (storedUser?.id) {
      checkWishlist(storedUser.id);
    }
  }, [productId]);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleLoginPrompt = () => {
    setSnackbar({ open: true, message: "Please log in to continue", severity: "warning" });
  };

  const handleAddToCart = async () => {
    if (!userId) {
      handleLoginPrompt();
      return;
    }

    if (product.product.stock === 0) {
      setSnackbar({ open: true, message: "Product is out of stock!", severity: "error" });
      return;
    }

    try {
      await addToCart(product.product.id, 1);
      setSnackbar({ open: true, message: "Added to cart!", severity: "success" });

      if (userId) {
        const updatedCount = await fetchCartCount(userId);
        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { count: updatedCount } }));
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
      setSnackbar({ open: true, message: "Failed to add to cart", severity: "error" });
    }
  };

  const handleBuyNow = () => {
    if (!userId) {
      handleLoginPrompt();
      return;
    }

    if (product.product.stock === 0) {
      setSnackbar({ open: true, message: "Product is out of stock!", severity: "error" });
      return;
    }

    navigate("/checkout", { state: { product, quantity: 1 } });
  };

  
  
  

  const handleWishlistToggle = async () => {
    if (!userId) return handleLoginPrompt();

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
      setSnackbar({ open: true, message: "Failed to update wishlist", severity: "error" });
    }
  };

  if (!product) return <Typography>Loading product details...</Typography>;

  return (
    <Container maxWidth="lg">
      <Box mt={5} sx={{ bgcolor: "background.paper", borderRadius: "12px", p: 4, boxShadow: 3 }}>
        <Grid container spacing={5}>
          {/* 🖼️ Product Image & Wishlist Icon */}
          <Grid item xs={12} md={6} sx={{ position: "relative" }}>
  {/* ❤️ Wishlist Icon at Top Right */}
  <IconButton
    onClick={handleWishlistToggle}
    sx={{
      position: "absolute",
      top: 15,
      right: 15,
      bgcolor: "rgba(255, 255, 255, 0.9)",
      borderRadius: "50%",
      boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
      transition: "0.3s",
      "&:hover": { transform: "scale(1.1)" },
    }}
  >
    {isWishlisted ? <FavoriteIcon sx={{ color: "#F5B800" }} /> : <FavoriteBorderIcon sx={{ color: "#F5B800" }} />}
  </IconButton>

  {/* Main Product Image */}
  {selectedImage ? (
    <img
      src={`${API_BASE_URL}/${selectedImage}`}
      alt={product.product.name}
      width="100%"
      style={{
        borderRadius: "12px",
        objectFit: "cover",
        height: "400px",
        boxShadow: "0px 6px 15px rgba(0,0,0,0.2)",
      }}
    />
  ) : (
    <Typography>No Image Available</Typography>
  )}

  {/* Thumbnail Images */}
  {product.product.images?.length > 1 && (
  <Grid container spacing={2} mt={2} sx={{ overflowX: "auto", flexWrap: "nowrap" }}>
    {product.product.images.map((img, index) => (
      <Grid item key={index} sx={{ flexShrink: 0 }}>
        <img
          src={`${API_BASE_URL}/${img.image_url}`}
          alt={`Product ${index + 1}`}
          width="100"
          height="100"
          style={{
            borderRadius: "8px",
            cursor: "pointer",
            objectFit: "cover",
            border: selectedImage === img.image_url ? "3px solid #6A4C93" : "1px solid #ccc",
            transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            boxShadow: selectedImage === img.image_url ? "0px 0px 10px rgba(106, 76, 147, 0.5)" : "none",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1.0)")}
          onClick={() => setSelectedImage(img.image_url)}
        />
      </Grid>
    ))}
  </Grid>
)}

</Grid>


          {/* 📝 Product Details in Purple Box */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{ p: 3, border: "2px solid #6A4C93", borderRadius: "12px", boxShadow: 2 }}
            >

              {/* ⭐ Product Rating */}
<Box display="flex" alignItems="center" gap={1} mb={1}>
  <Rating value={averageRating} precision={0.1} readOnly />
  <Typography variant="body2" fontWeight="bold" color="text.secondary">
    ({averageRating?.toFixed(1)})
  </Typography>
</Box>

              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {product.product.name}
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                ₹{product.product.price}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {product.product.description}
              </Typography>
              <Typography variant="h6" color="secondary">
                Category: {product.category?.name}
              </Typography>

              {/* 🛒 Action Buttons */}
              <Box mt={3}>
  <Button
    variant="contained"
    fullWidth
    sx={{ mb: 2, borderRadius: "8px" }}
    onClick={handleAddToCart}
    startIcon={<ShoppingCartIcon />}
    disabled={product.product.stock === 0} // ✅ Disable if stock is 0
  >
    {product.product.stock === 0 ? "Out of Stock" : "Add to Cart"}
  </Button>

  <Button
    variant="outlined"
    fullWidth
    sx={{ borderRadius: "8px" }}
    onClick={handleBuyNow}
    startIcon={<CreditCardIcon />}
    disabled={product.product.stock === 0} // ✅ Disable if stock is 0
  >
    {product.product.stock === 0 ? "Out of Stock" : "Buy Now"}
  </Button>
</Box>

{/* ✅ Snackbar Notification */}
<Snackbar
  open={snackbar.open}
  autoHideDuration={3000}
  onClose={handleSnackbarClose}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
  <Alert severity={snackbar.severity} onClose={handleSnackbarClose}>
    {snackbar.message}
  </Alert>
</Snackbar>

            </Paper>

            {/* 🏢 NGO Box */}
            

            {product.ngo && (
  <Paper
    elevation={3}
    sx={{
      mt: 4,
      p: 2,
      display: "flex",
      alignItems: "center",
      gap: 2,
      border: "2px solid #F5B800", // 🟡 Yellow Border
      borderRadius: "12px", // Rounded corners
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", // Subtle shadow
      transition: "transform 0.2s ease-in-out",
      cursor: "pointer", // 🖱️ Make it clickable
      "&:hover": { transform: "scale(1.02)", backgroundColor: "#FFF5D0" }, // Light yellow hover
    }}
    onClick={() => {
      navigate(`/products?ngo_ids=${product.ngo.universal_user_id}`);
    }} // ✅ Log navigation URL before redirect
  >
    {/* 🏢 NGO Logo */}
    <Avatar
      src={product.ngo.logo ? getFullImageUrl(product.ngo.logo) : "/assets/default-ngo-logo.png"}
      alt={product.ngo.ngo_name}
      sx={{ width: 60, height: 60, border: "3px solid #F5B800" }} // Yellow border for contrast
    />
    
    {/* 🏢 NGO Name */}
    <Typography variant="h6" fontWeight="bold" sx={{ color: "text.primary" }}>
      {product.ngo.ngo_name}
    </Typography>
  </Paper>
)}



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

     


 {/* ✅ Snackbar Component */}
 <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity={snackbar.severity} onClose={handleSnackbarClose}>
        {snackbar.message}
      </Alert>
    </Snackbar>

    </Container>
  );
}

export default ProductDetails;
