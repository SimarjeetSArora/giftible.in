import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axiosInstance from "../../../services/axiosInstance";
import dayjs from "dayjs";

// ✅ Get color theme based on mode
const getColors = (mode) => ({
  background: mode === "dark" ? "#1B1B1B" : "#FFFFFF",
  text: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
  accent: "#F5B800",
  secondary: mode === "dark" ? "#A8A8A8" : "#6A4C93",
  cardBackground: mode === "dark" ? "#292929" : "#FFFFFF",
  tableHeader: "#6A4C93",
});

const PendingPayouts = () => {
  const theme = useTheme();
  const colors = getColors(theme.palette.mode);

  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    fetchPendingPayouts();
  }, []);

  // ✅ Fetch Pending Payouts
  const fetchPendingPayouts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/payouts/pending");
      setPayouts(data || []);
    } catch (error) {
      console.error("Error fetching pending payouts:", error);
      setSnackbar({ open: true, message: "Failed to fetch payouts!", severity: "error" });
    }
    setLoading(false);
  };

  // ✅ Process Payout (Approve or Reject)
  const handleProcessPayout = async (payoutId, approved) => {
    try {
      await axiosInstance.put(`/payouts/process/${payoutId}`, null, {
        params: { approved },
      });

      setSnackbar({
        open: true,
        message: `Payout ${approved ? "approved" : "rejected"} successfully!`,
        severity: approved ? "success" : "warning",
      });

      fetchPendingPayouts(); // ✅ Refresh after processing
    } catch (error) {
      console.error("Error processing payout:", error);
      setSnackbar({ open: true, message: "Failed to process payout!", severity: "error" });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ background: colors.background, minHeight: "100vh", py: 4 }}>
      <Typography variant="h4" sx={{ color: colors.text, mb: 3, fontWeight: "bold" }}>
        Pending Payouts
      </Typography>

      {/* Payouts Table */}
      {loading ? (
        <CircularProgress sx={{ color: colors.accent }} />
      ) : payouts.length > 0 ? (
        <TableContainer component={Paper} sx={{ background: colors.cardBackground }}>
          <Table>
            <TableHead sx={{ background: colors.tableHeader }}>
              <TableRow>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Payout ID</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>NGO Name</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Amount (₹)</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>Created At</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold", textAlign: "center" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payouts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ color: colors.text }}>{item.id}</TableCell>
                  <TableCell sx={{ color: colors.text, fontWeight: "bold" }}>{item.ngo_name}</TableCell>
                  <TableCell sx={{ color: colors.text }}>₹{item.amount.toLocaleString()}</TableCell>
                  <TableCell sx={{ color: colors.text }}>{dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Button
                      onClick={() => handleProcessPayout(item.id, true)}
                      sx={{ background: colors.accent, color: "#FFFFFF", mx: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleProcessPayout(item.id, false)}
                      sx={{ background: "#D32F2F", color: "#FFFFFF", mx: 1 }}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No pending payouts found</Typography>
      )}

      {/* ✅ Snackbar Notification */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PendingPayouts;
