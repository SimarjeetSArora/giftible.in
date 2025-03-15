import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  CircularProgress, // ✅ Import CircularProgress for Loading Indicator
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { createCategory } from "../../../services/categoryService";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false); // ✅ New Loading State
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const navigate = useNavigate(); // ✅ Initialize navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ Start Loading
    try {
      await createCategory({ name, description });
      setSnackbar({ open: true, message: "✅ Category submitted for approval!", severity: "success" });

      // ✅ Redirect to Dashboard after a delay
      setTimeout(() => {
        navigate("/dashboard/ngo");
      }, 2000); // 2-second delay for snackbar visibility

      setName("");
      setDescription("");
    } catch (err) {
      console.error("❌ Error creating category:", err);
      setSnackbar({ open: true, message: "❌ Failed to create category.", severity: "error" });
    } finally {
      setLoading(false); // ✅ Stop Loading after response
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <Card
        sx={{
          width: "100%",
          maxWidth: 500,
          p: 3,
          borderRadius: 3,
          boxShadow: 4,
          bgcolor: "background.paper",
        }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight="bold" color="primary" textAlign="center" gutterBottom>
            Add New Category
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Category Name"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <CardActions sx={{ justifyContent: "center", mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading} // ✅ Disable button when loading
                sx={{
                  backgroundColor: loading ? "#A8A8A8" : "#F5B800", // ✅ Show disabled color
                  color: "#1B1B1B",
                  fontWeight: "bold",
                  "&:hover": { backgroundColor: loading ? "#A8A8A8" : "#6A4C93", color: "#FFFFFF" },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#FFFFFF" }} /> : "Submit for Approval"}
              </Button>
            </CardActions>
          </form>
        </CardContent>
      </Card>

      {/* ✅ Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000} // ✅ Match the redirection delay
        onClose={() => setSnackbar({ open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddCategory;
