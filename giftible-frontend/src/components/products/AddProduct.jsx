import React, { useState, useEffect } from "react";
import { Container, TextField, Button, Typography, Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { addProduct } from "../../services/productService";
import API_BASE_URL from "../../config";

function AddProduct({ ngoId }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    images: [],
  });
  const [message, setMessage] = useState("");
  const [effectiveNgoId, setEffectiveNgoId] = useState(ngoId || null);
  const [loadingNgoId, setLoadingNgoId] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  // ✅ Fetch NGO ID if not provided via props
  useEffect(() => {
    const fetchNgoId = async () => {
      if (!ngoId && loggedInUser?.token) {
        try {
          setLoadingNgoId(true);
          const response = await axios.get(`${API_BASE_URL}/user/ngo`, {
            headers: { Authorization: `Bearer ${loggedInUser.token}` },
          });
          setEffectiveNgoId(response.data.ngo_id);
        } catch (error) {
          console.error("Error fetching NGO ID:", error);
          setMessage("❌ Failed to fetch NGO ID. Using default ID.");
          setEffectiveNgoId(loggedInUser?.id);  // ✅ Fallback to logged-in user ID
        } finally {
          setLoadingNgoId(false);
        }
      }
    };

    fetchNgoId();
  }, [ngoId, loggedInUser?.token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!effectiveNgoId) {
      setMessage("❌ NGO ID not found. Cannot add product.");
      return;
    }

    const data = new FormData();
    data.append("ngo_id", String(effectiveNgoId));
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock);

    Array.from(formData.images).forEach((image) => {
      data.append("images", image);
    });

    try {
      const response = await addProduct(data);
      setMessage(response.message || "✅ Product added successfully!");
      setFormData({ name: "", description: "", price: "", stock: "", images: [] });
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

        {loadingNgoId ? (
          <Box textAlign="center" mt={4}>
            <CircularProgress />
            <Typography mt={2}>Fetching NGO ID...</Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField name="name" label="Product Name" fullWidth margin="normal" value={formData.name} onChange={handleChange} required />
            <TextField name="description" label="Description" fullWidth margin="normal" value={formData.description} onChange={handleChange} multiline rows={4} />
            <TextField name="price" label="Price" type="number" fullWidth margin="normal" value={formData.price} onChange={handleChange} required />
            <TextField name="stock" label="Stock" type="number" fullWidth margin="normal" value={formData.stock} onChange={handleChange} required />

            <Typography variant="body1" gutterBottom>Upload Product Images</Typography>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} required />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={!effectiveNgoId}
            >
              {effectiveNgoId ? "Add Product" : "Loading NGO ID..."}
            </Button>
          </form>
        )}
      </Box>
    </Container>
  );
}

export default AddProduct;
