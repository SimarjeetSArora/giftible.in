import React, { useState } from "react";
import { Box, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye"; // ✅ Alternative for Grayscale
import ContrastIcon from "@mui/icons-material/Contrast";
import InvertColorsIcon from "@mui/icons-material/InvertColors";

const ColorBlindModeProvider = () => {
  const [mode, setMode] = useState("normal");

  const applyFilter = (filter, mode) => {
    document.documentElement.style.filter = filter;
    setMode(mode);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 80,
        right: 20,
        background: "#6A4C93",
        color: "#FFFFFF",
        padding: "6px 8px",
        borderRadius: "8px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        gap: 1,
        zIndex: 1000,
      }}
    >
     

      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(event, newMode) => {
          if (!newMode) return;
          switch (newMode) {
            case "normal":
              applyFilter("none", "normal");
              break;
            case "grayscale":
              applyFilter("grayscale(100%)", "grayscale");
              break;
            case "high-contrast":
              applyFilter("contrast(150%)", "high-contrast");
              break;
            case "invert":
              applyFilter("invert(100%)", "invert");
              break;
            default:
              break;
          }
        }}
        sx={{
          "& .MuiToggleButton-root": {
            color: "#FFFFFF",
            border: "none",
            "&.Mui-selected": {
              backgroundColor: "#F5B800",
              color: "#1B1B1B",
            },
          },
        }}
      >
        <ToggleButton value="normal" aria-label="Normal">
          <VisibilityIcon />
        </ToggleButton>
        <ToggleButton value="grayscale" aria-label="Grayscale">
          <RemoveRedEyeIcon /> {/* ✅ Fixed */}
        </ToggleButton>
        <ToggleButton value="high-contrast" aria-label="High Contrast">
          <ContrastIcon />
        </ToggleButton>
        <ToggleButton value="invert" aria-label="Invert Colors">
          <InvertColorsIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default ColorBlindModeProvider;
