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
  Card,
  CardContent,
  CardActions,
  Alert,
  Snackbar,  // ✅ Import Snackbar
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import UploadFileIcon from "@mui/icons-material/UploadFile";
import axiosInstance from "../../../services/axiosInstance";
import { addProduct } from "../../../services/productService";
import API_BASE_URL from "../../../config";

function AddProduct({ universalUserId }) {
  const navigate = useNavigate(); // ✅ Initialize navigate

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
  const [imagePreviews, setImagePreviews] = useState([]); 
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" }); // ✅ Snackbar State

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchUserId = () => {
      if (universalUserId) {
        setEffectiveUserId(universalUserId);
        return;
      }

      const storedUser = JSON.parse(sessionStorage.getItem("user")) || JSON.parse(localStorage.getItem("user"));
      if (storedUser?.id) {
        setEffectiveUserId(storedUser.id);
      } else {
        setMessage("❌ User ID not found in storage.");
      }
    };

    fetchUserId();
  }, [universalUserId]);

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
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: files });

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
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

    formData.images.forEach((image) => {
      data.append("images", image);
    });

    try {
      await addProduct(data);
      setSnackbar({ open: true, message: "✅ Product added successfully!", severity: "success" }); // ✅ Show success snackbar

      setTimeout(() => {
        navigate("/ngo/products"); // ✅ Redirect to NGO Products page after 1.5 seconds
      }, 1500);

      setFormData({ name: "", description: "", price: "", stock: "", images: [], category_id: "" });
      setImagePreviews([]);
    } catch (err) {
      console.error("Submit Error:", err.message);
      setSnackbar({ open: true, message: "❌ Failed to add product.", severity: "error" }); // ✅ Show error snackbar
    }
  };

  return (
    <Container maxWidth="md">
      <Box mt={4} display="flex" justifyContent="center">
        <Card sx={{ width: "100%", p: 3, boxShadow: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
              Add New Product
            </Typography>

            {message && (
              <Alert severity={message.includes("❌") ? "error" : "success"} sx={{ mb: 2 }}>
                {message}
              </Alert>
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
                  label="Price (₹)"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
                <TextField
                  name="stock"
                  label="Stock Quantity"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />

                {/* Category Dropdown */}
                <FormControl fullWidth margin="normal" required variant="outlined">
                  <InputLabel>Category</InputLabel>
                  <Select name="category_id" value={formData.category_id} onChange={handleChange}>
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

                {/* File Upload */}
                <Box mt={2} textAlign="center">
                  <Button variant="contained" component="label" startIcon={<UploadFileIcon />}>
                    Upload Product Images
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} hidden required />
                  </Button>
                </Box>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                    {imagePreviews.map((src, index) => (
                      <Box key={index} sx={{ width: 80, height: 80, borderRadius: 2, overflow: "hidden" }}>
                        <img src={src} alt={`preview-${index}`} width="100%" height="100%" style={{ objectFit: "cover" }} />
                      </Box>
                    ))}
                  </Box>
                )}

                <CardActions sx={{ justifyContent: "center", mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ bgcolor: "primary.main", color: "white", fontWeight: "bold", "&:hover": { bgcolor: "primary.dark" }}}
                    disabled={!effectiveUserId}
                  >
                    {effectiveUserId ? "Add Product" : "Loading Universal User ID..."}
                  </Button>
                </CardActions>
              </form>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* ✅ Snackbar Notification */}
      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default AddProduct;
