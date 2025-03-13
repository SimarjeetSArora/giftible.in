import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

const NotFound = () => {
  const navigate = useNavigate();

  // Redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        bgcolor: "#6A4C93",
        color: "#FFFFFF",
      }}
    >
      <Typography variant="h1" fontWeight="bold">
        404
      </Typography>
      <Typography variant="h5" sx={{ mt: 2, mb: 3 }}>
        Oops! Page Not Found.
      </Typography>
      <Typography variant="body1" sx={{ opacity: 0.8 }}>
        Redirecting to homepage in 5 seconds...
      </Typography>
      <Button
        variant="contained"
        sx={{
          mt: 3,
          bgcolor: "#F5B800",
          color: "#1B1B1B",
          fontWeight: "bold",
          "&:hover": { bgcolor: "#FFD700" },
        }}
        onClick={() => navigate("/")}
      >
        Go to Home
      </Button>
    </Box>
  );
};

export default NotFound;
