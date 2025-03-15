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
  Slider,
  FormControl,
  InputLabel,
  Checkbox,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axiosInstance from "../../../services/axiosInstance";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import Pagination from "@mui/material/Pagination"; // ✅ Import Pagination
import Papa from "papaparse"; // Import CSV Parser
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Import autoTable
import { DatePicker } from "@mui/x-date-pickers/DatePicker"; 
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"; // ✅ Calendar icon
import dayjs from "dayjs";




const getColors = (mode) => ({
  background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
  text: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
  accent: "#F5B800",
  secondary: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  cardBackground: mode === "dark" ? "#292929" : "#FFFFFF",
  tableHeader: "#6A4C93",
});

const NGOManageProducts = () => {

  const navigate = useNavigate(); // ✅ Initialize navigate

  const theme = useTheme();
  const colors = getColors(theme.palette.mode);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [status, setStatus] = useState("all");
  const [ngoId, setNgoId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]); // Default ₹0 - ₹10,000

  const [ngos, setNgos] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchQuery, setSearchQuery] = useState(""); // ✅ Search Query
  const [page, setPage] = useState(1); // ✅ Current Page
  const [totalPages, setTotalPages] = useState(1); // ✅ Total Pages
  const limit = 10; // ✅ Items per page

  const [startDate, setStartDate] = useState(""); // ✅ Start Date
  const [endDate, setEndDate] = useState(""); // ✅ End Date



  useEffect(() => {
    const delayFetch = setTimeout(() => {
  fetchCategories();
      fetchProducts();
    }, 500); // ✅ Debounce API call (waits 500ms before fetching)
  
    return () => clearTimeout(delayFetch); // ✅ Cleanup timeout
  }, [status, ngoId, categoryId, priceRange, startDate, endDate, searchQuery, page]);
  


  const downloadPDF = () => {
    if (!products.length) {
      alert("No products available for export!");
      return;
    }
  
    const doc = new jsPDF("l", "mm", "a4"); // ✅ Landscape, Tabloid Size for Extra Width
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoUrl = "/assets/logo.png"; // ✅ Adjust based on your logo path
  
    // ✅ Add Logo as Watermark
    doc.addImage(logoUrl, "PNG", pageWidth / 2 - 30, 10, 60, 20); // Centered Logo
  
    // ✅ Add Report Header
    doc.setFontSize(22);
    doc.setTextColor("#6A4C93"); // Dark Purple
    doc.text("Product Report", pageWidth / 2, 40, { align: "center" });
  
    // ✅ Add Date
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    doc.setFontSize(12);
    doc.setTextColor("#333");
    doc.text(`Date: ${currentDate}`, 14, 50);
  
    // ✅ Table Headers
    const tableColumn = [
      "ID", "Product Name", "Category", "Price", "Stock", "Status", "Created At"
    ];
    const tableRows = [];
  
    // ✅ Add Table Data
    products.forEach((product) => {
      tableRows.push([
        product.id,
        product.name,
        product.category?.name || "No Category",
        product.price,
        product.stock,
        product.is_live ? "Live" : "Unlive",
        product.created_at.split("T")[0], // ✅ Keep Only Date
      ]);
    });
  
    // ✅ Apply `autoTable` with Final Styling
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
        0: { cellWidth: 15 },  // ID
        1: { cellWidth: 40 },  // Product Name (Wider)
        2: { cellWidth: 30 },  // Category
        4: { cellWidth: 25 },  // Price
        5: { cellWidth: 20 },  // Stock
        6: { cellWidth: 25 },  // Status
        7: { cellWidth: 30 },  // Created At
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
  
    doc.save("Products_Report.pdf");
  
    alert("PDF report downloaded successfully!");
  };
  
  


