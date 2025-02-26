import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import {
  deleteProduct,
  makeProductLive,
  makeProductUnlive,
} from "../../services/productService";
import API_BASE_URL from "../../config";
import axiosInstance from "../../services/axiosInstance";

function ManageProducts({ ngoId }) {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [effectiveNgoId, setEffectiveNgoId] = useState(ngoId || null);
  const [loading, setLoading] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  // ✅ Fetch NGO ID if not provided
  useEffect(() => {
    const fetchNgoId = async () => {
      if (!ngoId && loggedInUser?.token) {
        try {
          setLoading(true);
          const response = await axiosInstance.get(`${API_BASE_URL}/user/ngo`, {
            headers: { Authorization: `Bearer ${loggedInUser.token}` },
          });
          setEffectiveNgoId(response.data.ngo_id);
        } catch (error) {
          console.error("Error fetching NGO ID:", error);
          setMessage("❌ Failed to fetch NGO ID.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNgoId();
  }, [ngoId, loggedInUser?.token]);

  // ✅ Fetch products when effective NGO ID is set
  useEffect(() => {
    const fetchProducts = async () => {
      if (!effectiveNgoId) return;

      try {
        setLoading(true);
        const response = await axiosInstance.get(`${API_BASE_URL}/products/ngo/${effectiveNgoId}/products`);
        setProducts(Array.isArray(response.data.products) ? response.data.products : []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setMessage("❌ Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [effectiveNgoId]);

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        setMessage("✅ Product deleted successfully.");
        setProducts((prev) => prev.filter((product) => product.id !== productId));  // Immediate UI update
      } catch (err) {
        console.error("Delete Error:", err);
        setMessage("❌ Failed to delete product.");
      }
    }
  };

  const toggleLiveStatus = async (productId, currentStatus) => {
    try {
      currentStatus
        ? await makeProductUnlive(productId)
        : await makeProductLive(productId);

      setMessage(`✅ Product is now ${currentStatus ? "unlive" : "live"}.`);

      // Update the local product list instantly
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? { ...product, is_live: !currentStatus } : product
        )
      );
    } catch (err) {
      console.error("Toggle Live Status Error:", err);
      setMessage("❌ Failed to change product status.");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box mt={4} textAlign="center">
          <CircularProgress />
          <Typography mt={2}>Loading products...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Manage Your Products
        </Typography>

        {message && (
          <Typography color={message.includes("❌") ? "error" : "primary"} gutterBottom>
            {message}
          </Typography>
        )}

        {products.length === 0 ? (
          <Typography>No products found. Add some to manage them here.</Typography>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card>
                  {Array.isArray(product.images) && product.images.length > 0 && (
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
                    <Typography variant="subtitle2" color={product.is_live ? "green" : "red"}>
                      {product.is_live ? "Live" : "Not Live"}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      color={product.is_live ? "secondary" : "primary"}
                      onClick={() => toggleLiveStatus(product.id, product.is_live)}
                    >
                      {product.is_live ? "Unlive" : "Make Live"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}

export default ManageProducts;
