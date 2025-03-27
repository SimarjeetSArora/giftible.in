import React, { useState } from "react";
import DefaultFooter from "./DefaultFooter";
import NGOFooter from "./NGOFooter";
import AdminFooter from "./AdminFooter";
import ColorBlindModeProvider from "../../accessibility/ColorBlindModeProvider";
import TextSizeProvider from "../../accessibility/TextSizeProvider";
import GoogleTranslate from "../../accessibility/GoogleTranslate";
import { useAuth } from "../../context/AuthContext";
import { Box, IconButton, Paper } from "@mui/material";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import GTranslateIcon from "@mui/icons-material/GTranslate";

const Footer = () => {
  const { authRole } = useAuth();
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);

  return (
    <>
      {/* Select Footer Based on Role */}
      {authRole === "ngo" ? <NGOFooter /> : authRole === "admin" ? <AdminFooter /> : <DefaultFooter />}

      {/* ✅ Accessibility Toggle Button */}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <IconButton
          onClick={() => setAccessibilityEnabled((prev) => !prev)}
          sx={{
            backgroundColor: "#6A4C93",
            color: "#FFFFFF",
            width: 50,
            height: 50,
            borderRadius: "50%",
            "&:hover": { backgroundColor: "#5A3B7E" },
          }}
        >
          <AccessibilityIcon fontSize="large" />
        </IconButton>

        {/* ✅ Show Accessibility Controls ONLY if Enabled */}
        {accessibilityEnabled && (
          <Paper
            sx={{
              position: "absolute",
              bottom: 182,
              right: 1,
              p: 2,
              borderRadius: 2,
              boxShadow: 3,
              bgcolor: "#6A4C93",
            }}
          >
            <ColorBlindModeProvider />
            <TextSizeProvider />

            {/* ✅ Google Translate Integration */}
            <Box mt={2} display="flex" justifyContent="center" >
              <IconButton
                sx={{
                  backgroundColor: "#F5B800",
                  color: "#1B1B1B",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  "&:hover": { backgroundColor: "#FFD700" },
                }}
              >
                <GTranslateIcon fontSize="medium" />
              </IconButton>
            </Box>
            <GoogleTranslate />
          </Paper>
        )}
      </Box>
    </>
  );
};

export default Footer;