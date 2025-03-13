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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axiosInstance from "../../services/axiosInstance";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate


const getColors = (mode) => ({
  background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
  text: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
  accent: "#F5B800",
  secondary: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  cardBackground: mode === "dark" ? "#292929" : "#FFFFFF",
  tableHeader: "#6A4C93",
});

const AdminManageProducts = () => {

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

  useEffect(() => {
    fetchNGOs();
    fetchCategories();
    fetchProducts(); // ✅ Fetch products immediately when the page loads
  }, []);
  

  const fetchNGOs = async () => {
    try {
      const token = localStorage.getItem("access_token");
  
      if (!token) {
        console.error("❌ No token found. Ensure the user is logged in.");
        return;
      }
  
      const { data } = await axiosInstance.get("/admin/ngos?verified=true", {
        headers: { Authorization: `Bearer ${token}` }, // ✅ Send token in the request
      });
  
      console.log("🔍 Fetched NGOs:", data);
  
      if (Array.isArray(data)) {
        setNgos(
          data.map((ngo) => ({
            universal_user_id: ngo.universal_user_id, // ✅ Use Universal User ID
            ngo_name: ngo.ngo_name,
          }))
        );
      } else {
        console.error("Unexpected NGO API response format:", data);
      }
    } catch (error) {
      console.error("❌ Error fetching NGOs:", error);
      if (error.response?.status === 403) {
        console.error("🚫 Unauthorized: Make sure you are logged in as an admin.");
      }
    }
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
        const params = {
            status: status === "all" ? undefined : status, 
            ngo_id: ngoId || undefined,
            category_id: categoryId || undefined,
            min_price: priceRange[0] || undefined,  // ✅ Use updated price range
            max_price: priceRange[1] || undefined,
        };

        console.log("🔍 Fetching Products with Params:", params);

        const { data } = await axiosInstance.get("/products/browse", { params });

        if (data.products && Array.isArray(data.products)) {
            setProducts(data.products);
        } else {
            console.error("Unexpected Products API response format:", data);
            setProducts([]);  
        }
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        setProducts([]);  
    }
    setLoading(false);
};

  

  return (
    <Container maxWidth="lg" sx={{ background: colors.background, minHeight: "100vh", py: 4 }}>
      <Typography variant="h4" sx={{ color: colors.text, mb: 2, fontWeight: "bold" }}>
        Filter Products
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Status Filter */}
        <Grid item xs={12} sm={3}>
          <Select fullWidth value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="unapproved">Unapproved</MenuItem>
            <MenuItem value="live">Live</MenuItem>
            <MenuItem value="unlive">Unlive</MenuItem>
          </Select>
        </Grid>

        {/* NGO Filter */}
        <Grid item xs={12} sm={3}>
  <Select fullWidth value={ngoId} onChange={(e) => setNgoId(e.target.value)}>
    <MenuItem value="">All NGOs</MenuItem>
    {ngos.map((ngo, index) => (
      <MenuItem key={ngo.universal_user_id || `ngo-${index}`} value={ngo.universal_user_id}>
        {ngo.ngo_name}
      </MenuItem>
    ))}
  </Select>
</Grid>



        {/* Category Filter */}
        <Grid item xs={12} sm={3}>
          <Select fullWidth value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
            ))}
          </Select>
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
        setPriceRange(newValue);  // ✅ Only update if max >= min
      }
    }}
    valueLabelDisplay="auto"
    min={0}  // Adjust as needed
    max={10000}  // Adjust as needed
    step={100}  // Step for each change
    sx={{ color: colors.accent }}
  />
</Grid>



        {/* Apply Button */}
        <Grid item xs={12} sm={12}>
          <Button variant="contained" sx={{ background: colors.accent }} fullWidth onClick={fetchProducts}>
            Apply Filters
          </Button>
        </Grid>
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
          <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((product) => (
          <TableRow 
            key={product.id} 
            sx={{ cursor: "pointer", "&:hover": { background: colors.secondary } }} // ✅ Hover effect
            onClick={() => navigate(`/products/details/${product.id}`)} // ✅ Navigate on click
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
            <TableCell 
              sx={{ color: product.is_live ? "#4CAF50" : "#F44336", fontWeight: "bold" }}
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

    </Container>
  );
};

export default AdminManageProducts;
