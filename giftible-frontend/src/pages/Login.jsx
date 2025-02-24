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
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import API_BASE_URL from "../config";
import { useThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";


function Login() {
  const { mode } = useThemeContext();
  const [contactNumber, setContactNumber] = useState(localStorage.getItem("rememberedContact") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem("rememberedContact"));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setAuthRole } = useAuth();

  const colors = {
    textPrimary: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
    background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
    cardBg: mode === "dark" ? "#292929" : "#FFFFFF",
    accent: "#F5B800",
    borderColor: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
  
    const loginData = new URLSearchParams();
    loginData.append("username", contactNumber);
    loginData.append("password", password);
  
    try {
      const { data } = await axios.post(`${API_BASE_URL}/token`, loginData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
  
      const { access_token, role, id } = data;
  
      // Store token and user details
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify({ id, role }));
      setAuthRole(role);

      if (rememberMe) {
        localStorage.setItem("rememberedContact", contactNumber);
      } else {
        localStorage.removeItem("rememberedContact");
      }
  
      // ✅ Redirect based on user role
      navigate(role === "admin" ? "/dashboard/admin" : role === "ngo" ? "/dashboard/ngo" : "/dashboard/user");
  
    } catch (err) {
      // ✅ Display the error detail from the backend if available, otherwise show a generic error
      const errorMessage = err.response?.data?.detail || "❌ An unexpected error occurred.";
      setError(errorMessage);
      console.error("Login error:", errorMessage);  // Log for debugging
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
            sx={{ color: colors.textPrimary, textShadow: "1px 1px 4px rgba(0, 0, 0, 0.15)" }}
          >
            Welcome Back!
          </Typography>
          <Typography variant="subtitle1" sx={{ color: colors.borderColor, mt: 1 }}>
            Please log in to continue.
          </Typography>
        </Box>

        {error && (
          <Typography color="error" textAlign="center" mb={2} fontWeight="bold">
            {error}
          </Typography>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            label="Contact Number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{ color: colors.accent, "&.Mui-checked": { color: colors.accent } }}
                />
              }
              label="Remember Me"
              sx={{ color: colors.textPrimary }}
            />
            <Typography
              component={Link}
              to="/forgot-password"
              sx={{
                color: colors.accent,
                fontWeight: "bold",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Forgot Password?
            </Typography>
          </Box>

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
              "&:hover": { bgcolor: "#E0A700", transform: "scale(1.03)", transition: "all 0.3s ease" },
            }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Login;
