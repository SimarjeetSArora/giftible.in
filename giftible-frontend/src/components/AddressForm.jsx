import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import axios from "axios";

const AddressForm = ({ onSubmit, onCancel, initialData }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // ✅ Ensure `initialData` is always an object (Fixes TypeError)
  const safeInitialData = initialData || {};

  const [address, setAddress] = useState({
    full_name: safeInitialData.full_name || "",
    contact_number: safeInitialData.contact_number || "",
    address_line: safeInitialData.address_line || "",
    landmark: safeInitialData.landmark || "",
    pincode: safeInitialData.pincode || "",
    city: safeInitialData.city || "",
    state: safeInitialData.state || "",
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    if (initialData) {
      setAddress({
        full_name: initialData.full_name || "",
        contact_number: initialData.contact_number || "",
        address_line: initialData.address_line || "",
        landmark: initialData.landmark || "",
        pincode: initialData.pincode || "",
        city: initialData.city || "",
        state: initialData.state || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact_number") {
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }

    if (name === "pincode") {
      if (!/^\d*$/.test(value) || value.length > 6) return;
    }

    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const fetchCityState = async (pincode) => {
    if (pincode.length === 6) {
      setLoading(true);
      try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = response.data[0];
        if (data.Status === "Success") {
          const { District, State } = data.PostOffice[0];
          setAddress((prev) => ({ ...prev, city: District, state: State }));
        } else {
          setSnackbar({ open: true, message: "❌ Invalid Pincode!", severity: "error" });
          setAddress((prev) => ({ ...prev, city: "", state: "" }));
        }
      } catch (error) {
        setSnackbar({ open: true, message: "❌ Failed to retrieve location details.", severity: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting address:", address);

    const { full_name, contact_number, address_line, pincode, city, state } = address;

    if (!full_name || !contact_number || !address_line || !pincode || !city || !state) {
      return setSnackbar({ open: true, message: "⚠️ Please fill all required fields.", severity: "warning" });
    }

    if (contact_number.length !== 10) {
      return setSnackbar({ open: true, message: "⚠️ Enter a valid 10-digit mobile number.", severity: "warning" });
    }

    if (pincode.length !== 6) {
      return setSnackbar({ open: true, message: "⚠️ Enter a valid 6-digit Pincode.", severity: "warning" });
    }

    onSubmit(address);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, bgcolor: isDarkMode ? "#292929" : "#FFFFFF", borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: isDarkMode ? "#F5B800" : "#6A4C93" }}>
        {initialData?.id ? "Edit Address" : "Add New Address"}
      </Typography>

      <TextField
        name="full_name"
        label="Full Name"
        value={address.full_name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        sx={{ bgcolor: isDarkMode ? "#333" : "#FFF" }}
      />

      <TextField
        name="contact_number"
        label="Contact Number"
        value={address.contact_number}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        inputProps={{ maxLength: 10 }}
        sx={{ bgcolor: isDarkMode ? "#333" : "#FFF" }}
      />

      <TextField
        name="address_line"
        label="Address Line"
        value={address.address_line}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        sx={{ bgcolor: isDarkMode ? "#333" : "#FFF" }}
      />

      <TextField
        name="landmark"
        label="Landmark (Optional)"
        value={address.landmark}
        onChange={handleChange}
        fullWidth
        margin="normal"
        sx={{ bgcolor: isDarkMode ? "#333" : "#FFF" }}
      />

      <TextField
        name="pincode"
        label="Pincode"
        value={address.pincode}
        onChange={(e) => {
          handleChange(e);
          fetchCityState(e.target.value);
        }}
        fullWidth
        margin="normal"
        inputProps={{ maxLength: 6 }}
        required
        sx={{ bgcolor: isDarkMode ? "#333" : "#FFF" }}
      />

      {loading ? (
        <CircularProgress size={24} sx={{ display: "block", margin: "16px auto" }} />
      ) : (
        <>
          <TextField
            name="city"
            label="City"
            value={address.city}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
            disabled
            sx={{ bgcolor: isDarkMode ? "#333" : "#FFF" }}
          />

          <TextField
            name="state"
            label="State"
            value={address.state}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
            disabled
            sx={{ bgcolor: isDarkMode ? "#333" : "#FFF" }}
          />
        </>
      )}

      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button type="submit" variant="contained" sx={{ bgcolor: "#6A4C93", color: "#FFFFFF" }}>
          {initialData?.id ? "Update Address" : "Save Address"}
        </Button>
        <Button variant="outlined" onClick={onCancel} sx={{ borderColor: "#FF4C4C", color: "#FF4C4C" }}>
          Cancel
        </Button>
      </Box>

      {/* 🔔 Snackbar Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddressForm;