const downloadCSV = () => {
    if (products.length === 0) {
      alert("No products to export!");
      return;
    }
  
    const csvData = products.map(product => ({
      ID: product.id,
      Name: product.name,
      Category: product.category?.name || "No Category",
      NGO: product.ngo?.ngo_name || "No NGO",
      Price: `₹${product.price}`,
      Stock: product.stock,
      Status: product.is_live ? "Live" : "Unlive",
    }));
  
    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Products_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
  

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get("/categories/");
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
        // ✅ Fetch logged-in user details
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        const userNgoId = loggedInUser?.id || ""; // ✅ Universal User ID from logged-in user

        // ✅ Construct API parameters dynamically
        const params = {};

        // ✅ Only include filters if they have valid values
        if (status !== "all") params.status = status;
        if (priceRange[0] > 0) params.min_price = priceRange[0];
        if (priceRange[1] < 10000) params.max_price = priceRange[1];
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (searchQuery.trim() !== "") params.search_query = searchQuery;
        params.limit = limit;
        params.offset = (page - 1) * limit;

        // ✅ Include `ngo_ids` if selected, otherwise use logged-in user's NGO ID
        if (ngoId.length > 0) {
            params.ngo_ids = ngoId;
        } else if (userNgoId) {
            params.ngo_ids = [userNgoId]; // ✅ Automatically use current user's universal_user_id
        }

        // ✅ Include `category_ids` only if selected
        if (categoryId.length > 0) params.category_ids = categoryId;

        console.log("🔍 Fetching Products with Params:", params);

        // ✅ Fetch API with optimized parameters
        const { data } = await axiosInstance.get("/products/browse", {
            params,
            paramsSerializer: (params) =>
                Object.keys(params)
                    .map((key) =>
                        Array.isArray(params[key])
                            ? params[key].map((val) => `${key}=${encodeURIComponent(val)}`).join("&")
                            : `${key}=${encodeURIComponent(params[key])}`
                    )
                    .join("&"),
        });

        if (data.products && Array.isArray(data.products)) {
            setProducts([...data.products]); // ✅ Ensure React Re-renders
            setTotalPages(Math.ceil((data.total || 1) / limit));
        } else {
            console.error("Unexpected Products API response format:", data);
            setProducts([]);
            setTotalPages(1);
        }
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        setProducts([]);
        setTotalPages(1);
    }
    setLoading(false);
};





  

  return (
    <Container maxWidth="lg" sx={{ background: colors.background, minHeight: "100vh", py: 4 }}>
      <Typography variant="h4" sx={{ color: colors.text, mb: 2, fontWeight: "bold" }}>
        Filter Products
      </Typography>


     {/* Search Bar */}
     <Grid container spacing={2} sx={{ mb: 3 }}>
  {/* 🔍 Search Bar */}
  <Grid item xs={12} sm={10}>
  <TextField
  fullWidth
  variant="outlined"
  placeholder="Search products..."
  value={searchQuery}
  onChange={(e) => {
    setSearchQuery(e.target.value);
  }}
  onKeyDown={(e) => e.key === "Enter" && fetchProducts()} // ✅ Correct way
/>

  </Grid>

  {/* 🔽 Status Filter */}
  <Grid item xs={12} sm={2}>
  <FormControl fullWidth>
    <InputLabel>Status</InputLabel>
    <Select
  value={status}
  onChange={(e) => {
    setStatus(e.target.value);
    
  }}
  label="Status"
>
      <MenuItem value="all">All</MenuItem>
      <MenuItem value="approved">Approved</MenuItem>
      <MenuItem value="unapproved">Unapproved</MenuItem>
      <MenuItem value="live">Live</MenuItem>
      <MenuItem value="unlive">Unlive</MenuItem>
    </Select>
  </FormControl>
</Grid>

</Grid>




<Grid container spacing={2} sx={{ mb: 3 }}>
       

        {/* Start Date */}
 <Grid item xs={12} sm={3}>
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker
      label="Start Date"
      value={startDate ? dayjs(startDate) : null}
      onChange={(newValue) => setStartDate(newValue ? newValue.format("YYYY-MM-DD") : "")}
      disableFuture // ✅ Prevent selecting future dates
      maxDate={endDate ? dayjs(endDate) : undefined} // ✅ Prevent selecting after end date
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderRadius: "8px",
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "primary.light",
          },
          "&:hover fieldset": {
            borderColor: "primary.main",
          },
          "&.Mui-focused fieldset": {
            borderColor: "primary.dark",
          },
        },
      }}
      slots={{
        openPickerIcon: CalendarTodayIcon, // ✅ Custom Icon
      }}
    />
  </LocalizationProvider>
</Grid>

