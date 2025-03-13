// src/pages/AllNGOs.jsx
import React, { useEffect, useState } from "react";
import { Container, Grid, Typography, Box, Avatar, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { fetchAllNGOs } from "../services/ngoService";
import API_BASE_URL from "../config";

const placeholderImage = "https://via.placeholder.com/150";

const AllNGOs = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNGOs = async () => {
      try {
        setLoading(true);
        const data = await fetchAllNGOs(); // ✅ Expected response: [{ id, ngo_name, logo }]
        setNgos(data || []);
      } catch (error) {
        console.error("Failed to fetch NGOs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNGOs();
  }, []);

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
        All NGOs
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <CircularProgress />
          <Typography variant="h6" mt={2}>Loading NGOs...</Typography>
        </Box>
      ) : ngos.length === 0 ? (
        <Typography textAlign="center">No NGOs found.</Typography>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {ngos.map(({ id, ngo_name, logo }) => {
            const imageUrl = logo ? `${API_BASE_URL}/${logo}` : placeholderImage;

            return (
              <Grid item xs={6} sm={4} md={3} key={id} sx={{ textAlign: "center" }}>
                <Link to={`/ngos/${id}/products`} style={{ textDecoration: "none", color: "inherit" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  >
                    <Avatar
                      src={imageUrl}
                      alt={ngo_name}
                      sx={{
                        width: 100,
                        height: 100,
                        mb: 1,
                        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.15)",
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
                  </Box>
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
