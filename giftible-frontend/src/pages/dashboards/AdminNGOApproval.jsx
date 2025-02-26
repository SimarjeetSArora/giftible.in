import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import API_BASE_URL from "../../config";
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
} from "@mui/material";

const REJECTION_REASONS = [
  "Same NGO already exists",
  "NGO license not valid",
  "Incomplete or incorrect information",
  "Suspicious activity detected",
];

const AdminNGOApproval = () => {
  const [ngos, setNgos] = useState([]);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingNGOs();
  }, []);

  const fetchPendingNGOs = () => {
    axiosInstance
      .get(`${API_BASE_URL}/admin/ngos/pending`)
      .then((response) => {
        setNgos(response.data.pending_ngos || []); // Adjusted for structured response
      })
      .catch((error) => {
        console.error("❌ Error fetching NGOs:", error);
        setNgos([]);
      });
  };

  const approveNGO = (ngoId) => {
    axiosInstance
      .post(`${API_BASE_URL}/admin/approve-ngo/${ngoId}`)
      .then(() => {
        alert("✅ NGO Approved Successfully!");
        fetchPendingNGOs(); // Refresh NGO list
      })
      .catch((error) => {
        console.error("❌ Error approving NGO:", error);
        alert("Error approving NGO. Please try again.");
      });
  };

  const handleRejectClick = (ngo) => {
    setSelectedNGO(ngo);
    setDialogOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason) {
      alert("⚠️ Please select a rejection reason.");
      return;
    }

    axiosInstance
      .post(`${API_BASE_URL}/admin/reject-ngo/${selectedNGO.id}`, {
        rejection_reason: rejectionReason,
      })
      .then(() => {
        alert(`🚫 NGO '${selectedNGO.ngo_name}' rejected successfully!`);
        setDialogOpen(false);
        setRejectionReason("");
        fetchPendingNGOs(); // Refresh NGO list
      })
      .catch((error) => {
        console.error("❌ Error rejecting NGO:", error);
        alert("Error rejecting NGO. Please try again.");
      });
  };

  return (
    <div>
      <Typography variant="h4" align="center" gutterBottom>
        NGO Approval List
      </Typography>

      <table border="1" width="100%" cellPadding="10" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>NGO Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Account Number</th>
            <th>IFSC Code</th>
            <th>License</th>
            <th>Logo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ngos.length === 0 ? (
            <tr>
              <td colSpan="9" align="center">No pending NGOs.</td>
            </tr>
          ) : (
            ngos.map((ngo) => (
              <tr key={ngo.id}>
                <td>{ngo.id}</td>
                <td>{ngo.ngo_name}</td>
                <td>{ngo.email}</td>
                <td>{ngo.contact_number}</td>
                <td>{ngo.account_number || "N/A"}</td>
                <td>{ngo.ifsc_code || "N/A"}</td>
                <td>
                  <a
                    href={`${API_BASE_URL}/${ngo.license}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View License
                  </a>
                </td>
                <td>
                  <img
                    src={`${API_BASE_URL}/${ngo.logo}`}
                    alt="NGO Logo"
                    width="80"
                    style={{ borderRadius: "8px" }}
                  />
                </td>
                <td>
                  <Button
                    onClick={() => approveNGO(ngo.id)}
                    variant="contained"
                    color="success"
                    size="small"
                    style={{ marginRight: "5px" }}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleRejectClick(ngo)}
                    variant="contained"
                    color="error"
                    size="small"
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Reject NGO Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Reject NGO - {selectedNGO?.ngo_name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Rejection Reason</InputLabel>
            <Select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              label="Rejection Reason"
            >
              {REJECTION_REASONS.map((reason, index) => (
                <MenuItem key={index} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleRejectSubmit} color="error" variant="contained">
            Reject NGO
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminNGOApproval;
