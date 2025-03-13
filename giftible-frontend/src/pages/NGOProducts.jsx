import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Grid, Typography, Card, CardContent, CardMedia, Box } from "@mui/material";
import { fetchProductsByUser } from "../services/ngoService";
import API_BASE_URL from "../config";

const placeholderImage = "https://via.placeholder.com/150";

const NGOProducts = () => {
  // ✅ Get Universal User ID from localStorage instead of useParams()
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const universalUserId = storedUser?.id;

  const [products, setProducts] = useState([]);
  const [ngoDetails, setNgoDetails] = useState({ name: "", universal_user_id: "" });

  useEffect(() => {
    const loadProducts = async () => {
      if (!universalUserId) {
        console.error("❌ Universal User ID is missing");
        return;
      }

      try {
        console.log("📡 Fetching products for Universal User ID:", universalUserId); // 🔍 Debugging
        const data = await fetchProductsByUser(universalUserId);
        console.log("✅ API Response:", data);

        if (data?.ngo) {
          setNgoDetails({
            name: data.ngo.ngo_name || "Unknown NGO",
            universal_user_id: data.ngo.universal_user_id,
          });
        }

        setProducts(data.products || []);
      } catch (error) {
        console.error("🚨 Failed to fetch products:", error);
      }
    };

    loadProducts();
  }, [universalUserId]); // ✅ Re-fetch if the user ID changes

  return (
    <Container sx={{ py: 6 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h4" fontWeight="bold">
          Products by {ngoDetails.name}
        </Typography>
      </Box>

      {products.length === 0 ? (
        <Typography textAlign="center">No products found for this NGO.</Typography>
      ) : (
        <Grid container spacing={4}>
          {products.map(({ id, name, price, images }) => {
            const imageUrl = images?.length > 0 ? `${API_BASE_URL}/${images[0].image_url}` : placeholderImage;

            return (
              <Grid item xs={12} sm={6} md={3} key={id}>
                <Link to={`/products/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <Card
                    sx={{
                      textAlign: "center",
                      height: "100%",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                      borderRadius: "12px",
                      transition: "transform 0.2s ease",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="150"
                      image={imageUrl}
                      alt={name}
                      sx={{ objectFit: "cover", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}
                    />
                    <CardContent>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        noWrap
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {name}
                      </Typography>
                      <Typography variant="subtitle1" color="secondary.main">
                        ₹{price}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default NGOProducts;
