import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useThemeContext } from "../context/ThemeContext";
import API_BASE_URL from "../config";

const ResetPassword = () => {
  const { mode } = useThemeContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const colors = {
    textPrimary: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
    background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
    cardBg: mode === "dark" ? "#292929" : "#FFFFFF",
    accent: "#F5B800",
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setSnackbar({ open: true, message: "Passwords do not match.", severity: "error" });
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/reset-password`, { token, new_password: password });
      setSnackbar({ open: true, message: "Password reset successful! Redirecting...", severity: "success" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Password reset failed:", err.response?.data || err);
      setSnackbar({ open: true, message: "Failed to reset password. Please try again.", severity: "error" });
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
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={2}
          sx={{
            color: colors.textPrimary,
            textShadow: "1px 1px 4px rgba(0, 0, 0, 0.15)",
          }}
        >
          Reset Your Password
        </Typography>
        <Typography variant="subtitle1" textAlign="center" mb={4} sx={{ color: colors.textPrimary }}>
          Enter your new password below.
        </Typography>

        <form onSubmit={handleResetPassword}>
          <TextField
            label="New Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />

          <TextField
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            required
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
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
            Reset Password
          </Button>
        </form>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ResetPassword;
