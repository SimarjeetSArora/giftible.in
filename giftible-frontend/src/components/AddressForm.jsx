import React, { useState } from "react";
import { Box, TextField, Button, Typography, CircularProgress } from "@mui/material";
import axiosInstance from "../services/axiosInstance";

const AddressForm = ({ onSubmit, onCancel }) => {
  const [address, setAddress] = useState({
    full_name: "",
    contact_number: "",
    address_line: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const fetchCityState = async (pincode) => {
    if (pincode.length === 6) {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = response.data[0];
        if (data.Status === "Success") {
          const { District, State } = data.PostOffice[0];
          setAddress((prev) => ({ ...prev, city: District, state: State }));
        } else {
          alert("❌ Invalid pincode.");
          setAddress((prev) => ({ ...prev, city: "", state: "" }));
        }
      } catch (error) {
        console.error("Error fetching city/state:", error);
        alert("❌ Failed to retrieve location details.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { full_name, contact_number, address_line, pincode, city, state } = address;
    if (!full_name || !contact_number || !address_line || !pincode || !city || !state) {
      return alert("⚠️ Please fill all required fields.");
    }
    onSubmit(address);
    setAddress({
      full_name: "", contact_number: "", address_line: "",
      landmark: "", pincode: "", city: "", state: "",
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: "#6A4C93" }}>Add New Address</Typography>

      <TextField
        name="full_name"
        label="Full Name"
        value={address.full_name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />

      <TextField
        name="contact_number"
        label="Contact Number"
        value={address.contact_number}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />

      <TextField
        name="address_line"
        label="Address Line"
        value={address.address_line}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />

      <TextField
        name="landmark"
        label="Landmark (Optional)"
        value={address.landmark}
        onChange={handleChange}
        fullWidth
        margin="normal"
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
          />

          <TextField
            name="state"
            label="State"
            value={address.state}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
            disabled
          />
        </>
      )}

      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button type="submit" variant="contained" sx={{ bgcolor: "#6A4C93", color: "#FFFFFF" }}>
          Save Address
        </Button>
        <Button variant="outlined" onClick={onCancel} sx={{ borderColor: "#FF4C4C", color: "#FF4C4C" }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default AddressForm;
