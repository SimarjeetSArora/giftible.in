import { useState, useEffect } from "react";
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
import axiosInstance from "../services/axiosInstance";
import API_BASE_URL from "../config";
import { useThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { mode } = useThemeContext();
  const { setAuthRole } = useAuth();
  const navigate = useNavigate();

  const [contactNumber, setContactNumber] = useState(localStorage.getItem("rememberedContact") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem("rememberedContact"));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const colors = {
    textPrimary: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
    background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
    cardBg: mode === "dark" ? "#292929" : "#FFFFFF",
    accent: "#F5B800",
    borderColor: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  };

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}"); 
      const storedRole = sessionStorage.getItem("authRole");
  
      // ✅ Prevent redirection if user is not logged in (no valid user data)
      if (!storedUser.id || !storedRole) {
        console.log("🔒 User is not logged in. Staying on login page.");
        return; 
      }
  
      let targetPath = "/"; // Default landing page for users without a dashboard
  
      if (storedRole === "admin") {
        targetPath = "/dashboard/admin"; 
      } else if (storedRole === "ngo") {
        targetPath = "/dashboard/ngo"; 
      }
  
      if (window.location.pathname !== targetPath) {
        console.log("🔄 Redirecting existing user to:", targetPath);
        setTimeout(() => navigate(targetPath, { replace: true }), 500);
      }
    } catch (error) {
      console.error("Error parsing localStorage user data:", error);
    }
  }, [navigate]);
  
  
  
  

  const navigateToDashboard = (role) => {
    console.log("🔄 Navigating user to dashboard. Role:", role);
  
    let targetPath = "/"; // Default landing page for users without a dashboard
  
    if (role === "admin") {
      targetPath = "/dashboard/admin"; 
    } else if (role === "ngo") {
      targetPath = "/dashboard/ngo"; 
    } else if (role === "user") {
      targetPath = "/"; 
    }
  
    console.log("🚀 Redirecting to:", targetPath);
    navigate(targetPath, { replace: true });
  };
  

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
  
    try {
      const { data } = await axiosInstance.post(`${API_BASE_URL}/token`, new URLSearchParams({
        username: contactNumber,
        password,
      }), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
  
      const { access_token, refresh_token, role, id, first_name, last_name } = data;
  
      console.log("✅ Login success:", data);
  
      // ✅ Store credentials properly
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify({ id, role, first_name, last_name }));
  
      // ✅ Ensure sessionStorage is properly set before redirecting
      sessionStorage.setItem("authRole", role); 
      setAuthRole(role);
      console.log("🔐 Auth role set to:", role);
  
      if (rememberMe) {
        localStorage.setItem("rememberedContact", contactNumber);
      } else {
        localStorage.removeItem("rememberedContact");
      }
  
      // ✅ Delay redirection to prevent race conditions
      setTimeout(() => {
        navigateToDashboard(role);
      }, 500);
    } catch (err) {
      console.error("❌ Login error:", err.response?.data?.detail || "An unexpected error occurred.");
      console.log("⚠️ Full error:", err);
      setError(err.response?.data?.detail || "An unexpected error occurred.");
    }
  };
  
  
  

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={4} sx={{ px: { xs: 3, md: 6 }, py: { xs: 4, md: 6 }, borderRadius: "16px", bgcolor: colors.cardBg }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: colors.textPrimary }}>
            Welcome Back!
          </Typography>
          <Typography variant="subtitle1" sx={{ color: colors.borderColor, mt: 1 }}>
            Please log in to continue.
          </Typography>
        </Box>

        {error && <Typography color="error" textAlign="center" mb={2} fontWeight="bold">{error}</Typography>}

        <form onSubmit={handleLogin}>
          <TextField label="Contact Number" fullWidth margin="normal" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
          <TextField label="Password" type={showPassword ? "text" : "password"} fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Toggle password visibility" // ✅ Improves accessibility
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <FormControlLabel control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />} label="Remember Me" />
            <Typography component={Link} to="/forgot-password" sx={{ color: colors.accent, fontWeight: "bold" }}>
              Forgot Password?
            </Typography>
          </Box>
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1.5, fontWeight: "bold", bgcolor: colors.accent }}>
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Login;
