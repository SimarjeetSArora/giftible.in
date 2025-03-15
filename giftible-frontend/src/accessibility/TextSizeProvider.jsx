import React, { useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const TextSizeProvider = () => {
  const [textSize, setTextSize] = useState(100); // Default 100%

  const increaseTextSize = () => {
    if (textSize < 150) {
      setTextSize(textSize + 10);
      document.body.style.fontSize = `${textSize + 10}%`;
    }
  };

  const decreaseTextSize = () => {
    if (textSize > 80) {
      setTextSize(textSize - 10);
      document.body.style.fontSize = `${textSize - 10}%`;
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 80, // Adjusted for better positioning
        left: 10,
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        gap: 1,
        backgroundColor: "#6A4C93",
        borderRadius: "8px",
        boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Tooltip title="Decrease Text Size">
        <IconButton
          onClick={decreaseTextSize}
          sx={{
            color: "#F5B800",
            "&:hover": { color: "#FFD700", transform: "scale(1.1)" },
          }}
        >
          <RemoveCircleOutlineIcon fontSize="large" />
        </IconButton>
      </Tooltip>

      <Typography sx={{ color: "#FFFFFF", fontSize: "1rem", fontWeight: "bold" }}>
        {textSize}%
      </Typography>

      <Tooltip title="Increase Text Size">
        <IconButton
          onClick={increaseTextSize}
          sx={{
            color: "#F5B800",
            "&:hover": { color: "#FFD700", transform: "scale(1.1)" },
          }}
        >
          <AddCircleOutlineIcon fontSize="large" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default TextSizeProvider;
