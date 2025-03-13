import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Button,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { fetchUserDetails } from "../../../services/adminService";
import EditIcon from "@mui/icons-material/Edit";

// ✅ Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === "dark" ? "#292929" : "#FFFFFF",
  color: theme.palette.mode === "dark" ? "#FFFFFF" : "#1B1B1B",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  padding: "20px",
  borderRadius: "12px",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "18px",
  fontWeight: "bold",
  color: theme.palette.mode === "dark" ? "#F5B800" : "#6A4C93",
  marginBottom: "8px",
}));

const HighlightText = styled(Typography)(({ theme }) => ({
  fontSize: "16px",
  fontWeight: "600",
  color: theme.palette.mode === "dark" ? "#FFFFFF" : "#1B1B1B",
}));

const UserDetails = () => {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  useEffect(() => {
    if (!id) {
      setSnackbar({ open: true, message: "Invalid User ID", severity: "error" });
      setLoading(false);
      return;
    }

    const getUserDetails = async () => {
      try {
        const data = await fetchUserDetails(id);
        setUser(data);
      } catch (error) {
        setSnackbar({ open: true, message: error.message, severity: "error" });
      }
      setLoading(false);
    };

    getUserDetails();
  }, [id]);

  const handleEdit = () => navigate(`/admin/edit/user/${id}`);

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;
  if (!user) return <Typography align="center" mt={5}>User Not Found</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <StyledCard>
        <CardContent>
          {/* ✅ User Full Name */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              color: theme.palette.mode === "dark" ? "#F5B800" : "#6A4C93",
              textTransform: "uppercase",
            }}
          >
            {user.first_name} {user.last_name}
          </Typography>

          <Divider sx={{ my: 2, backgroundColor: "#6A4C93" }} />

          {/* ✅ User Details */}
          <Typography variant="h5" sx={{ color: "#F5B800", fontWeight: "bold" }}>
            User Details
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}><SectionTitle>First Name:</SectionTitle><HighlightText>{user.first_name}</HighlightText></Grid>
            <Grid item xs={6}><SectionTitle>Last Name:</SectionTitle><HighlightText>{user.last_name}</HighlightText></Grid>
            <Grid item xs={6}><SectionTitle>Email:</SectionTitle><HighlightText>{user.email}</HighlightText></Grid>
            <Grid item xs={6}><SectionTitle>Contact Number:</SectionTitle><HighlightText>{user.contact_number}</HighlightText></Grid>
            <Grid item xs={6}><SectionTitle>Email Verified:</SectionTitle>
              <HighlightText>{user.email_verified ? "✅ Yes" : "❌ No"}</HighlightText>
            </Grid>
            <Grid item xs={6}><SectionTitle>Contact Verified:</SectionTitle>
              <HighlightText>{user.contact_verified ? "✅ Yes" : "❌ No"}</HighlightText>
            </Grid>
            <Grid item xs={6}>
  <SectionTitle>Created At:</SectionTitle>
  <HighlightText>
    {user.created_at ? user.created_at.split("T")[0] : "N/A"}
  </HighlightText>
</Grid>

          </Grid>

         

          {/* ✅ Edit Button */}
          
        </CardContent>
      </StyledCard>

      {/* ✅ Snackbar Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserDetails;
