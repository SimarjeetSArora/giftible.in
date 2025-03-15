import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import API_BASE_URL from "../config";
import { useThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Profile = () => {
  const { mode } = useThemeContext();
  const { authRole } = useAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // 🌈 Theme Colors
  const colors = {
    textPrimary: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
    cardBg: mode === "dark" ? "#292929" : "#FFFFFF",
    borderColor: mode === "dark" ? "#A8A8A8" : "#6A4C93",
    accent: "#F5B800",
  };

  // 🔄 Fetch Profile Data
  useEffect(() => {
    axiosInstance
      .get(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      })
      .then((response) => {
        setUser(response.data);
        setFormData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load profile. Please try again.");
        setLoading(false);
      });
  }, []);

  // ✏️ Handle Edit Profile
  const handleEditProfile = async () => {
    try {
      // ✅ Validate Email Format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        setSnackbar({ open: true, message: "❌ Invalid email format.", severity: "error" });
        return;
      }
  
      // ✅ Validate Contact Number Format (Only Digits, Length 10)
      const contactRegex = /^[0-9]{10}$/;
      if (formData.contact_number && !contactRegex.test(formData.contact_number)) {
        setSnackbar({ open: true, message: "❌ Contact number must be 10 digits.", severity: "error" });
        return;
      }
  
      // ✅ Make API Request
      await axiosInstance.put(`${API_BASE_URL}/user/profile/edit`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
  
      setUser(formData);
      setEditDialogOpen(false);
      setSnackbar({ open: true, message: "✅ Profile updated successfully!", severity: "success" });
  
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      const errorMessage = error.response?.data?.detail || "❌ Failed to update profile.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };
  

  // ❌ Handle Delete Profile
  const handleDeleteProfile = async () => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/user/profile/delete`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      localStorage.clear();
      setSnackbar({ open: true, message: "✅ Profile deleted successfully!", severity: "success" });
      setTimeout(() => navigate("/login"), 2000); // Redirect to login after 2 seconds
    } catch (error) {
      console.error("Error deleting profile:", error);
      setSnackbar({ open: true, message: "❌ Failed to delete profile.", severity: "error" });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, bgcolor: colors.cardBg }}>
          {/* Profile Avatar */}
          <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
            <Avatar sx={{ width: 90, height: 90, bgcolor: colors.accent }} alt={user.first_name}>
              {user.first_name.charAt(0)}
            </Avatar>
          </Box>

          {/* User Details */}
          <Typography variant="h5" align="center" fontWeight="bold" color={colors.textPrimary} gutterBottom>
            {user.first_name} {user.last_name}
          </Typography>

          <Grid container spacing={2}>
            {/* Email */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <EmailIcon color="primary" />
                <Typography variant="body1" color={colors.textPrimary}>{user.email}</Typography>
              </Box>
            </Grid>

            {/* Contact Number */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <PhoneIcon color="primary" />
                <Typography variant="body1" color={colors.textPrimary}>{user.contact_number}</Typography>
              </Box>
            </Grid>

            {/* Account Creation Date */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarTodayIcon color="primary" />
                <Typography variant="body2" color={colors.borderColor}>
                  Joined on {new Date(user.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Edit & Delete Buttons */}
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={() => setEditDialogOpen(true)}>
              Edit Profile
            </Button>
            <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteDialogOpen(true)}>
              Delete Profile
            </Button>
          </Box>
        </Paper>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="First Name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} margin="normal" />
          <TextField fullWidth label="Last Name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} margin="normal" />
          <TextField fullWidth label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} margin="normal" />
          <TextField fullWidth label="Contact Number" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditProfile} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Profile Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Profile</DialogTitle>
        <DialogContent>
          <Typography color="error">⚠️ This action cannot be undone!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProfile} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} severity={snackbar.severity} />
    </Container>
  );
};

export default Profile;
