import React, { useEffect, useState } from "react";
import { 
  Container, Grid, Typography, Box, Avatar, CircularProgress, Pagination
} from "@mui/material";
import { Link } from "react-router-dom";
import { fetchAllNGOs } from "../services/ngoService";
import API_BASE_URL from "../config";

const placeholderImage = "https://via.placeholder.com/150";

const AllNGOs = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalNgos, setTotalNgos] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const limit = 12; // ✅ Fetch 12 NGOs per page

  useEffect(() => {
    const loadNGOs = async () => {
      try {
        setLoading(true);
        const { ngos, total } = await fetchAllNGOs(limit, (page - 1) * limit); // ✅ Fetch with pagination

        setNgos(ngos || []);
        setTotalNgos(total || 0);
        setTotalPages(Math.ceil((total || 0) / limit)); // ✅ Fix: Properly set total pages
      } catch (error) {
        console.error("Failed to fetch NGOs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNGOs();
  }, [page]); // ✅ Fetch NGOs when the page changes

  return (
    <Container sx={{ py: 6 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        mb={4}
        sx={{ color: "primary.light" }} // 🎨 Styled header
      >
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
        <>
          <Grid container spacing={4} justifyContent="center">
            {ngos.map(({ universal_user_id, ngo_name, logo }) => {
              const imageUrl = logo
                ? `${API_BASE_URL.replace(/\/$/, "")}/${logo.replace(/^\//, "")}`
                : placeholderImage;

              return (
                <Grid item xs={6} sm={4} md={3} key={universal_user_id} sx={{ textAlign: "center" }}>
  <Link 
    to={`/products?ngo_ids=${universal_user_id}`} // ✅ Navigate to frontend route 
    style={{ textDecoration: "none", color: "inherit" }}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
        transition: "transform 0.3s ease",
        "&:hover": { transform: "scale(1.05)" },
      }}
    >
      <Avatar
        src={imageUrl}
        alt={ngo_name}
        sx={{
          width: 110,
          height: 110,
          mb: 1,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      />
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "180px",
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

          {/* 🔹 Pagination Controls */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default AllNGOs;
