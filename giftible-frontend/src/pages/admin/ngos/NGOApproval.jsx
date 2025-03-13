import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { fetchPendingNGOs, approveNGO, rejectNGO } from "../../../services/adminService";
import API_BASE_URL from "../../../config";

const REJECTION_REASONS = [
  "Same NGO already exists",
  "NGO license not valid",
  "Incomplete or incorrect information",
  "Suspicious activity detected",
];




// 🎨 Styled Components
const TableContainer = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === "dark" ? "#292929" : "#FFFFFF",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  fontWeight: "bold",
  textTransform: "none",
  padding: "8px 15px",
}));

const NGOApproval = () => {
  const theme = useTheme();
  const colors = {
    background: theme.palette.mode === "dark" ? "#1B1B1B" : "#FFFFFF",
    text: theme.palette.mode === "dark" ? "#FFFFFF" : "#1B1B1B",
    accent: "#F5B800",
    secondary: theme.palette.mode === "dark" ? "#A8A8A8" : "#6A4C93",
    tableHeader: "#6A4C93",
    buttonApprove: "#F5B800",
    buttonReject: "#F44336",
  };

  const [ngos, setNgos] = useState([]);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  useEffect(() => {
    loadPendingNGOs();
  }, []);

  const loadPendingNGOs = async () => {
    try {
      const data = await fetchPendingNGOs();
      setNgos(data);
    } catch (error) {
      setNgos([]);
      setSnackbar({ open: true, message: "Error fetching NGOs.", severity: "error" });
    }
  };

  const handleApprove = async (ngoId) => {
    try {
      await approveNGO(ngoId);
      setSnackbar({ open: true, message: "✅ NGO Approved Successfully!", severity: "success" });
      loadPendingNGOs();
    } catch {
      setSnackbar({ open: true, message: "Error approving NGO. Please try again.", severity: "error" });
    }
  };

  const handleRejectClick = (ngo) => {
    setSelectedNGO(ngo);
    setDialogOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason) {
      setSnackbar({ open: true, message: "⚠️ Please select a rejection reason.", severity: "warning" });
      return;
    }

    try {
      await rejectNGO(selectedNGO.id, rejectionReason);
      setSnackbar({ open: true, message: `🚫 NGO '${selectedNGO.ngo_name}' rejected successfully!`, severity: "success" });
      setDialogOpen(false);
      setRejectionReason("");
      loadPendingNGOs();
    } catch {
      setSnackbar({ open: true, message: "Error rejecting NGO. Please try again.", severity: "error" });
    }
  };

  return (
    <Box sx={{ background: colors.background, minHeight: "100vh", padding: "30px" }}>
      <Typography variant="h4" sx={{ color: colors.text, mb: 2, fontWeight: "bold" }}>
        Approve NGOs
      </Typography>

      <TableContainer component={Paper} sx={{ background: colors.cardBackground }}>
        <Table>
        <TableHead sx={{ background: colors.tableHeader }}>
            <TableRow>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>ID</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>NGO Name</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Contact</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Address</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>License</TableCell>
              <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ngos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No pending NGOs.
                </TableCell>
              </TableRow>
            ) : (
              ngos.map((ngo) => (
                <TableRow key={ngo.id}>
                  <TableCell>{ngo.id}</TableCell>
                  <TableCell>{ngo.ngo_name}</TableCell>
                  <TableCell>{ngo.email}</TableCell>
                  <TableCell>{ngo.contact_number}</TableCell>
                  <TableCell>{ngo.address}, {ngo.city}, {ngo.state}, {ngo.pincode}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => window.open(`${API_BASE_URL}${ngo.license}`, "_blank")}
                      sx={{ color: colors.accent, borderColor: colors.accent }}
                    >
                      View License
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Grid container spacing={1}>
                      <Grid item>
                        <StyledButton onClick={() => handleApprove(ngo.id)} sx={{ background: colors.buttonApprove, color: "#6A4C93" }}>
                          Approve
                        </StyledButton>
                      </Grid>
                      <Grid item>
                        <StyledButton onClick={() => handleRejectClick(ngo)} sx={{ background: colors.buttonReject, color: "#FFFFFF" }}>
                          Reject
                        </StyledButton>
                      </Grid>
                    </Grid>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reject NGO Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Reject NGO - {selectedNGO?.ngo_name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Rejection Reason</InputLabel>
            <Select value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}>
              {REJECTION_REASONS.map((reason, index) => (
                <MenuItem key={index} value={reason}>{reason}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleRejectSubmit} sx={{ background: colors.buttonReject, color: "#FFFFFF" }}>
            Reject NGO
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default NGOApproval;
