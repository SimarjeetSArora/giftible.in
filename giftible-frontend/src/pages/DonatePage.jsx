import React, { useEffect, useRef } from "react";
import { Container, Typography, Box } from "@mui/material";
import { useThemeContext } from "../context/ThemeContext";

const DonatePage = () => {
  const { mode } = useThemeContext();
  const formRef = useRef(null);

  useEffect(() => {
    const form = document.createElement("form");

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.setAttribute("data-payment_button_id", "pl_PzUYdCOTBR91Lz"); // Replace with your actual payment button ID
    script.async = true;

    form.appendChild(script);

    if (formRef.current) {
      formRef.current.innerHTML = ""; // Clear previous content
      formRef.current.appendChild(form); // Attach form with script
    }
  }, []);

  return (
    <Container sx={{ py: 6 }}>
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          px: { xs: 2, md: 4 },
          borderRadius: "16px",
          bgcolor: mode === "dark" ? "#2A2A2A" : "#F5F5F5",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          mb={3}
          sx={{
            color: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
            textShadow: "1px 1px 4px rgba(0, 0, 0, 0.15)",
          }}
        >
          Support a Cause That Matters
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            color: mode === "dark" ? "#A8A8A8" : "#6A4C93",
            fontWeight: "medium",
            mb: 4,
            maxWidth: "800px",
            mx: "auto",
          }}
        >
          Your contribution empowers NGOs to continue their incredible work in uplifting communities. Every donation through our platform directly benefits verified NGOs and helps sustain this initiative.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
            fontWeight: "medium",
            mb: 3,
            maxWidth: "700px",
            mx: "auto",
          }}
        >
          Whether you choose to support the platform or donate directly to NGOs, every contribution goes a long way in creating a better tomorrow. Together, we can make a difference!
        </Typography>

        {/* 🔑 Razorpay Payment Button Embedded Inside Form */}
        <Box
          ref={formRef}
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px dashed",
            borderColor: mode === "dark" ? "#A8A8A8" : "#6A4C93",
            borderRadius: "12px",
            bgcolor: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
            padding: "20px",
            minHeight: "150px",
          }}
        />
      </Box>
    </Container>
  );
};

export default DonatePage;
