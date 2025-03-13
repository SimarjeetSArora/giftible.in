import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Paper,
  Snackbar,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axiosInstance from "../../services/axiosInstance";
import API_BASE_URL from "../../config";
import { useThemeContext } from "../../context/ThemeContext";

function AdminRegister() {
  const { mode } = useThemeContext();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post(`${API_BASE_URL}/register/admin`, formData);
      setSnackbar({ open: true, message: "✅ Admin registered successfully!", severity: "success" });
      setFormData({ first_name: "", last_name: "", email: "", contact_number: "", password: "" });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "❌ Registration failed.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
        sx={{ mb: 3, color: theme.palette.text.primary }}
      >
        Admin Registration
      </Typography>

      <Paper elevation={6} sx={{ p: 4, borderRadius: "16px", bgcolor: theme.palette.background.paper }}>
        <form onSubmit={handleSubmit}>
          <TextField name="first_name" label="First Name" value={formData.first_name} onChange={handleChange} fullWidth margin="normal" required />
          <TextField name="last_name" label="Last Name" value={formData.last_name} onChange={handleChange} fullWidth margin="normal" required />
          <TextField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} fullWidth margin="normal" required />
          <TextField name="contact_number" label="Contact Number" value={formData.contact_number} onChange={handleChange} fullWidth margin="normal" required />

          <TextField
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            variant="contained"
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: "bold",
              fontSize: "1rem",
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              borderRadius: "30px",
              "&:hover": { bgcolor: "#E0A700", transform: "scale(1.03)", transition: "all 0.3s ease" },
            }}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Container>
  );
}

export default AdminRegister;
