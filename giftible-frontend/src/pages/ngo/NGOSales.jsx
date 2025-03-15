import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Checkbox,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axiosInstance from "../../services/axiosInstance";
import Pagination from "@mui/material/Pagination";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from "dayjs";

// ✅ Get color theme based on mode
const getColors = (mode) => ({
  background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
  text: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
  accent: "#F5B800",
  secondary: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  cardBackground: mode === "dark" ? "#292929" : "#FFFFFF",
  tableHeader: "#6A4C93",
});

const NGOSales = () => {
  const theme = useTheme();
  const colors = getColors(theme.palette.mode);

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ngoId, setNgoId] = useState([]);
  const [categoryId, setCategoryId] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchCategories();
    fetchSales();
  }, [startDate, endDate, searchQuery, ngoId, categoryId, page]);

 
  
  // ✅ Fetch Categories
  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get("/categories/");
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  

  // ✅ Fetch Sales Data
  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        search_query: searchQuery || undefined,
        limit,
        offset: (page - 1) * limit,
        ngo_id: ngoId || undefined, // ✅ Pass as single value, not array
        category_id: categoryId || undefined, // ✅ Pass as single value, not array
      };

      const { data } = await axiosInstance.get("/sales/date-range", { params });
      setSales(data || []);
      setTotalPages(Math.ceil((data.total || 1) / limit));
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
    setLoading(false);
  };


  const handleDownloadPDF = () => {
    if (!sales.length) {
      setSnackbar({ open: true, message: "No sales data available for export", severity: "warning" });
      return;
    }
  
    const doc = new jsPDF("l", "mm", "tabloid"); // ✅ Landscape for better fit
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoUrl = "/assets/logo.png"; // ✅ Change to your logo path
  
    // ✅ Add Logo as Watermark
    doc.addImage(logoUrl, "PNG", pageWidth / 2 - 30, 10, 60, 20); // Centered Logo
  
    // ✅ Add Report Header
    doc.setFontSize(22);
    doc.setTextColor("#6A4C93"); // Dark Purple
    doc.text("Sales Report", pageWidth / 2, 40, { align: "center" });
  
    // ✅ Add Date
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    doc.setFontSize(12);
    doc.setTextColor("#333");
    doc.text(`Date: ${currentDate}`, 14, 50);
  
    // ✅ Table Headers
    const tableColumn = [
      "Product Name",
      "Category Name",
      "Price",
      "Total Sales",
    ];
    const tableRows = [];
  
    // ✅ Add Table Data
    sales.forEach((item) => {
      tableRows.push([
        item.name,
        item.category_name || "N/A",
        `₹${item.price}`,
        `₹${item.total_sales}`,
      ]);
    });
  
    // ✅ Apply autoTable with Proper Formatting
    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 10, // ✅ Bigger Font for Readability
        cellPadding: 4, // ✅ More Padding for Spacing
        overflow: "linebreak", // ✅ Word Wrap for Long Text
      },
      headStyles: {
        fillColor: "#6A4C93", // ✅ Purple Header
        textColor: "#FFFFFF",
        fontStyle: "bold",
        fontSize: 12, // ✅ Larger Header Text
      },
      columnStyles: {
        0: { cellWidth: 60 }, // Product Name
        2: { cellWidth: 40 }, // Category Name
        3: { cellWidth: 25 }, // Price
        4: { cellWidth: 30 }, // Total Sales
      },
      alternateRowStyles: {
        fillColor: "#F4F4F4", // ✅ Light Gray for Alternate Rows
      },
      margin: { top: 60, bottom: 20 },
      didDrawPage: (data) => {
        // ✅ Add Page Number
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Page ${pageCount}`, pageWidth - 40, pageHeight - 10);
      },
    });
  
    doc.save("Sales_Report.pdf");
  
    setSnackbar({ open: true, message: "PDF report downloaded", severity: "success" });
  };

  
  // ✅ CSV Export
  const downloadCSV = () => {
    if (sales.length === 0) {
      alert("No sales data to export!");
      return;
    }
  
    const csvData = sales.map((item) => ({
      ID: item.id,
      Name: item.name,
      "Category Name": item.category_name || "N/A", // ✅ Added Category Name
      Price: `₹${item.price}`,
      TotalSales: `₹${item.total_sales}`,
    }));
  
    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  return (
    <Container maxWidth="lg" sx={{ background: colors.background, minHeight: "100vh", py: 4 }}>
      <Typography variant="h4" sx={{ color: colors.text, mb: 3, fontWeight: "bold" }}>
        Sales Report
      </Typography>

     {/* Filters */}
<Grid container spacing={2} sx={{ mb: 3 }}>
  {/* Search, Start Date, End Date - Aligned Together */}
<Grid item xs={12}>
  <Box display="flex" gap={2} alignItems="center" justifyContent="space-between">
    {/* Search Input */}
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      sx={{ flex: 1 }} // ✅ Ensures equal spacing
    />

    {/* Start Date Picker */}
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Start Date"
        value={startDate ? dayjs(startDate) : null}
        onChange={(newValue) => {
          if (newValue && endDate && newValue.isAfter(dayjs(endDate))) {
            alert("⚠️ Start Date cannot be after End Date.");
          } else {
            setStartDate(newValue ? newValue.format("YYYY-MM-DD") : "");
          }
        }}
        disableFuture
        maxDate={endDate ? dayjs(endDate) : undefined}
        slots={{ openPickerIcon: CalendarTodayIcon }}
        sx={{ flex: 1 }} // ✅ Equal width
      />
    </LocalizationProvider>

    {/* End Date Picker */}
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="End Date"
        value={endDate ? dayjs(endDate) : null}
        onChange={(newValue) => {
          if (startDate && newValue && newValue.isBefore(dayjs(startDate))) {
            alert("⚠️ End Date cannot be before Start Date.");
          } else {
            setEndDate(newValue ? newValue.format("YYYY-MM-DD") : "");
          }
        }}
        disableFuture
        minDate={startDate ? dayjs(startDate) : undefined}
        slots={{ openPickerIcon: CalendarTodayIcon }}
        sx={{ flex: 1 }} // ✅ Equal width
      />
    </LocalizationProvider>
  </Box>
</Grid>


  

{/* Category ID Filter (Single Selection) */}
<Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <InputLabel>Category</InputLabel>
    <Select
      value={categoryId || ""} // ✅ Default to empty for "All"
      onChange={(e) => setCategoryId(e.target.value === "all" ? null : e.target.value)}
      renderValue={(selected) =>
        selected
          ? categories.find((category) => category.id === selected)?.name || ""
          : "All Categories"
      }
    >
      {/* ✅ Option to Remove Category Filter */}
      <MenuItem value="all">All Categories</MenuItem>
      {categories.map((category) => (
        <MenuItem key={category.id} value={category.id}>
          {category.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

</Grid>


      {/* Sales Table */}
      {loading ? (
        <CircularProgress sx={{ color: colors.accent }} />
      ) : sales.length > 0 ? (
        <TableContainer component={Paper} sx={{ background: colors.cardBackground }}>
        <Table>
          <TableHead sx={{ background: colors.tableHeader }}>
            <TableRow>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Product Name</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Category</TableCell> {/* ✅ Added Category Name */}
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Price</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Total Sales</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((item) => (
              <TableRow key={item.id}>
                <TableCell sx={{ color: colors.text }}>{item.name}</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: "bold" }}>{item.category_name || "N/A"}</TableCell> {/* ✅ Added Category */}
                <TableCell sx={{ color: colors.text }}>₹{item.price}</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: "bold" }}>₹{item.total_sales}</TableCell>
              </TableRow>
            ))}
            {/* ✅ Grand Total Row */}
            <TableRow>
              <TableCell colSpan={3} sx={{ color: colors.text, fontWeight: "bold", textAlign: "right" }}>
                Total Sales:
              </TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: "bold", fontSize: "1.1rem" }}>
                ₹{sales.reduce((acc, item) => acc + (item.total_sales || 0), 0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      


      ) : (
        <Typography>No sales found</Typography>
      )}

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination count={totalPages} page={page} onChange={(event, value) => setPage(value)} color="primary" />
      </Box>

      {/* Export CSV */}
      <Box display="flex" justifyContent="center" mt={3} gap={2}>
  <Button
    onClick={handleDownloadPDF}
    sx={{ background: colors.accent, color: "#FFFFFF", "&:hover": { background: "#F5A000" } }}
  >
    Download PDF
  </Button>
  
  <Button
    onClick={downloadCSV}
    sx={{ background: colors.secondary, color: "#FFFFFF", "&:hover": { background: "#4C3A93" } }}
  >
    Download CSV
  </Button>
</Box>
    </Container>
  );
};

export default NGOSales;
