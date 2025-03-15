import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Box,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Slider,
  Pagination,
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Snackbar,
  Alert,
  RadioGroup,
  Radio 
} from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material"; // ❤️ Wishlist icons
import ExpandMore from "@mui/icons-material/ExpandMore"; // ✅ Correct Import
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";
import axiosInstance from "../../services/axiosInstance";
import { addToWishlist, removeFromWishlist, fetchWishlist } from "../../services/wishlistService";
import { useLocation } from "react-router-dom";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [totalNgos, setTotalNgos] = useState(0);
  const location = useLocation();
  const [sortBy, setSortBy] = useState("random"); // Default: Show products in random order

  
  const [filters, setFilters] = useState({
    status: "live",
    category_ids: [],
    ngo_ids: [],
    min_price: 0,
    max_price: 10000, // Default max price
  });

  const navigate = useNavigate();
  const limit = 9; // Products per page

  useEffect(() => {
    fetchProducts(location); // ✅ Pass location to fetchProducts()
    fetchCategories();
    fetchNGOs();
}, [page, JSON.stringify(filters), sortBy]); // ✅ Added `sortBy` to trigger re-fetch

useEffect(() => {
    const fetchWishlistItems = async () => {
        try {
            const wishlistItems = await fetchWishlist();
            setWishlist(wishlistItems.map((item) => item.product_id)); // ✅ Store only product IDs
        } catch (error) {
            console.error("❌ Error fetching wishlist:", error);
        }
    };
    fetchWishlistItems();
}, []);
  



