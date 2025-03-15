import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, InputBase, IconButton } from "@mui/material";
import { Search } from "@mui/icons-material";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const searchUrl = `/products?search_query=${encodeURIComponent(query.trim())}`;
      navigate(searchUrl);
      window.location.href = searchUrl; // ✅ Forces full page reload after search
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSearch}
      sx={{
        backgroundColor: "background.paper",
        borderRadius: "8px",
        display: "flex",
        width: { xs: "80%", sm: "65%", md: "45%" },
        alignItems: "center",
        boxShadow: "0px 3px 8px rgba(0,0,0,0.1)",
        transition: "0.3s",
        "&:hover": { boxShadow: "0px 4px 12px rgba(0,0,0,0.2)" },
      }}
    >
      <InputBase
        placeholder="Search products, categories, NGOs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{
          ml: 2,
          flex: 1,
          fontSize: "1rem",
          color: "text.primary",
          "&::placeholder": { color: "text.secondary" },
        }}
      />
      <IconButton type="submit" sx={{ p: 1, color: "primary.main" }}>
        <Search />
      </IconButton>
    </Box>
  );
};

export default SearchBar;
