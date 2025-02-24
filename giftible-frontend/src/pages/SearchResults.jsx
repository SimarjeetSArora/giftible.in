import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Chip, Paper } from "@mui/material";
import API_BASE_URL from "../config";
import axios from "axios";

const SearchResults = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(search).get("q");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setLoading(true);

      axios
        .get(`${API_BASE_URL}/api/search`, { params: { q: query } })
        .then((res) => {
          setResults(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [query]);

  const handleClick = (item) => {
    if (item.type === "Product") {
      navigate(`/products/${item.id}`);
    } else if (item.type === "Category") {
      navigate(`/categories/${item.id}/products`);
    } else if (item.type === "NGO") {
      navigate(`/ngos/${item.id}/products`);
    }
  };

  const getColorByType = (type) => {
    switch (type) {
      case "Product":
        return "#F5B800"; // Golden Yellow
      case "Category":
        return "#6A4C93"; // Royal Purple
      case "NGO":
        return "#1B1B1B"; // Jet Black
      default:
        return "#A8A8A8"; // Light Grey
    }
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#1B1B1B" }}>
        Search Results for: <span style={{ color: "#6A4C93" }}>"{query}"</span>
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : results.length ? (
        results.map((item, index) => (
          <Paper
            key={index}
            elevation={4}
            onClick={() => handleClick(item)}
            sx={{
              padding: "16px",
              mb: 2,
              borderRadius: "12px",
              border: `2px solid ${getColorByType(item.type)}`,
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1B1B1B" }}>
                {item.name}
              </Typography>
              <Chip
                label={item.type}
                sx={{
                  backgroundColor: getColorByType(item.type),
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: "#6A4C93" }}>
              {item.description}
            </Typography>
          </Paper>
        ))
      ) : (
        <Typography sx={{ mt: 2, color: "#1B1B1B" }}>No results found.</Typography>
      )}
    </Box>
  );
};

export default SearchResults;