{/* End Date */}
<Grid item xs={12} sm={3}>
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
      maxDate={dayjs()} // ✅ Prevent selecting future dates
      minDate={startDate ? dayjs(startDate) : undefined} // ✅ Prevent selecting before start date
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderRadius: "8px",
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "primary.light",
          },
          "&:hover fieldset": {
            borderColor: "primary.main",
          },
          "&.Mui-focused fieldset": {
            borderColor: "primary.dark",
          },
        },
      }}
      slots={{
        openPickerIcon: CalendarTodayIcon, // ✅ Custom Icon
      }}
    />
  </LocalizationProvider>
</Grid>





        {/* Category Filter */}
        <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
  <InputLabel>Category</InputLabel>
  <Select
    multiple
    value={Array.isArray(categoryId) ? categoryId : []} // ✅ Ensure value is always an array
    onChange={(e) => setCategoryId(typeof e.target.value === "string" ? [e.target.value] : e.target.value)}
    label="Category"
    renderValue={(selected) =>
      selected.map((id) => categories.find((category) => category.id === id)?.name).join(", ")
    }
  >
    {categories.map((category) => (
      <MenuItem key={category.id} value={category.id}>
        <Checkbox checked={categoryId.includes(category.id)} />
        {category.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>

</Grid>

</Grid>

        {/* Price Filters */}
        <Grid item xs={12} sm={6}>
  <Typography sx={{ color: colors.text, mb: 1 }}>
    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
  </Typography>
  <Slider
  value={priceRange}
  onChange={(e, newValue) => {
    if (newValue[1] > newValue[0]) {
      setPriceRange(newValue);
    }
  }}
  valueLabelDisplay="auto"
  min={0}
  max={10000}
  step={100}
/>

</Grid>



      

      {loading ? (
  <CircularProgress sx={{ color: colors.accent }} />
) : products.length > 0 ? (
  <TableContainer component={Paper} sx={{ background: colors.cardBackground }}>
  <Table>
    <TableHead sx={{ background: colors.tableHeader }}>
      <TableRow>
        <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Product Name</TableCell>
        <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Category</TableCell>
        <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>NGO</TableCell>
        <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Price</TableCell>
        <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Stock</TableCell>
        <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Approval Status</TableCell>
        <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Live Status</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {products.map((product) => (
        <TableRow 
          key={product.id} 
          sx={{ cursor: "pointer", "&:hover": { background: colors.secondary } }} 
          onClick={() => navigate(`/ngo/product/details/${product.id}`)} 
        >
          <TableCell sx={{ color: colors.text }}>{product.name}</TableCell>
          <TableCell sx={{ color: colors.text }}>
            {product.category?.name || "No Category"}
          </TableCell>
          <TableCell sx={{ color: colors.text }}>
            {product.ngo?.ngo_name || "No NGO"}
          </TableCell>
          <TableCell sx={{ color: colors.text }}>₹{product.price}</TableCell>
          <TableCell sx={{ color: colors.text }}>{product.stock}</TableCell>
          
          {/* ✅ Approval Status Column */}
          <TableCell 
            sx={{ 
              color: product.is_approved ? "#4CAF50" : "#F44336", 
              fontWeight: "bold"
            }}
          >
            {product.is_approved ? "Approved" : "Unapproved"}
          </TableCell>

          {/* ✅ Live Status Column */}
          <TableCell 
            sx={{ 
              color: product.is_live ? "#4CAF50" : "#F44336", 
              fontWeight: "bold"
            }}
          >
            {product.is_live ? "Live" : "Unlive"}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

) : (
  <Typography>No products found</Typography>
)}      

<Box display="flex" justifyContent="center" mt={3}>
  <Pagination 
    count={totalPages} 
    page={page} 
    onChange={(event, value) => setPage(value)} // ✅ Now it will trigger useEffect

    color="primary" 
  />
</Box>

<Box display="flex" justifyContent="center" mt={3} gap={2}>
  <Button variant="contained" sx={{ background: colors.secondary, color: "#FFFFFF", "&:hover": { background: "#4C3A93" } }} onClick={downloadCSV}>
    Download CSV
  </Button>
  <Button variant="contained" sx={{ background: colors.accent, color: "#FFFFFF", "&:hover": { background: "#F5A000" } }} onClick={downloadPDF}>
    Download PDF
  </Button>
</Box>



    </Container>
  );
};

export default NGOManageProducts;