const fetchProducts = async (location) => {
  setLoading(true);
  try {
      const params = new URLSearchParams(location.search);
      const urlNgoIds = params.getAll("ngo_ids");
      const urlCategoryIds = params.getAll("category_ids");
      const searchQuery = params.get("search_query") || ""; // ✅ Extract search query from URL

      const requestParams = {
          status: filters.status,
          min_price: filters.min_price,
          max_price: filters.max_price,
          limit,
          offset: (page - 1) * limit,
      };

      if (searchQuery) {
          requestParams.search_query = searchQuery; // ✅ Add search query to request
      }

      if (urlNgoIds.length > 0) {
          requestParams.ngo_ids = [...new Set([...urlNgoIds.map(Number), ...filters.ngo_ids])];
      } else if (filters.ngo_ids.length > 0) {
          requestParams.ngo_ids = filters.ngo_ids;
      }

      if (urlCategoryIds.length > 0) {
          requestParams.category_ids = [...new Set([...urlCategoryIds.map(Number), ...filters.category_ids])];
      } else if (filters.category_ids.length > 0) {
          requestParams.category_ids = filters.category_ids;
      }

      console.log("🔍 Fetching Products with Params:", requestParams);

      const { data } = await axiosInstance.get("http://127.0.0.1:8000/products/browse", {
          params: requestParams,
          paramsSerializer: (params) =>
              Object.keys(params)
                  .map((key) =>
                      Array.isArray(params[key])
                          ? params[key].map((val) => `${key}=${encodeURIComponent(val)}`).join("&")
                          : `${key}=${encodeURIComponent(params[key])}`
                  )
                  .join("&"),
      });

      console.log("✅ API Response:", data);

      let sortedProducts = [...(data.products || [])];

      // 🔀 Apply sorting based on user selection
      if (sortBy === "price_asc") {
          sortedProducts.sort((a, b) => a.price - b.price);
      } else if (sortBy === "price_desc") {
          sortedProducts.sort((a, b) => b.price - a.price);
      } else if (sortBy === "latest") {
          sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (sortBy === "oldest") {
          sortedProducts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      } else {
          sortedProducts.sort(() => Math.random() - 0.5); // 🔀 Default: Random Order
      }

      setProducts(sortedProducts);
      setTotalPages(Math.ceil(data.total / limit));
      setMessage(data.message);
  } catch (err) {
      console.error("❌ Error fetching products:", err);
      setMessage("Failed to fetch products. Please try again.");
  }
  setLoading(false);
};



  


  const handleWishlistToggle = async (productId) => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const userId = loggedInUser?.id;
  
    if (!userId) {
      setSnackbar({ open: true, message: "Login to add product to wishlist", severity: "warning" });
      return; // ✅ Prevent action if user is not logged in
    }
  
    try {
      if (wishlist.includes(productId)) {
        await removeFromWishlist(productId);
        setWishlist((prev) => prev.filter((id) => id !== productId));
        setSnackbar({ open: true, message: "Product removed from wishlist", severity: "info" });
      } else {
        await addToWishlist(productId);
        setWishlist((prev) => [...prev, productId]);
        setSnackbar({ open: true, message: "Product added to wishlist", severity: "success" });
      }
    } catch (error) {
      console.error("❌ Wishlist toggle failed:", error);
      setSnackbar({ open: true, message: "Error updating wishlist", severity: "error" });
    }
  };
  
  
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get("/categories");
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchNGOs = async (limit = 10, offset = 0) => {
    try {
      const { data } = await axiosInstance.get("/ngo/approved", {
        params: { limit, offset }, // ✅ Pass pagination params
      });
  
      setNgos(data.ngos || []); // ✅ Extract `ngos` list properly
      setTotalNgos(data.total || 0); // ✅ Extract total NGO count
      setTotalPages(Math.ceil((data.total || 0) / limit)); // ✅ Update pagination
    } catch (err) {
      console.error("Error fetching NGOs:", err);
    }
  };
  

  const handleCategoryChange = (id) => {
    setFilters((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((catId) => catId !== id)
        : [...prev.category_ids, id],
    }));
    setPage(1);
  };

  const handleNgoChange = (id) => {
    setFilters((prev) => ({
      ...prev,
      ngo_ids: prev.ngo_ids.includes(id)
        ? prev.ngo_ids.filter((ngoId) => ngoId !== id)
        : [...prev.ngo_ids, id],
    }));
    setPage(1);
  };

  const handlePriceChange = (event, newValue) => {
    setFilters({ ...filters, min_price: newValue[0], max_price: newValue[1] });
    setPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
     <Typography
  variant="h4"
  fontWeight="bold"
  gutterBottom
  sx={{
    color: "primary.light", // 🎨 Golden Yellow (#F5B800)
    letterSpacing: 1.2, // ✅ Slight spacing for a premium look
  }}
>
  Browse Products
</Typography>


      <Grid container spacing={4}>
        {/* 🔹 Left Sidebar (Filters) */}
        <Grid item xs={12} md={3}>
        <Box
  sx={{
    p: 2,
    bgcolor: "background.paper",
    borderRadius: "12px",
    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.12)",
    border: "2px solid",
    borderColor: "primary.light", // Uses your **Golden Yellow (#F5B800)**
    transition: "0.3s",
    "&:hover": {
      boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
      transform: "scale(1.02)",
    },
  }}
>

            <Typography variant="h6" fontWeight="bold">
              Filters
            </Typography>



  {/* ✅ Sorting Accordion */}
  <Accordion sx={{ boxShadow: "none", bgcolor: "transparent" }}>
  <AccordionSummary
    expandIcon={<ExpandMore />}
    aria-controls="sort-content"
    id="sort-header"
  >
    <Typography variant="body1" fontWeight="bold">Sort</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <FormGroup>
      <RadioGroup
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <FormControlLabel
          value="random"
          control={<Radio />}
          label="Relevance"
        />
        <FormControlLabel
          value="price_asc"
          control={<Radio />}
          label="Price: Low to High"
        />
        <FormControlLabel
          value="price_desc"
          control={<Radio />}
          label="Price: High to Low"
        />
        <FormControlLabel
          value="latest"
          control={<Radio />}
          label="Newest First"
        />
        <FormControlLabel
          value="oldest"
          control={<Radio />}
          label="Oldest First"
        />
      </RadioGroup>
    </FormGroup>
  </AccordionDetails>
</Accordion>



  {/* ✅ Price Range Slider */}
  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              Price Range
            </Typography>
            <Slider
              value={[filters.min_price, filters.max_price]}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={10000}
              step={100}
            />
         



            {/* ✅ Category Filter */}


