import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../services/axiosInstance";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import API_BASE_URL from "../../config";

const NGOEditProduct = () => {  // ✅ Hook calls must be inside this component
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
      category_id: "",
      name: "",
      description: "",
      price: "",
      stock: "",
    });
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });
  
    useEffect(() => {
        const fetchProductAndCategories = async () => {
          try {
            // Fetch product details
            const productResponse = await axiosInstance.get(`${API_BASE_URL}/products/${productId}`);
            console.log("Product Response:", productResponse.data);
            const productData = productResponse.data.product;
      
            // Fetch categories
            const categoriesResponse = await axiosInstance.get(`${API_BASE_URL}/categories/`);
            console.log("Categories Response:", categoriesResponse.data);  // ✅ Log API Response
            const approvedCategories = categoriesResponse.data || []; // Ensure it's an array
      
            setProduct(productData);
            setCategories(approvedCategories);
            console.log("Categories Set in State:", approvedCategories);  // ✅ Log State Update
      
            setFormData({
              category_id: productData.category_id || "",
              name: productData.name || "",
              description: productData.description || "",
              price: productData.price || "",
              stock: productData.stock || "",
            });
      
            setLoading(false);
          } catch (error) {
            console.error("Error fetching product or categories:", error);
            setSnackbar({ open: true, message: "Failed to load product details.", severity: "error" });
            setCategories([]); // Ensure empty array if API fails
            setLoading(false);
          }
        };
      
        fetchProductAndCategories();
      }, [productId]);
      
  
  

  // ✏️ Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "category_id" ? String(value) : value, // Ensure category_id is a string
    });
  };
  
  

  // 📝 Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/products/edit/${productId}`,
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (response.status === 200) {
        setSnackbar({ open: true, message: "✅ Product updated successfully!", severity: "success" });
        setTimeout(() => navigate(`/ngo/products`), 1500);
      } else {
        throw new Error("Unexpected response");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setSnackbar({ open: true, message: "Failed to update product.", severity: "error" });
    }
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5, color: "#F5B800" }} />;
  if (!product) return <Typography align="center" mt={5}>Product Not Found</Typography>;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: "bold", mb: 3, color: "#6A4C93" }}>
          Edit Product
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Category</InputLabel>
  <Select
    name="category_id"
    value={formData.category_id}
    onChange={handleChange}
    required
  >
    {console.log("Dropdown Categories:", categories)}  {/* ✅ Log Categories in JSX */}
    
    {categories.length > 0 ? (
      categories.map((category) => (
        <MenuItem key={category.id} value={category.id}>
          {category.name}
        </MenuItem>
      ))
    ) : (
      <MenuItem disabled>No Categories Available</MenuItem>
    )}
  </Select>
</FormControl>




          {/* Product Name */}
          <TextField
            fullWidth
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            required
            sx={{ mb: 2 }}
          />

          {/* Price */}
          <TextField
            fullWidth
            type="number"
            label="Price (₹)"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          {/* Stock */}
          <TextField
            fullWidth
            type="number"
            label="Stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          {/* Submit Button */}
          <Box mt={3}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#F5B800",
                color: "#6A4C93",
                "&:hover": { backgroundColor: "#6A4C93", color: "#FFFFFF" },
              }}
            >
              Save Changes
            </Button>
          </Box>
        </form>
      </Paper>

      {/* ✅ Snackbar for Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NGOEditProduct;
