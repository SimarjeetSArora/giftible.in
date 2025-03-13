import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import axiosInstance from "../../services/axiosInstance";
import { addProduct } from "../../services/productService";
import API_BASE_URL from "../../config";

function AddProduct({ universalUserId }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    images: [],
    category_id: "",
  });
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [effectiveUserId, setEffectiveUserId] = useState(universalUserId || null);
  const [loadingUserId, setLoadingUserId] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  // ✅ Fetch Universal User ID if not provided via props
  useEffect(() => {
    const fetchUserId = () => {
      // Check if user ID is provided as prop
      if (universalUserId) {
        setEffectiveUserId(universalUserId);
        return;
      }
  
      // Fetch user details from sessionStorage or localStorage
      const storedUser = JSON.parse(sessionStorage.getItem("user")) || JSON.parse(localStorage.getItem("user"));
  
      if (storedUser?.id) {
        setEffectiveUserId(storedUser.id);
      } else {
        setMessage("❌ User ID not found in storage.");
      }
    };
  
    fetchUserId();
  }, [universalUserId]);
  

  // ✅ Fetch Approved Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(`${API_BASE_URL}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!effectiveUserId) {
      setMessage("❌ Universal User ID not found. Cannot add product.");
      return;
    }

    if (!formData.category_id) {
      setMessage("⚠️ Please select a category before adding the product.");
      return;
    }

    const data = new FormData();
    data.append("universal_user_id", String(effectiveUserId));
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("category_id", formData.category_id);

    Array.from(formData.images).forEach((image) => {
      data.append("images", image);
    });

    try {
      const response = await addProduct(data);
      setMessage(response.message || "✅ Product added successfully!");
      setFormData({ name: "", description: "", price: "", stock: "", images: [], category_id: "" });
    } catch (err) {
      console.error("Submit Error:", err.message);
      setMessage(err.response?.data?.detail || "❌ Failed to add product.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Add New Product
        </Typography>

        {message && (
          <Typography color={message.includes("❌") ? "error" : "primary"} gutterBottom>
            {message}
          </Typography>
        )}

        {loadingUserId ? (
          <Box textAlign="center" mt={4}>
            <CircularProgress />
            <Typography mt={2}>Fetching Universal User ID...</Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              name="name"
              label="Product Name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              margin="normal"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
            />
            <TextField
              name="price"
              label="Price"
              type="number"
              fullWidth
              margin="normal"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <TextField
              name="stock"
              label="Stock"
              type="number"
              fullWidth
              margin="normal"
              value={formData.stock}
              onChange={handleChange}
              required
            />

            {/* ✅ Category Dropdown */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
              >
                {categories.length === 0 ? (
                  <MenuItem disabled>No categories available</MenuItem>
                ) : (
                  categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* ✅ File Upload */}
            <Typography variant="body1" gutterBottom>Upload Product Images</Typography>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} required />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={!effectiveUserId}
            >
              {effectiveUserId ? "Add Product" : "Loading Universal User ID..."}
            </Button>
          </form>
        )}
      </Box>
    </Container>
  );
}

export default AddProduct;
