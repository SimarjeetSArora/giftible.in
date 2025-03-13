import React, { useEffect, useState } from "react";
import {
  Button,
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
  Box,
  Typography,
  Pagination,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { approveCategory, rejectCategory } from "../../../services/categoryService";
import axiosInstance from "../../../services/axiosInstance";
import API_URL from "../../../config";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";

const getColors = (mode) => ({
  background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
  text: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
  accent: "#F5B800",
  secondary: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  cardBackground: mode === "dark" ? "#292929" : "#FFFFFF",
  tableHeader: "#6A4C93",
  approved: "#4CAF50",
  pending: "#F44336",
});

const CategoryApproval = () => {
  const theme = useTheme();
  const colors = getColors(theme.palette.mode);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchCategories();
  }, [page]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/categories/all?page=${page}&limit=${limit}&filter=not_approved`);
      setCategories(response.data.categories || []);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
      setSnackbar({ open: true, message: "Error fetching categories", severity: "error" });
    }
  };

  const handleApprove = async (categoryId) => {
    try {
      await approveCategory(categoryId, true);
      setSnackbar({ open: true, message: "✅ Category approved!", severity: "success" });
      fetchCategories();
    } catch (error) {
      setSnackbar({ open: true, message: "Error approving category", severity: "error" });
    }
  };

  const handleRejectClick = (category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      setSnackbar({ open: true, message: "⚠️ Please enter a reason for deletion.", severity: "warning" });
      return;
    }

    try {
      await rejectCategory(selectedCategory.id, rejectionReason);
      setSnackbar({ open: true, message: `🚫 Category '${selectedCategory.name}' deleted.`, severity: "success" });
      setDialogOpen(false);
      setRejectionReason("");
      fetchCategories();
    } catch (error) {
      setSnackbar({ open: true, message: "❌ Error deleting category", severity: "error" });
    }
  };

  return (
    <Box sx={{ background: colors.background, minHeight: "100vh", py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
      <Typography variant="h4" sx={{ color: colors.text, mb: 3, fontWeight: "bold" }}>
              Approve Categories
            </Typography>

      <TableContainer component={Paper} sx={{ background: colors.cardBackground, borderRadius: "12px" }}>
        <Table>
          <TableHead sx={{ background: colors.tableHeader }}>
            <TableRow>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Category Name</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {categories.length > 0 ? (
    categories.map((category) => (
      <TableRow key={category.id}>
        <TableCell sx={{ color: colors.text, fontWeight: "bold" }}>{category.name}</TableCell>
        <TableCell sx={{ color: colors.text }}>{category.description}</TableCell>
        <TableCell
          sx={{
            fontWeight: "bold",
            color: category.is_approved ? colors.approved : colors.pending,
          }}
        >
          {category.is_approved ? "Approved" : "Pending Approval"}
        </TableCell>
        <TableCell>
          {!category.is_approved && (
            <>
              <Button
                variant="contained"
                sx={{
                  background: colors.accent,
                  color: "#1B1B1B",
                  "&:hover": { background: "#F5A000" },
                  mr: 1,
                }}
                startIcon={<CheckCircleIcon />}
                onClick={() => handleApprove(category.id)}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleRejectClick(category)}
              >
                Delete
              </Button>
            </>
          )}
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={4} sx={{ textAlign: "center", color: colors.text, fontWeight: "bold", py: 3 }}>
        No Pending Categories
      </TableCell>
    </TableRow>
  )}
</TableBody>

        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination count={totalPages} page={page} onChange={(event, value) => setPage(value)} color="primary" />
      </Box>

      {/* ✅ Reject Category Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Delete Category - {selectedCategory?.name}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for Deletion"
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleRejectSubmit} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Snackbar Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryApproval;
