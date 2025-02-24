// src/pages/AllNGOs.jsx
import React, { useEffect, useState } from "react";
import { Container, Grid, Typography, Box, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { fetchAllNGOs } from "../services/ngoService";
import API_BASE_URL from "../config";

const placeholderImage = "https://via.placeholder.com/150";

const AllNGOs = () => {
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    const loadNGOs = async () => {
      try {
        const data = await fetchAllNGOs();
        setNgos(data); // Expected response: [{ id, ngo_name, logo }]
      } catch (error) {
        console.error("Failed to fetch NGOs:", error);
      }
    };

    loadNGOs();
  }, []);

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
        All NGOs
      </Typography>

      {ngos.length === 0 ? (
        <Typography textAlign="center">No NGOs found.</Typography>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {ngos.map(({ id, ngo_name, logo }) => {
            const imageUrl = logo ? `${API_BASE_URL}/${logo}` : placeholderImage;

            return (
              <Grid item xs={6} sm={4} md={3} key={id} sx={{ textAlign: "center" }}>
                <Link to={`/ngos/${id}/products`} style={{ textDecoration: "none", color: "inherit" }}>
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={ngo_name}
                    sx={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      mb: 1,
                      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.15)",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "150px",
                      mx: "auto",
                    }}
                  >
                    {ngo_name}
                  </Typography>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default AllNGOs;
