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
  TextField,
  Snackbar,
  Alert,
  Box,
  Pagination,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import axiosInstance from "../../../services/axiosInstance";
import API_URL from "../../../config";

const getColors = (mode) => ({
  background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
  text: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
  accent: "#F5B800",
  secondary: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  cardBackground: mode === "dark" ? "#292929" : "#FFFFFF",
  tableHeader: "#6A4C93",
});

const CategoryList = () => {
  const theme = useTheme();
  const colors = getColors(theme.palette.mode);
  const navigate = useNavigate(); // ✅ Use navigate for redirection

  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchCategories();
  }, [page, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/categories/all`, {
        params: {
          page,
          limit,
          search: searchQuery,
        },
      });

      setCategories(response.data.categories || []);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setSnackbar({ open: true, message: "Error fetching categories", severity: "error" });
    }
  };

  return (
    <Box sx={{ background: colors.background, minHeight: "100vh", py: 4 }}>
      <Typography variant="h4" sx={{ color: colors.text, mb: 3, fontWeight: "bold" }}>
        Manage Categories
      </Typography>

      {/* 🔍 Search & ➕ Create Category - Aligned Properly */}
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={3}>
        <TextField
          label="Search Categories"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ background: colors.cardBackground }}
        />

        <Button
          variant="contained"
          sx={{
            background: colors.accent,
            color: "#1B1B1B",
            whiteSpace: "nowrap", // ✅ Prevents text from wrapping
            "&:hover": { background: "#F5A000" },
            height: "56px", // ✅ Matches search bar height
          }}
          onClick={() => navigate("/ngo/categories/add")} // ✅ Navigate to category creation page
        >
          + Create New Category
        </Button>
      </Box>

      {/* 📋 Categories Table */}
      <TableContainer component={Paper} sx={{ background: colors.cardBackground }}>
        <Table>
          <TableHead sx={{ background: colors.tableHeader }}>
            <TableRow>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 📌 Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination count={totalPages} page={page} onChange={(event, value) => setPage(value)} color="primary" />
      </Box>

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

export default CategoryList;