<Accordion sx={{ boxShadow: "none", bgcolor: "transparent" }}>
  <AccordionSummary
    expandIcon={<ExpandMore />}
    aria-controls="category-content"
    id="category-header"
  >
    <Typography variant="body1" fontWeight="bold">Categories</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <FormGroup>
      {categories.map((category) => (
        <FormControlLabel
          key={category.id}
          control={
            <Checkbox
              checked={filters.category_ids.includes(category.id)}
              onChange={() => handleCategoryChange(category.id)}
            />
          }
          label={category.name}
        />
      ))}
    </FormGroup>
  </AccordionDetails>
</Accordion>


            {/* ✅ NGO Filter */}
           
<Accordion sx={{ boxShadow: "none", bgcolor: "transparent" }}>
  <AccordionSummary
    expandIcon={<ExpandMore />} // ✅ Expand Icon
    aria-controls="ngo-content"
    id="ngo-header"
  >
    <Typography variant="body1" fontWeight="bold">Select NGOs</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <FormGroup>
      {ngos.map((ngo) => (
        <FormControlLabel
          key={ngo.universal_user_id}
          control={
            <Checkbox
              checked={filters.ngo_ids.includes(ngo.universal_user_id)}
              onChange={() => handleNgoChange(ngo.universal_user_id)}
            />
          }
          label={ngo.ngo_name}
        />
      ))}
    </FormGroup>
  </AccordionDetails>
</Accordion>
</Box>

                  </Grid>

        {/* 🔹 Right Side (Product Grid) */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />
          ) : products.length === 0 ? (
            <Typography color="error">{message || "No products available."}</Typography>
          ) : (
            <>
              <Grid container spacing={3}>
                {products.map((product) => {
                  const imageUrl =
                    product.images?.length > 0
                      ? `${API_BASE_URL}/${product.images[0].image_url}`
                      : "https://via.placeholder.com/150";

                  return (

<Grid item xs={12} sm={6} md={4} key={product.id}>
  <Card
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      textDecoration: "none",
      borderRadius: "12px",
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
      position: "relative", // ✅ Required for positioning the heart icon
      cursor: "pointer", // ✅ Makes the card clickable
      transition: "transform 0.3s ease-in-out",
      "&:hover": { transform: "scale(1.03)" },
    }}
    onClick={() => navigate(`/products/${product.id}`)} // ✅ Make entire card clickable
  >
    {/* ❤️ Wishlist Icon */}
    <Box
  sx={{
    position: "absolute",
    top: 12,
    right: 12,
    borderRadius: "50%",
    padding: "4px",
    cursor: "pointer",
    transition: "0.3s ease-in-out",
    "&:hover": { transform: "scale(1.1)" }, // ✅ Hover effect
  }}
  onClick={(e) => {
    e.stopPropagation(); // ✅ Prevent card navigation
    handleWishlistToggle(product.id);
  }}
>
  {wishlist.includes(product.id) ? (
    <Favorite sx={{ color: "#F5B800" }} /> // 💛 Filled Heart (Golden Yellow)
  ) : (
    <FavoriteBorder sx={{ color: "#F5B800" }} /> // 🤍 Outlined Heart
  )}
</Box>


    {/* 🖼️ Product Image */}
    <CardMedia
      component="img"
      height="280"
      image={imageUrl}
      alt={product.name}
      sx={{
        objectFit: "cover",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
      }}
    />

    {/* 📄 Product Details */}
    <CardContent>
      <Typography variant="h6" fontWeight="bold" color="text.primary">
        {product.name}
      </Typography>
      <Typography variant="subtitle1" color="secondary">
        ₹{product.price}
      </Typography>
    </CardContent>
  </Card>
</Grid>

                  );
                })}
              </Grid>

              {/* ✅ Pagination */}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} color="primary" />
              </Box>
            </>
          )}
        </Grid>
      </Grid>

      <Snackbar
  open={snackbar.open}
  autoHideDuration={3000}
  onClose={handleSnackbarClose}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
  <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
    {snackbar.message}
  </Alert>
</Snackbar>



    </Container>
  );
};

export default ProductList;
