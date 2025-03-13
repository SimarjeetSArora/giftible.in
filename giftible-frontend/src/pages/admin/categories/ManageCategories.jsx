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
  Pagination,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { rejectCategory } from "../../../services/categoryService";
import axiosInstance from "../../../services/axiosInstance";
import API_URL from "../../../config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import DeleteIcon from "@mui/icons-material/Delete";

const getColors = (mode) => ({
  background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
  text: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
  accent: "#F5B800",
  secondary: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  cardBackground: mode === "dark" ? "#292929" : "#FFFFFF",
  tableHeader: "#6A4C93",
  approved: "#4CAF50", // Green for approved
  pending: "#F44336", // Red for pending
});

const ManageCategories = () => {
  const theme = useTheme();
  const colors = getColors(theme.palette.mode);

  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchCategories();
}, [page, filter, searchQuery]);

const fetchCategories = async () => {
    try {
        const response = await axiosInstance.get(
            `${API_URL}/categories/all`, {
                params: {
                    page,
                    limit,
                    search: searchQuery,  // ✅ Ensure search is passed properly
                    filter
                }
            }
        );

        setCategories(response.data.categories || []);
        setTotalPages(response.data.total_pages); // ✅ Ensure backend sends total pages
    } catch (error) {
        console.error("Error fetching categories:", error);
        setSnackbar({ open: true, message: "Error fetching categories", severity: "error" });
    }
};



  const handleRejectClick = (category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason) {
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
    <Box sx={{ background: colors.background, minHeight: "100vh", py: 4 }}>
      <Typography variant="h4" sx={{ color: colors.text, mb: 3, fontWeight: "bold" }}>
        Manage Categories
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Search Categories"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ background: colors.cardBackground }}
        />

        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ background: colors.cardBackground, color: colors.text }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="not_approved">Not Approved</MenuItem>
        </Select>
      </Box>

      <TableContainer component={Paper} sx={{ background: colors.cardBackground }}>
        <Table>
          <TableHead sx={{ background: colors.tableHeader }}>
            <TableRow>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell sx={{ color: category.is_approved ? colors.approved : colors.pending, fontWeight: "bold" }}>
                  {category.is_approved ? "Approved" : "Pending Approval"}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleRejectClick(category)} color="error">
                    <DeleteIcon /> Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageCategories;
