import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button } from "@mui/material";
import { getAllProducts } from "../../services/productService";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      setMessage(err);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom mt={4}>
        Browse Products
      </Typography>
      {message && <Typography color="error">{message}</Typography>}

      {products.length === 0 ? (
        <Typography>No products available.</Typography>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                {product.images?.length > 0 && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={`${API_BASE_URL}/${product.images[0]?.image_url}`}
                    alt={product.name}
                  />
                )}
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="subtitle1">Price: ₹{product.price}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {product.description.slice(0, 50)}...
                  </Typography>
                </CardContent>
                <Button variant="contained" fullWidth onClick={() => navigate(`/products/${product.id}`)}>
                  View Details
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default ProductList;
