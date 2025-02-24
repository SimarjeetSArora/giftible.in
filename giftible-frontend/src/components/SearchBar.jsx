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
      navigate(`search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSearch}
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: "4px",
        display: "flex",
        width: { xs: "30%", sm: "65%", md: "45%" },
        alignItems: "center",
      }}
    >
      <InputBase
        placeholder="Search Products, Categories, NGOs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ ml: 2, flex: 1, fontSize: "0.9rem", color: "#1B1B1B" }}
      />
      <IconButton type="submit" sx={{ p: 1, color: "#F5B800" }}>
        <Search />
      </IconButton>
    </Box>
  );
};

export default SearchBar;
