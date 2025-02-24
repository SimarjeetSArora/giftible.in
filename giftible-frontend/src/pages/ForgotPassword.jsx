import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import API_BASE_URL from "../config";
import { useThemeContext } from "../context/ThemeContext";

function ForgotPassword() {
  const { mode } = useThemeContext();
  const [contactNumber, setContactNumber] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const colors = {
    textPrimary: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
    cardBg: mode === "dark" ? "#292929" : "#FFFFFF",
    accent: "#F5B800",
    borderColor: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(`${API_BASE_URL}/forgot-password`, {
        contact_number: contactNumber,
      });

      setSnackbar({
        open: true,
        message: data.message || "Reset instructions sent!",
        severity: "success",
      });
      setContactNumber("");
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to send reset instructions.",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={4}
        sx={{
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 },
          borderRadius: "16px",
          bgcolor: colors.cardBg,
          boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box textAlign="center" mb={3}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: colors.textPrimary,
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.15)",
            }}
          >
            Forgot Password?
          </Typography>
          <Typography variant="subtitle1" sx={{ color: colors.borderColor, mt: 1 }}>
            Enter your registered contact number to reset your password.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Contact Number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: "12px" },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: "bold",
              fontSize: "1rem",
              bgcolor: colors.accent,
              color: "#1B1B1B",
              borderRadius: "30px",
              "&:hover": {
                bgcolor: "#E0A700",
                transform: "scale(1.03)",
                transition: "all 0.3s ease",
              },
            }}
          >
            Send Reset Link
          </Button>
        </form>
      </Paper>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%", fontWeight: "bold" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ForgotPassword;
