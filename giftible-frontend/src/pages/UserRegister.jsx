import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Paper,
  InputAdornment,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import API_BASE_URL from "../config";
import { useThemeContext } from "../context/ThemeContext";

// Regex Validations
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const contactRegex = /^[6-9]\d{9}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function UserRegister() {
  const { mode } = useThemeContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // Strength Meter (0-100)

  const colors = {
    textPrimary: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
    background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
    cardBg: mode === "dark" ? "#292929" : "#FFFFFF",
    accent: "#F5B800",
    borderColor: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Update Password Strength Meter
    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value)) strength += 25;
      if (/[@$!%*?&]/.test(value)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.contact_number || !formData.password || !formData.confirmPassword) {
      return setError("All fields are required!");
    }

    if (!emailRegex.test(formData.email)) {
      return setError("Invalid email format.");
    }

    if (!contactRegex.test(formData.contact_number)) {
      return setError("Invalid contact number. Must be 10 digits.");
    }

    if (!passwordRegex.test(formData.password)) {
      return setError("Password must be at least 8 characters, include an uppercase letter, a number, and a special character.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/register/user`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      alert("User registered successfully!");
      navigate("/login");

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        contact_number: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
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
            Create an Account
          </Typography>
          <Typography variant="subtitle1" sx={{ color: colors.borderColor, mt: 1 }}>
            Sign up to support NGOs and shop for a cause.
          </Typography>
        </Box>

        {error && (
          <Typography color="error" textAlign="center" mb={2} fontWeight="bold">
            {error}
          </Typography>
        )}

        <form onSubmit={handleRegister}>
          <TextField name="first_name" label="First Name" fullWidth margin="normal" onChange={handleChange} required />
          <TextField name="last_name" label="Last Name" fullWidth margin="normal" onChange={handleChange} required />
          <TextField name="email" label="Email" type="email" fullWidth margin="normal" onChange={handleChange} required />
          <TextField name="contact_number" label="Contact Number" fullWidth margin="normal" onChange={handleChange} required />

          {/* Password Strength Meter */}
          <LinearProgress
            variant="determinate"
            value={passwordStrength}
            sx={{
              height: "8px",
              borderRadius: "8px",
              mt: 1,
              bgcolor: "#ddd",
              "& .MuiLinearProgress-bar": {
                bgcolor: passwordStrength < 50 ? "red" : passwordStrength < 75 ? "orange" : "green",
              },
            }}
          />
          {/* Password Field */}
          <TextField
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
            />

          

          {/* Confirm Password */}
          <TextField
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
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
            Register
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default UserRegister;
