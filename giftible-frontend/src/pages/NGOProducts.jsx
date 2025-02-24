// src/pages/NGOProducts.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Grid, Typography, Card, CardContent, CardMedia, Box } from "@mui/material";
import { fetchProductsByNGO } from "../services/ngoService";
import API_BASE_URL from "../config";

const placeholderImage = "https://via.placeholder.com/150";

const NGOProducts = () => {
  const { id } = useParams(); // Get NGO ID from URL
  const [products, setProducts] = useState([]);
  const [ngoName, setNgoName] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { products, ngo_name } = await fetchProductsByNGO(id);
        setProducts(products);
        setNgoName(ngo_name);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    loadProducts();
  }, [id]);

  return (
    <Container sx={{ py: 6 }}>
      {/* NGO Name Header */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center">
          Products by {ngoName}
        </Typography>
      </Box>

      {/* Products Section */}
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
