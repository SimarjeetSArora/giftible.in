import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Button,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { fetchNGODetails } from "../../../services/adminService";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

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

const NGODetails = () => {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();

  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  useEffect(() => {
    if (!id) {
      setSnackbar({ open: true, message: "Invalid NGO ID", severity: "error" });
      setLoading(false);
      return;
    }

    const getNGODetails = async () => {
      try {
        const data = await fetchNGODetails(id);
        setNgo(data);
      } catch (error) {
        setSnackbar({ open: true, message: error.message, severity: "error" });
      }
      setLoading(false);
    };

    getNGODetails();
  }, [id]);

  const handleEdit = () => navigate(`/admin/edit/ngo/${id}`);

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;
  if (!ngo) return <Typography align="center" mt={5}>NGO Not Found</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <StyledCard>
        <CardContent>
          {/* ✅ NGO Name */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              color: theme.palette.mode === "dark" ? "#F5B800" : "#6A4C93",
              textTransform: "uppercase",
            }}
          >
            {ngo.ngo_name}
          </Typography>

          <Divider sx={{ my: 2, backgroundColor: "#6A4C93" }} />

          {/* ✅ NGO Logo Centered */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CardMedia
              component="img"
              height="180"
              image={ngo.logo}
              alt="NGO Logo"
              sx={{ borderRadius: "8px", width: "200px", height: "200px" }}
            />
          </Box>

          <Divider sx={{ my: 3, backgroundColor: "#F5B800" }} />

          {/* ✅ User Details */}
          <Typography variant="h5" sx={{ color: "#F5B800", fontWeight: "bold" }}>User Details</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}><SectionTitle>First Name:</SectionTitle><HighlightText>{ngo.first_name}</HighlightText></Grid>
            <Grid item xs={6}><SectionTitle>Last Name:</SectionTitle><HighlightText>{ngo.last_name}</HighlightText></Grid>
            <Grid item xs={6}><SectionTitle>Email:</SectionTitle><HighlightText>{ngo.email}</HighlightText></Grid>
            <Grid item xs={6}><SectionTitle>Contact Number:</SectionTitle><HighlightText>{ngo.contact_number}</HighlightText></Grid>
          </Grid>

          <Divider sx={{ my: 2, backgroundColor: "#6A4C93" }} />

          {/* ✅ NGO Information */}
          <Typography variant="h5" sx={{ color: "#F5B800", fontWeight: "bold" }}>NGO Details</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}><SectionTitle>City:</SectionTitle><HighlightText>{ngo.city}</HighlightText></Grid>
            <Grid item xs={6}><SectionTitle>State:</SectionTitle><HighlightText>{ngo.state}</HighlightText></Grid>
            <Grid item xs={6}><SectionTitle>Pincode:</SectionTitle><HighlightText>{ngo.pincode}</HighlightText></Grid>
            <Grid item xs={12}><SectionTitle>Address:</SectionTitle><HighlightText>{ngo.address}</HighlightText></Grid>
          </Grid>

          <Divider sx={{ my: 2, backgroundColor: "#F5B800" }} />

          {/* ✅ Account Details */}
          <Typography variant="h5" sx={{ color: "#F5B800", fontWeight: "bold" }}>Account Details</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}><SectionTitle>Account Holder:</SectionTitle><HighlightText>{ngo.account_holder_name}</HighlightText></Grid>
            <Grid item xs={6}><SectionTitle>Account Number:</SectionTitle><HighlightText>{ngo.account_number}</HighlightText></Grid>
            <Grid item xs={6}><SectionTitle>IFSC Code:</SectionTitle><HighlightText>{ngo.ifsc_code}</HighlightText></Grid>
          </Grid>

          <Divider sx={{ my: 2, backgroundColor: "#F5B800" }} />

          {/* ✅ Edit Button Only (Delete Removed) */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            

            <Button
              variant="contained"
              sx={{ background: "#6A4C93", color: "#FFFFFF", mr: 2 }}
              href={ngo.license}
              target="_blank"
            >
              <VisibilityIcon sx={{ mr: 1 }} /> View License
            </Button>

            <Button variant="contained" sx={{ background: "#F5B800", color: "#6A4C93" }} onClick={handleEdit}>
              <EditIcon sx={{ mr: 1 }} /> Edit
            </Button>

          </Box>
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default NGODetails;
